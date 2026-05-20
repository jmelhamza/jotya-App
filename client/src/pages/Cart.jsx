import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const Cart = () => {
  const { cartItems, removeFromCart, clearCart, totalPrice } = useContext(CartContext);
  const { isLoggedIn } = useAuth();

  // Not logged in
  if (!isLoggedIn) {
    return (
      <div style={styles.center}>
        <div style={styles.emptyBox}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔒</div>
          <h2 style={{ margin: '0 0 8px' }}>Connexion requise</h2>
          <p style={{ color: '#888', marginBottom: '20px' }}>
            Vous devez être connecté pour accéder à votre panier.
          </p>
          <Link to="/connexion" style={styles.btn}>Se connecter</Link>
        </div>
      </div>
    );
  }

  // Empty cart
  if (cartItems.length === 0) {
    return (
      <div style={styles.center}>
        <div style={styles.emptyBox}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🛒</div>
          <h2 style={{ margin: '0 0 8px' }}>Votre panier est vide</h2>
          <p style={{ color: '#888', marginBottom: '20px' }}>
            Parcourez nos produits et ajoutez ce qui vous plaît.
          </p>
          <Link to="/produits" style={styles.btn}>Voir les produits</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>Mon panier</h2>

      <div style={styles.grid}>
        {/* ITEMS */}
        <div style={styles.items}>
          {cartItems.map(item => (
            <div key={item._id} style={styles.card}>
              {item.image?.[0] && (
                <img
                  src={`${API_BASE_URL}${item.image[0]}`}
                  alt={item.title}
                  style={styles.img}
                />
              )}
              <div style={styles.info}>
                <p style={styles.itemTitle}>{item.title}</p>
                <p style={styles.itemPrice}>{item.price} MAD × {item.quantity}</p>
                <p style={styles.itemTotal}>{(item.price * item.quantity).toLocaleString()} MAD</p>
              </div>
              <button
                style={styles.removeBtn}
                onClick={() => removeFromCart(item._id)}
                title="Retirer"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* SUMMARY */}
        <div style={styles.summary}>
          <h3 style={{ margin: '0 0 16px', fontSize: '18px' }}>Récapitulatif</h3>
          <div style={styles.summaryRow}>
            <span>Articles ({cartItems.reduce((s, i) => s + i.quantity, 0)})</span>
            <span>{totalPrice.toLocaleString()} MAD</span>
          </div>
          <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '14px 0' }} />
          <div style={{ ...styles.summaryRow, fontWeight: '700', fontSize: '18px' }}>
            <span>Total</span>
            <span style={{ color: '#f97316' }}>{totalPrice.toLocaleString()} MAD</span>
          </div>

          <button style={styles.checkoutBtn}>
            Passer commande
          </button>
          <button style={styles.clearBtn} onClick={clearCart}>
            Vider le panier
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    maxWidth: '1000px',
    margin: '40px auto',
    padding: '0 20px',
    fontFamily: "'Segoe UI', sans-serif",
  },
  title: {
    fontSize: '26px',
    fontWeight: '700',
    marginBottom: '28px',
    color: '#1a1a1a',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 320px',
    gap: '24px',
    alignItems: 'start',
  },
  items: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  card: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    background: '#fff',
    border: '1px solid #eee',
    borderRadius: '12px',
    padding: '14px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
  },
  img: {
    width: '80px',
    height: '80px',
    objectFit: 'cover',
    borderRadius: '8px',
    flexShrink: 0,
  },
  info: {
    flex: 1,
  },
  itemTitle: {
    margin: '0 0 4px',
    fontWeight: '600',
    fontSize: '15px',
    color: '#222',
  },
  itemPrice: {
    margin: '0 0 2px',
    fontSize: '13px',
    color: '#888',
  },
  itemTotal: {
    margin: 0,
    fontWeight: '700',
    fontSize: '15px',
    color: '#f97316',
  },
  removeBtn: {
    background: 'none',
    border: '1px solid #eee',
    borderRadius: '6px',
    width: '30px',
    height: '30px',
    cursor: 'pointer',
    color: '#999',
    fontSize: '13px',
    flexShrink: 0,
  },
  summary: {
    background: '#fff',
    border: '1px solid #eee',
    borderRadius: '14px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    position: 'sticky',
    top: '80px',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '15px',
    color: '#444',
  },
  checkoutBtn: {
    width: '100%',
    padding: '13px',
    marginTop: '20px',
    background: '#f97316',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  clearBtn: {
    width: '100%',
    padding: '11px',
    marginTop: '10px',
    background: 'none',
    color: '#e63946',
    border: '1px solid #e63946',
    borderRadius: '10px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  center: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '60vh',
  },
  emptyBox: {
    textAlign: 'center',
    padding: '40px',
  },
  btn: {
    display: 'inline-block',
    padding: '11px 24px',
    background: '#f97316',
    color: '#fff',
    borderRadius: '9px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '15px',
  },
};

export default Cart;