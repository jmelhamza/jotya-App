import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

/**
 * PaymentModal
 * Props:
 *   type       — 'reveal_seller' | 'publish_product'
 *   productId  — product._id (required)
 *   amount     — amount in MAD (20 or 35)
 *   label      — display label
 *   onSuccess  — callback after successful payment
 *   onClose    — callback to close modal
 */
const PaymentModal = ({ type, productId, amount, label, onSuccess, onClose }) => {
  const [step, setStep] = useState('confirm'); // confirm | processing | success | error
  const [errorMsg, setErrorMsg] = useState('');
  const [paypalWindow, setPaypalWindow] = useState(null);

  const handlePay = async () => {
    setStep('processing');
    setErrorMsg('');

    try {
      const token = localStorage.getItem('token');

      // 1 — Create PayPal order
      const createRes = await axios.post(
        `${API_BASE_URL}/api/payments/create`,
        { type, productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { paypalOrderId, approvalUrl } = createRes.data;

      if (!approvalUrl) throw new Error('URL PayPal introuvable.');

      // 2 — Open PayPal approval in a popup
      const popup = window.open(approvalUrl, 'paypal_popup', 'width=600,height=700,left=300,top=100');
      setPaypalWindow(popup);

      // 3 — Poll until popup closes
      const timer = setInterval(async () => {
        if (!popup || popup.closed) {
          clearInterval(timer);
          // 4 — Capture the payment
          try {
            await axios.post(
              `${API_BASE_URL}/api/payments/capture`,
              { paypalOrderId },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            setStep('success');
            setTimeout(() => onSuccess(), 1500);
          } catch (captureErr) {
            const msg = captureErr.response?.data?.message || 'Paiement non confirmé. Réessayez.';
            setErrorMsg(msg);
            setStep('error');
          }
        }
      }, 1000);

    } catch (err) {
      const msg = err.response?.data?.message || 'Erreur lors de la création du paiement.';
      if (err.response?.data?.alreadyPaid) {
        onSuccess(); // Already paid — just reveal
        return;
      }
      setErrorMsg(msg);
      setStep('error');
    }
  };

  return (
    <div style={styles.overlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={styles.modal}>

        {step === 'confirm' && (
          <>
            <h2 style={styles.title}>🔓 Débloquer les coordonnées</h2>
            <p style={styles.subtitle}>{label}</p>

            <div style={styles.priceBox}>
              <span style={styles.priceLabel}>Montant :</span>
              <span style={styles.price}>{amount} DH</span>
            </div>

            <div style={styles.infoBox}>
              <p style={{ margin: 0, fontSize: '13px', color: '#555', lineHeight: '1.6' }}>
                ✅ Paiement sécurisé via PayPal<br />
                ✅ Accès immédiat après paiement<br />
                ✅ Numéro de téléphone + WhatsApp + email
              </p>
            </div>

            <button onClick={handlePay} style={styles.btnPaypal}>
              <img src="https://www.paypalobjects.com/webstatic/mktg/Logo/pp-logo-100px.png" alt="PayPal" style={{ height: '20px', marginRight: '8px', verticalAlign: 'middle' }} />
              Payer {amount} DH avec PayPal
            </button>

            <button onClick={onClose} style={styles.btnCancel}>Annuler</button>
          </>
        )}

        {step === 'processing' && (
          <div style={styles.center}>
            <div style={styles.spinner} />
            <p style={{ marginTop: '20px', color: '#555' }}>
              En attente de votre paiement PayPal...
            </p>
            <p style={{ fontSize: '13px', color: '#aaa' }}>
              Complétez le paiement dans la fenêtre PayPal ouverte.
            </p>
          </div>
        )}

        {step === 'success' && (
          <div style={styles.center}>
            <div style={{ fontSize: '52px' }}>✅</div>
            <h3 style={{ margin: '16px 0 8px', color: '#166534' }}>Paiement réussi !</h3>
            <p style={{ color: '#555', fontSize: '14px' }}>Les coordonnées du vendeur s'affichent maintenant.</p>
          </div>
        )}

        {step === 'error' && (
          <div style={styles.center}>
            <div style={{ fontSize: '48px' }}>❌</div>
            <h3 style={{ margin: '16px 0 8px', color: '#991b1b' }}>Paiement échoué</h3>
            <p style={{ color: '#555', fontSize: '14px', marginBottom: '20px' }}>{errorMsg}</p>
            <button onClick={() => setStep('confirm')} style={styles.btnPaypal}>Réessayer</button>
            <button onClick={onClose} style={styles.btnCancel}>Fermer</button>
          </div>
        )}

      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 9999,
    backdropFilter: 'blur(2px)',
  },
  modal: {
    background: '#fff',
    borderRadius: '16px',
    padding: '32px',
    width: '100%',
    maxWidth: '420px',
    margin: '0 16px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  },
  title: {
    fontSize: '20px',
    fontWeight: '800',
    margin: '0 0 6px',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: '14px',
    color: '#777',
    margin: '0 0 20px',
  },
  priceBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: '#fafafa',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    padding: '14px 18px',
    marginBottom: '16px',
  },
  priceLabel: { color: '#555', fontWeight: '500' },
  price: { fontSize: '24px', fontWeight: '800', color: '#e63946' },
  infoBox: {
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '10px',
    padding: '12px 16px',
    marginBottom: '20px',
  },
  btnPaypal: {
    width: '100%',
    padding: '14px',
    background: '#0070ba',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    marginBottom: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCancel: {
    width: '100%',
    padding: '12px',
    background: 'none',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: '14px',
    color: '#888',
    cursor: 'pointer',
  },
  center: {
    textAlign: 'center',
    padding: '10px 0',
  },
  spinner: {
    width: '44px',
    height: '44px',
    border: '4px solid #e5e7eb',
    borderTop: '4px solid #0070ba',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    margin: '0 auto',
  },
};

// Add spinner animation
const styleEl = document.createElement('style');
styleEl.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
document.head.appendChild(styleEl);

export default PaymentModal;