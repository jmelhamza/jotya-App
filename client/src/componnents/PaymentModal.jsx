import React, { useState, useRef } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

// ── Contact info ─────────────────────────────────────────────
const WHATSAPP    = '0639691765';
const CASHPLUS    = 'Jmel Hamza';
const WA_LINK     = `https://wa.me/212${WHATSAPP.slice(1)}`;

const PaymentModal = ({ type, productId, amount, label, onSuccess, onClose }) => {
  const [step, setStep]         = useState('instructions'); // instructions | upload | pending | success | error
  const [receipt, setReceipt]   = useState(null);
  const [preview, setPreview]   = useState(null);
  const [note, setNote]         = useState('');
  const [loading, setLoading]   = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const inputRef = useRef(null);

  const handleFilePick = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setReceipt(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!receipt) { setErrorMsg('Veuillez joindre une photo du reçu.'); return; }
    setLoading(true);
    setErrorMsg('');
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('type',       type);
      formData.append('productId',  productId || '');
      formData.append('note',       note);
      formData.append('receipt',    receipt);

      await axios.post(`${API_BASE_URL}/api/payments/submit`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setStep('pending');
    } catch (err) {
      if (err.response?.data?.alreadyPaid) { onSuccess(); return; }
      setErrorMsg(err.response?.data?.message || 'Erreur lors de l\'envoi. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.overlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={S.modal}>

        {/* ── Step 1: Instructions ── */}
        {step === 'instructions' && (
          <>
            <h2 style={S.title}>💳 Paiement manuel</h2>
            <p style={S.subtitle}>{label}</p>

            <div style={S.priceBox}>
              <span style={S.priceLabel}>Montant à envoyer</span>
              <span style={S.price}>{amount} DH</span>
            </div>

            {/* CashPlus instructions */}
            <div style={S.stepBox}>
              <p style={S.stepTitle}>📍 Comment payer via CashPlus</p>
              <ol style={S.ol}>
                <li>Va dans n'importe quelle agence <strong>CashPlus</strong> près de chez toi</li>
                <li>Dis à l'agent : <em>"Je veux envoyer {amount} DH"</em></li>
                <li>Donne le nom du bénéficiaire : <strong style={{ color: '#c0542a' }}>{CASHPLUS}</strong></li>
                <li>Garde bien le <strong>reçu papier</strong> qu'ils te donnent</li>
                <li>Prends une photo claire du reçu</li>
              </ol>
            </div>

            {/* WhatsApp shortcut */}
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" style={S.waBtn}>
              💬 Contacter sur WhatsApp — {WHATSAPP}
            </a>

            <button onClick={() => setStep('upload')} style={S.btnMain}>
              J'ai payé → Envoyer mon reçu
            </button>
            <button onClick={onClose} style={S.btnCancel}>Annuler</button>
          </>
        )}

        {/* ── Step 2: Upload receipt ── */}
        {step === 'upload' && (
          <>
            <h2 style={S.title}>📎 Envoyer le reçu</h2>
            <p style={S.subtitle}>Joignez une photo claire de votre reçu CashPlus</p>

            {/* Receipt preview / picker */}
            <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFilePick} />

            {preview ? (
              <div style={{ position: 'relative', marginBottom: '16px' }}>
                <img src={preview} alt="reçu" style={S.previewImg} />
                <button
                  onClick={() => { setReceipt(null); setPreview(null); }}
                  style={S.removeBtn}
                >✕ Changer</button>
              </div>
            ) : (
              <button onClick={() => inputRef.current?.click()} style={S.uploadZone}>
                <span style={{ fontSize: '2rem' }}>📷</span>
                <span style={{ fontSize: '13px', color: '#8a6a4a' }}>Appuyez pour choisir une photo</span>
              </button>
            )}

            {/* Optional note */}
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Note optionnelle (ex: numéro de transaction)"
              style={S.textarea}
              rows={2}
            />

            {errorMsg && <p style={S.error}>{errorMsg}</p>}

            <button onClick={handleSubmit} disabled={loading || !receipt} style={{
              ...S.btnMain,
              opacity: (!receipt || loading) ? 0.6 : 1,
              cursor:  (!receipt || loading) ? 'not-allowed' : 'pointer',
            }}>
              {loading ? 'Envoi en cours...' : 'Envoyer la demande →'}
            </button>
            <button onClick={() => setStep('instructions')} style={S.btnCancel}>← Retour</button>
          </>
        )}

        {/* ── Step 3: Pending validation ── */}
        {step === 'pending' && (
          <div style={S.center}>
            <div style={{ fontSize: '52px' }}>⏳</div>
            <h3 style={{ margin: '16px 0 8px', color: '#92400e' }}>Demande envoyée !</h3>
            <p style={{ color: '#6b4c2a', fontSize: '14px', lineHeight: '1.7', margin: '0 0 20px' }}>
              Votre reçu a été reçu.<br />
              <strong>L'admin va vérifier et confirmer</strong> votre paiement dans les <strong>24h</strong>.<br />
              Vous recevrez l'accès dès confirmation.
            </p>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" style={{ ...S.waBtn, display: 'block', marginBottom: '12px' }}>
              💬 Suivre sur WhatsApp — {WHATSAPP}
            </a>
            <button onClick={onClose} style={S.btnMain}>Fermer</button>
          </div>
        )}

      </div>
    </div>
  );
};

