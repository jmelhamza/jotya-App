import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { CartProvider } from './context/CartContext.jsx';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';

console.log("PAYPAL CLIENT:", import.meta.env.VITE_PAYPAL_CLIENT_ID); // ✅ خاصها تبان هنا

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <CartProvider>
      <PayPalScriptProvider
        options={{
          "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID,
          currency: "USD"
        }}
      >
        <App />
      </PayPalScriptProvider>
    </CartProvider>
  </BrowserRouter>
);
