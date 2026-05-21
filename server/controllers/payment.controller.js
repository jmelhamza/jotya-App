import fetch from 'node-fetch';
import Payment from '../models/payment.model.js';
import Product from '../models/product.model.js';
import User from '../models/user.model.js';

// ─── Prices (MAD) ─────────────────────────────────────────────────────────────
const PRICES = {
  reveal_seller:   20,
  publish_product: 35,
};

const MAD_TO_USD = 0.10;
const toUSD = (mad) => (mad * MAD_TO_USD).toFixed(2);

// ─── Check env vars ───────────────────────────────────────────────────────────
const checkPayPalEnv = () => {
  const missing = [];
  if (!process.env.PAYPAL_BASE_URL)      missing.push('PAYPAL_BASE_URL');
  if (!process.env.PAYPAL_CLIENT_ID)     missing.push('PAYPAL_CLIENT_ID');
  if (!process.env.PAYPAL_CLIENT_SECRET) missing.push('PAYPAL_CLIENT_SECRET');
  if (!process.env.CLIENT_URL)           missing.push('CLIENT_URL');
  return missing;
};

// ─── Get PayPal access token ──────────────────────────────────────────────────
const getPayPalToken = async () => {
  const missing = checkPayPalEnv();
  if (missing.length > 0) {
    throw new Error(`Variables d'environnement PayPal manquantes: ${missing.join(', ')}`);
  }

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

  if (!data.access_token) {
    console.error('PayPal token error:', JSON.stringify(data));
    throw new Error(`Impossible d'obtenir un token PayPal: ${data.error_description || data.error || 'Vérifiez vos clés PayPal'}`);
  }

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
  const amountUSD = toUSD(amountMAD);

  try {
    if (productId) {
      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ message: 'Produit introuvable.' });

      if (type === 'reveal_seller' && product.seller.toString() === payerId) {
        return res.status(400).json({ message: "C'est votre propre produit." });
      }

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
          amount: { currency_code: 'USD', value: amountUSD },
          description: descriptions[type],
          custom_id: JSON.stringify({ type, productId: productId || null, payerId }),
        }],
        application_context: {
          brand_name: 'Jotya',
          user_action: 'PAY_NOW',
          return_url: `${process.env.CLIENT_URL}/paiement/success`,
          cancel_url:  `${process.env.CLIENT_URL}/paiement/cancel`,
        },
      }),
    });

    const ppOrder = await ppRes.json();

    if (!ppOrder.id) {
      console.error('PayPal create order error:', JSON.stringify(ppOrder));
      return res.status(500).json({
        message: `Erreur PayPal: ${ppOrder.message || ppOrder.error || 'Réponse inattendue'}`,
      });
    }

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
      amountUSD,
    });
  } catch (error) {
    console.error('createPaypalOrder error:', error.message);
    res.status(500).json({ message: error.message || 'Erreur serveur.' });
  }
};

// ─── CAPTURE PayPal order ─────────────────────────────────────────────────────
export const capturePaypalOrder = async (req, res) => {
  const { paypalOrderId } = req.body;
  const payerId = req.user.id;

  if (!paypalOrderId) return res.status(400).json({ message: 'paypalOrderId obligatoire.' });

  try {
    const existingPayment = await Payment.findOne({ paypalOrderId });
    if (existingPayment && existingPayment.status === 'completed') {
      return res.status(200).json({ success: true, payment: existingPayment, alreadyCaptured: true });
    }

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
    console.log('PayPal capture response:', JSON.stringify(captureData));

    if (captureData.status !== 'COMPLETED') {
      await Payment.findOneAndUpdate(
        { paypalOrderId },
        { paypalStatus: captureData.status || 'UNKNOWN', status: 'failed' }
      );
      const reason = captureData.details?.[0]?.description || captureData.message || 'Paiement non complété.';
      return res.status(400).json({ message: reason, details: captureData });
    }

    // Search by paypalOrderId ONLY — pas par payer pour éviter les mismatches
    const payment = await Payment.findOneAndUpdate(
      { paypalOrderId },
      { paypalStatus: 'COMPLETED', status: 'completed', payer: payerId },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({ message: 'Paiement introuvable en base. Contactez le support.' });
    }

    if (payment.type === 'publish_product' && payment.product) {
      await Product.findByIdAndUpdate(payment.product, {
        approvalStatus: 'approved',
        publishOption: 'paid_flat',
      });
    }

    res.status(200).json({ success: true, payment });
  } catch (error) {
    console.error('capturePaypalOrder error:', error.message);
    res.status(500).json({ message: error.message || 'Erreur serveur.' });
  }
};

// ─── CHECK access ─────────────────────────────────────────────────────────────
export const checkRevealAccess = async (req, res) => {
  const { productId } = req.params;
  const payerId = req.user.id;
  try {
    const payment = await Payment.findOne({
      payer: payerId, type: 'reveal_seller',
      product: productId, status: 'completed',
    });
    res.status(200).json({ success: true, hasAccess: !!payment });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// ─── GET seller info ──────────────────────────────────────────────────────────
export const getSellerInfo = async (req, res) => {
  const { productId } = req.params;
  const payerId = req.user.id;
  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Produit introuvable.' });

    if (product.seller.toString() === payerId || req.user.role === 'admin') {
      const seller = await User.findById(product.seller).select('name phone whatsapp facebook shopName email');
      return res.status(200).json({ success: true, seller });
    }

    const payment = await Payment.findOne({
      payer: payerId, type: 'reveal_seller',
      product: productId, status: 'completed',
    });

    if (!payment) {
      return res.status(403).json({
        message: 'Payez 20 DH pour voir les coordonnées du vendeur.',
        requiresPayment: true,
      });
    }

    const seller = await User.findById(product.seller).select('name phone whatsapp facebook shopName email');
    res.status(200).json({ success: true, seller });
  } catch (error) {
    console.error('getSellerInfo error:', error.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// ─── GET payment status ───────────────────────────────────────────────────────
export const getPaymentStatus = async (req, res) => {
  const { paypalOrderId } = req.params;
  try {
    const payment = await Payment.findOne({ paypalOrderId });
    if (!payment) return res.status(404).json({ message: 'Paiement introuvable.' });
    res.status(200).json({ success: true, paypalStatus: payment.paypalStatus, status: payment.status });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// ─── ADMIN: all payments ──────────────────────────────────────────────────────
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