const S = {
  overlay:    { position: 'fixed', inset: 0, background: 'rgba(10,6,2,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(3px)', padding: '16px' },
  modal:      { background: '#faf6ed', borderRadius: '8px', padding: '28px 24px', width: '100%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.25)', border: '1.5px solid rgba(107,76,42,0.2)', maxHeight: '90vh', overflowY: 'auto' },
  title:      { fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic', fontSize: '1.4rem', margin: '0 0 4px', color: '#2c1a0e' },
  subtitle:   { fontSize: '13px', color: '#8a6a4a', margin: '0 0 18px', fontFamily: 'Georgia, serif' },
  priceBox:   { display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(201,152,58,0.1)', border: '1px solid rgba(201,152,58,0.4)', borderRadius: '6px', padding: '12px 16px', marginBottom: '16px' },
  priceLabel: { color: '#6b4c2a', fontWeight: '600', fontSize: '13px' },
  price:      { fontSize: '1.6rem', fontWeight: '800', color: '#c0542a', fontFamily: "'Special Elite', monospace" },
  stepBox:    { background: '#fff', border: '1px solid rgba(107,76,42,0.15)', borderRadius: '6px', padding: '14px 16px', marginBottom: '16px' },
  stepTitle:  { fontWeight: '700', fontSize: '13px', margin: '0 0 10px', color: '#2c1a0e' },
  ol:         { margin: 0, paddingLeft: '18px', fontSize: '13px', color: '#5a4030', lineHeight: '2' },
  waBtn:      { display: 'block', textAlign: 'center', background: '#25d366', color: '#fff', padding: '11px', borderRadius: '6px', textDecoration: 'none', fontWeight: '700', fontSize: '13px', marginBottom: '12px', letterSpacing: '0.03em' },
  btnMain:    { width: '100%', padding: '13px', background: '#c0542a', color: '#fff', border: '2px solid #6b4c2a', borderRadius: '4px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', marginBottom: '10px', fontFamily: "'Special Elite', monospace", letterSpacing: '0.06em' },
  btnCancel:  { width: '100%', padding: '11px', background: 'none', border: '1px solid rgba(107,76,42,0.25)', borderRadius: '4px', fontSize: '13px', color: '#8a6a4a', cursor: 'pointer' },
  uploadZone: { width: '100%', border: '2px dashed rgba(107,76,42,0.3)', borderRadius: '6px', background: 'rgba(201,152,58,0.05)', padding: '28px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '14px' },
  previewImg: { width: '100%', maxHeight: '220px', objectFit: 'contain', borderRadius: '6px', border: '1.5px solid rgba(201,152,58,0.4)', display: 'block' },
  removeBtn:  { position: 'absolute', top: '8px', right: '8px', background: '#c0542a', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer', fontWeight: '700' },
  textarea:   { width: '100%', border: '1.5px solid rgba(107,76,42,0.25)', borderRadius: '4px', padding: '10px', fontSize: '13px', fontFamily: 'Georgia, serif', color: '#2c1a0e', background: '#fff', resize: 'none', marginBottom: '14px', boxSizing: 'border-box' },
  error:      { color: '#c0542a', fontSize: '13px', margin: '-8px 0 12px', fontWeight: '600' },
  center:     { textAlign: 'center' },
};

export default PaymentModal;