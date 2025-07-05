import checkoutNodeJssdk from '@paypal/checkout-server-sdk';
import dotenv from 'dotenv';

dotenv.config();

const Environment =
  process.env.NODE_ENV === 'production'
    ? checkoutNodeJssdk.core.LiveEnvironment
    : checkoutNodeJssdk.core.SandboxEnvironment;

const paypalClient = new checkoutNodeJssdk.core.PayPalHttpClient(
  new Environment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET
  )
);

export { paypalClient };
