import fetch from 'node-fetch';
import Payment from '../models/payment.model.js';
import Product from '../models/product.model.js';
import User from '../models/user.model.js';

// ─── Prices (MAD) ─────────────────────────────────────────────────────────────
const PRICES = {
  reveal_seller:   20,   // buyer pays to see seller contact info
  publish_product: 35,   // seller pays to publish a product (flat fee)
};

// PayPal converts MAD → EUR (approximate, update as needed)
// PayPal Sandbox doesn't support MAD — we use EUR equivalent
const MAD_TO_EUR = 0.092; // 1 MAD ≈ 0.092 EUR

const toEUR = (mad) => (mad * MAD_TO_EUR).toFixed(2);

// ─── Get PayPal access token ──────────────────────────────────────────────────
const getPayPalToken = async () => {
  const res = await fetch(
    `${process.env.PAYPAL_BASE_URL}/v1/oauth2/token`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(
          `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
        ).toString('base64')}`,
      },
      body: 'grant_type=client_credentials',
    }
  );
  const data = await res.json();
  return data.access_token;
};

// ─── CREATE PayPal order ──────────────────────────────────────────────────────
export const createPaypalOrder = async (req, res) => {
  const { type, productId } = req.body;
  const payerId = req.user.id;

  if (!['reveal_seller', 'publish_product'].includes(type)) {
    return res.status(400).json({ message: 'Type de paiement invalide.' });
  }

  const amountMAD = PRICES[type];
  const amountEUR = toEUR(amountMAD);

  try {
    // Validate product exists
    if (productId) {
      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ message: 'Produit introuvable.' });

      // Buyer can't reveal info for their own product
      if (type === 'reveal_seller' && product.seller.toString() === payerId) {
        return res.status(400).json({ message: "C'est votre propre produit." });
      }

      // Check if buyer already paid for this product
      if (type === 'reveal_seller') {
        const existing = await Payment.findOne({
          payer: payerId, type: 'reveal_seller',
          product: productId, status: 'completed',
        });
        if (existing) {
          return res.status(400).json({ message: 'Vous avez déjà accès aux coordonnées de ce vendeur.', alreadyPaid: true });
        }
      }
    }

    const accessToken = await getPayPalToken();

    const descriptions = {
      reveal_seller:   `Jotya — Voir les coordonnées du vendeur`,
      publish_product: `Jotya — Publication de produit`,
    };

    const ppRes = await fetch(`${process.env.PAYPAL_BASE_URL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: { currency_code: 'EUR', value: amountEUR },
          description: descriptions[type],
          custom_id: JSON.stringify({ type, productId: productId || null, payerId }),
        }],
        application_context: {
          brand_name: 'Jotya',
          user_action: 'PAY_NOW',
          return_url: `${process.env.CLIENT_URL}/paiement/success`,
          cancel_url: `${process.env.CLIENT_URL}/paiement/cancel`,
        },
      }),
    });

    const ppOrder = await ppRes.json();

    if (!ppOrder.id) {
      console.error('PayPal error:', ppOrder);
      return res.status(500).json({ message: 'Erreur PayPal lors de la création.' });
    }

    // Save pending payment
    const payment = new Payment({
      payer: payerId,
      type,
      product: productId || null,
      amount: amountMAD,
      paypalOrderId: ppOrder.id,
      paypalStatus: 'CREATED',
      status: 'pending',
    });
    await payment.save();

    res.status(201).json({
      success: true,
      paypalOrderId: ppOrder.id,
      approvalUrl: ppOrder.links.find(l => l.rel === 'approve')?.href,
      amountMAD,
      amountEUR,
    });
  } catch (error) {
    console.error('createPaypalOrder error:', error.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// ─── CAPTURE PayPal order (after buyer approves) ──────────────────────────────
export const capturePaypalOrder = async (req, res) => {
  const { paypalOrderId } = req.body;
  const payerId = req.user.id;

  if (!paypalOrderId) return res.status(400).json({ message: 'paypalOrderId obligatoire.' });

  try {
    const accessToken = await getPayPalToken();

    const captureRes = await fetch(
      `${process.env.PAYPAL_BASE_URL}/v2/checkout/orders/${paypalOrderId}/capture`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const captureData = await captureRes.json();

    if (captureData.status !== 'COMPLETED') {
      await Payment.findOneAndUpdate(
        { paypalOrderId },
        { paypalStatus: captureData.status, status: 'failed' }
      );
      return res.status(400).json({ message: 'Paiement non complété.', details: captureData });
    }

    // Update payment record
    const payment = await Payment.findOneAndUpdate(
      { paypalOrderId, payer: payerId },
      { paypalStatus: 'COMPLETED', status: 'completed' },
      { new: true }
    );

    if (!payment) return res.status(404).json({ message: 'Paiement introuvable.' });

    // ── Post-payment actions ──────────────────────────────────────────────────

    // If seller paid to publish → approve the product automatically
    if (payment.type === 'publish_product' && payment.product) {
      await Product.findByIdAndUpdate(payment.product, {
        approvalStatus: 'approved',
        publishOption: 'paid_flat',
      });
    }

    // If buyer paid to reveal seller info → nothing extra needed
    // Frontend will call /api/payments/seller-info/:productId to get the info

    res.status(200).json({ success: true, payment });
  } catch (error) {
    console.error('capturePaypalOrder error:', error.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// ─── CHECK if buyer already paid to reveal seller info ───────────────────────
export const checkRevealAccess = async (req, res) => {
  const { productId } = req.params;
  const payerId = req.user.id;

  try {
    const payment = await Payment.findOne({
      payer: payerId,
      type: 'reveal_seller',
      product: productId,
      status: 'completed',
    });
    res.status(200).json({ success: true, hasAccess: !!payment });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// ─── GET seller contact info (only if buyer paid) ────────────────────────────
export const getSellerInfo = async (req, res) => {
  const { productId } = req.params;
  const payerId = req.user.id;

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Produit introuvable.' });

    // Owner can always see their own info
    if (product.seller.toString() === payerId) {
      const seller = await User.findById(product.seller).select('name phone whatsapp facebook shopName email');
      return res.status(200).json({ success: true, seller });
    }

    // Check payment
    const payment = await Payment.findOne({
      payer: payerId,
      type: 'reveal_seller',
      product: productId,
      status: 'completed',
    });

    if (!payment) {
      return res.status(403).json({
        message: 'Payez 20 DH pour voir les coordonnées du vendeur.',
        requiresPayment: true,
      });
    }

    const seller = await User.findById(product.seller)
      .select('name phone whatsapp facebook shopName email');

    res.status(200).json({ success: true, seller });
  } catch (error) {
    console.error('getSellerInfo error:', error.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// ─── ADMIN: get all payments ──────────────────────────────────────────────────
export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .sort({ createdAt: -1 })
      .populate('payer', 'name email')
      .populate('product', 'title price');
    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};