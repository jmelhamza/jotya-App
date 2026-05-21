import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import PaymentModal from '../componnents/PaymentModal';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();

  const [product, setProduct]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [selectedImg, setSelectedImg] = useState(0);

  // Seller info state
  const [sellerInfo, setSellerInfo]     = useState(null);
  const [hasAccess, setHasAccess]       = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);

  // ─── Fetch product ────────────────────────────────────────────────────────
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/products/${id}`);
        setProduct(res.data.data || res.data);
      } catch {
        // fallback: fetch all and find
        try {
          const res = await axios.get(`${API_BASE_URL}/api/products`);
          const found = (res.data.data || res.data).find(p => p._id === id);
          if (found) setProduct(found);
          else setError('Produit introuvable.');
        } catch {
          setError('Erreur lors du chargement.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  // ─── Check if buyer already paid ─────────────────────────────────────────
  const checkAccess = useCallback(async () => {
    if (!isLoggedIn || !id) return;
    setCheckingAccess(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/payments/access/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.hasAccess) {
        setHasAccess(true);
        fetchSellerInfo();
      }
    } catch {}
    finally { setCheckingAccess(false); }
  }, [id, isLoggedIn]);

  useEffect(() => { checkAccess(); }, [checkAccess]);

  const fetchSellerInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/payments/seller-info/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSellerInfo(res.data.seller);
      setHasAccess(true);
    } catch {}
  };

  // Called after successful PayPal payment
  const handlePaymentSuccess = () => {
    setShowPayModal(false);
    setHasAccess(true);
    fetchSellerInfo();
  };

  if (loading) return <p style={{ padding: '40px', textAlign: 'center' }}>Chargement...</p>;
  if (error)   return <p style={{ padding: '40px', textAlign: 'center', color: 'red' }}>{error}</p>;
  if (!product) return null;

  const isSold       = product.status === 'Vendu';
  const myId         = user?.id || user?._id;
  const isOwnProduct = myId && product.seller && (
    (product.seller._id || product.seller).toString() === myId.toString()
  );
  const isAdminUser  = user?.role === 'admin';

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px' }}>
      <button
        onClick={() => navigate(-1)}
        style={{ marginBottom: '20px', background: 'none', border: '1px solid #ccc', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}
      >
        ← Retour
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>

        {/* ── Images ─────────────────────────────────────────────────────── */}
        <div>
          {product.image?.length > 0 && (
            <>
              <img
                src={`${API_BASE_URL}${product.image[selectedImg]}`}
                alt={product.title}
                style={{ width: '100%', borderRadius: '14px', objectFit: 'cover', maxHeight: '400px' }}
              />
              {product.image.length > 1 && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                  {product.image.map((img, i) => (
                    <img
                      key={i}
                      src={`${API_BASE_URL}${img}`}
                      alt=""
                      onClick={() => setSelectedImg(i)}
                      style={{
                        width: '68px', height: '68px', objectFit: 'cover',
                        borderRadius: '8px', cursor: 'pointer',
                        border: selectedImg === i ? '2px solid #e63946' : '2px solid transparent',
                      }}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Info ───────────────────────────────────────────────────────── */}
        <div>
          <h1 style={{ fontSize: '24px', marginBottom: '10px', color: '#1a1a1a' }}>{product.title}</h1>

          <p style={{ fontSize: '30px', fontWeight: '800', color: '#e63946', margin: '0 0 12px' }}>
            {product.price} MAD
          </p>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
            <span style={styles.tag}>{product.category}</span>
            <span style={{ ...styles.tag, background: isSold ? '#fee2e2' : '#dcfce7', color: isSold ? '#991b1b' : '#166534' }}>
              {isSold ? '🔴 Vendu' : '🟢 Disponible'}
            </span>
          </div>

          {product.description && (
            <p style={{ lineHeight: '1.7', color: '#555', marginBottom: '20px' }}>
              {product.description}
            </p>
          )}

          {/* ── Seller contact block ───────────────────────────────────── */}
          <div style={styles.sellerBox}>
            <p style={{ fontWeight: '700', marginBottom: '10px', fontSize: '15px' }}>
              📋 Coordonnées du vendeur
            </p>

            {isOwnProduct || isAdminUser ? (
              // Owner or admin sees seller info always
              <SellerInfoDisplay seller={isAdminUser && !isOwnProduct ? product.seller : product.seller} apiBase={API_BASE_URL} />

            ) : isSold ? (
              <p style={{ color: '#999', fontSize: '14px' }}>Produit vendu — coordonnées non disponibles.</p>

            ) : hasAccess && sellerInfo ? (
              // Buyer already paid — show info
              <SellerInfoDisplay seller={sellerInfo} apiBase={API_BASE_URL} />

            ) : checkingAccess ? (
              <p style={{ color: '#aaa', fontSize: '14px' }}>Vérification...</p>

            ) : (
              // Locked — needs payment
              <div style={styles.lockedBox}>
                <div style={styles.lockIcon}>🔒</div>
                <p style={{ fontWeight: '700', fontSize: '15px', margin: '0 0 4px' }}>
                  Informations masquées
                </p>
                <p style={{ color: '#888', fontSize: '13px', margin: '0 0 14px' }}>
                  Payez <strong>20 DH</strong> pour voir le numéro de téléphone, WhatsApp et les coordonnées complètes du vendeur.
                </p>
                {!isLoggedIn ? (
                  <button onClick={() => navigate('/connexion')} style={styles.btnPay}>
                    🔐 Se connecter pour continuer
                  </button>
                ) : (
                  <button onClick={() => setShowPayModal(true)} style={styles.btnPay}>
                    Voir les coordonnées — 20 DH
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Sold banner */}
          {isSold && (
            <div style={styles.soldBanner}>🚫 Ce produit est déjà vendu</div>
          )}
        </div>
      </div>

      {/* ── PayPal Modal ──────────────────────────────────────────────────── */}
      {showPayModal && (
        <PaymentModal
          type="reveal_seller"
          productId={id}
          amount={20}
          label="Voir les coordonnées du vendeur"
          onSuccess={handlePaymentSuccess}
          onClose={() => setShowPayModal(false)}
        />
      )}
    </div>
  );
};

// ─── Sub-component: display revealed seller info ──────────────────────────────
const SellerInfoDisplay = ({ seller, apiBase }) => {
  if (!seller) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <p style={{ margin: 0, fontWeight: '600' }}>
        👤 {seller.shopName || seller.name}
      </p>
      {seller.phone && (
        <a href={`tel:${seller.phone}`} style={styles.contactLink}>
          📞 {seller.phone}
        </a>
      )}
      {seller.whatsapp && (
        <a
          href={`https://wa.me/${seller.whatsapp.replace(/\D/g, '')}`}
          target="_blank" rel="noopener noreferrer"
          style={{ ...styles.contactLink, color: '#25d366' }}
        >
          💬 WhatsApp — {seller.whatsapp}
        </a>
      )}
      {seller.facebook && (
        <a href={seller.facebook} target="_blank" rel="noopener noreferrer" style={styles.contactLink}>
          🔵 Facebook
        </a>
      )}
      {seller.email && (
        <a href={`mailto:${seller.email}`} style={styles.contactLink}>
          ✉️ {seller.email}
        </a>
      )}
    </div>
  );
};

const styles = {
  tag: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '13px',
    background: '#f3f4f6',
    color: '#374151',
    fontWeight: '500',
  },
  sellerBox: {
    background: '#fafafa',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '16px',
  },
  lockedBox: {
    textAlign: 'center',
    padding: '10px 0',
  },
  lockIcon: {
    fontSize: '32px',
    marginBottom: '8px',
  },
  btnPay: {
    width: '100%',
    padding: '13px',
    background: '#e63946',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  contactLink: {
    color: '#1d4ed8',
    textDecoration: 'none',
    fontWeight: '500',
    fontSize: '14px',
  },
  soldBanner: {
    background: '#f3f4f6',
    color: '#6b7280',
    padding: '14px',
    borderRadius: '10px',
    fontWeight: '600',
    textAlign: 'center',
  },
};

export default ProductDetail;