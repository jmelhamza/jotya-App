// routes/paypal.routes.js
import express from 'express';
import { paypalClient } from '../utils/paypalClient.js';

import checkoutNodeJssdk from '@paypal/checkout-server-sdk';

const router = express.Router();

router.post('/create-order', async (req, res) => {
  const { items, total } = req.body;

  const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
  request.prefer('return=representation');
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [{
      amount: {
        currency_code: 'USD',
        value: total.toFixed(2),
        breakdown: {
          item_total: { currency_code: 'USD', value: total.toFixed(2) }
        }
      },
      items: items.map(item => ({
        name: item.title,
        unit_amount: { currency_code: 'USD', value: item.price.toFixed(2) },
        quantity: item.quantity.toString(),
      }))
    }]
  });

  try {
    const order = await client().execute(request);
    res.json({ id: order.result.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la création de la commande PayPal' });
  }
});

router.post('/capture-order/:orderId', async (req, res) => {
  const { orderId } = req.params;
  const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderId);
  request.requestBody({});

  try {
    const capture = await client().execute(request);
    res.json({ status: 'success', capture: capture.result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la capture de la commande' });
  }
});

export default router;
