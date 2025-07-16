import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext.jsx';
import { PayPalButtons } from '@paypal/react-paypal-js';
import '../styles/Cart.css';

// ✅ أضف هذا السطر في الأعلى لاستخدام المتغير البيئي
const API_BASE_URL = import.meta.env.VITE_API_URL;

const Cart = () => {
  const { cartItems, removeFromCart, totalPrice } = useContext(CartContext);
  const exchangeRate = 0.1; // 💵 1 MAD ≈ 0.1 USD (يمكنك تحديثه حسب السوق)
  const totalUSD = (totalPrice * exchangeRate).toFixed(2);

  return (
    <div className="cart-container">
      <h2>Votre panier</h2>

      {cartItems.length === 0 ? (
        <p className="empty-message">Votre panier est vide.</p>
      ) : (
        <div className="cart-content">
          {cartItems.map(item => (
            <div key={item._id} className="cart-item">
              <img
                // ✅ تم تعديل رابط الصورة
                src={`${API_BASE_URL}${item.image[0]}`}
                alt={item.title}
                className="cart-item-image"
              />
              <div className="cart-item-info">
                <h3>{item.title}</h3>
                <p>{item.price} MAD x {item.quantity}</p>
                <button onClick={() => removeFromCart(item._id)}>Supprimer</button>
              </div>
            </div>
          ))}

          <div className="cart-total">
            <h3>Total : {totalPrice} MAD</h3>
            <h4>À payer (USD): {totalUSD} $</h4>

            {/* ✅ PayPal button */}
            <PayPalButtons
              style={{ layout: 'vertical', color: 'blue', shape: 'pill', label: 'pay' }}
              createOrder={(data, actions) => {
                return actions.order.create({
                  purchase_units: [{
                    amount: {
                      value: totalUSD,
                      currency_code: "USD" // 🧠 ضروري تحديد العملة
                    }
                  }]
                });
              }}
              onApprove={(data, actions) => {
                return actions.order.capture().then(details => {
                  alert(`Paiement effectué par ${details.payer.name.given_name}`);
                });
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;