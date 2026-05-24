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

  const [product, setProduct]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [selectedImg, setSelectedImg] = useState(0);
  const [lightbox, setLightbox]   = useState(false);

  const [sellerInfo, setSellerInfo]         = useState(null);
  const [hasAccess, setHasAccess]           = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(false);
  const [showPayModal, setShowPayModal]     = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/products/${id}`);
        setProduct(res.data.data || res.data);
      } catch {
        try {
          const res = await axios.get(`${API_BASE_URL}/api/products`);
          const found = (res.data.data || res.data).find(p => p._id === id);
          found ? setProduct(found) : setError('Produit introuvable.');
        } catch {
          setError('Erreur lors du chargement.');
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const checkAccess = useCallback(async () => {
    if (!isLoggedIn || !id) return;
    setCheckingAccess(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/payments/access/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.hasAccess) { setHasAccess(true); fetchSellerInfo(); }
    } catch {} finally { setCheckingAccess(false); }
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

  const handlePaymentSuccess = () => {
    setShowPayModal(false);
    setHasAccess(true);
    fetchSellerInfo();
  };

  // Lightbox keyboard nav
  useEffect(() => {
    if (!lightbox || !product) return;
    const handler = (e) => {
      if (e.key === 'Escape') setLightbox(false);
      if (e.key === 'ArrowRight') setSelectedImg(i => (i + 1) % product.image.length);
      if (e.key === 'ArrowLeft')  setSelectedImg(i => (i - 1 + product.image.length) % product.image.length);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightbox, product]);

  if (loading) return <p style={{ padding: '60px', textAlign: 'center', color: '#8a6a4a' }}>Chargement...</p>;
  if (error)   return <p style={{ padding: '60px', textAlign: 'center', color: '#c0542a' }}>{error}</p>;
  if (!product) return null;

  const images     = product.image || [];
  const isSold     = product.status === 'Vendu';
  const myId       = user?.id || user?._id;
  const isOwner    = myId && product.seller && (product.seller._id || product.seller).toString() === myId.toString();
  const isAdmin    = user?.role === 'admin';
  const shortDesc  = product.description?.length > 200
    ? product.description.slice(0, 200) + '…'
    : product.description;

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '16px 12px 48px', boxSizing: 'border-box', width: '100%' }}>

      {/* Back */}
      <button onClick={() => navigate(-1)} style={S.back}>← Retour</button>

      {/* ── Layout: image left, info right ── */}
      <div style={S.grid} className="pd-grid">

        {/* ── Images ── */}
        <div style={S.imageCol}>
          {images.length > 0 ? (
            <>
              {/* Main image */}
              <div style={S.mainImgWrap} onClick={() => setLightbox(true)}>
                <img
                  src={`${API_BASE_URL}${images[selectedImg]}`}
                  alt={product.title}
                  style={S.mainImg}
                />
                <span style={S.zoomHint}>🔍 Agrandir</span>
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div style={S.thumbRow}>
                  {images.map((img, i) => (
                    <img
                      key={i}
                      src={`${API_BASE_URL}${img}`}
                      alt=""
                      onClick={() => setSelectedImg(i)}
                      style={{
                        ...S.thumb,
                        border: selectedImg === i
                          ? '2px solid #c9983a'
                          : '2px solid transparent',
                        opacity: selectedImg === i ? 1 : 0.65,
                      }}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div style={S.noImg}>📷 Aucune photo</div>
          )}
        </div>

        {/* ── Info ── */}
        <div style={S.infoCol}>

          {/* Status badge */}
          <span style={{ ...S.badge, ...(isSold ? S.badgeSold : S.badgeAvail) }}>
            {isSold ? '● Vendu' : '● Disponible'}
          </span>

          <h1 style={S.title}>{product.title}</h1>

          <p style={S.price}>{product.price} <span style={{ fontSize: '1rem', fontWeight: 500 }}>MAD</span></p>

          {/* Category */}
          <p style={S.catLine}>{product.category}</p>

          {/* Description */}
          {product.description && (
            <p style={S.desc}>{product.description}</p>
          )}

          {/* Seller contact block */}
          <div style={S.sellerBox}>
            <p style={S.sellerBoxTitle}>📋 Coordonnées du vendeur</p>

            {isOwner || isAdmin ? (
              <SellerInfoDisplay seller={product.seller} productId={id} navigate={navigate} />
            ) : isSold ? (
              <p style={{ color: '#aaa', fontSize: '14px' }}>Produit vendu.</p>
            ) : hasAccess && sellerInfo ? (
              <SellerInfoDisplay seller={sellerInfo} productId={id} navigate={navigate} />
            ) : checkingAccess ? (
              <p style={{ color: '#aaa', fontSize: '13px' }}>Vérification...</p>
            ) : (
              <div style={S.lockedBox}>
                <p style={S.lockTitle}>🔒 Informations masquées</p>
                <p style={S.lockSub}>Payez <strong>50 DH</strong> pour voir le téléphone, WhatsApp et l'adresse du vendeur.</p>
                {!isLoggedIn ? (
                  <button onClick={() => navigate('/connexion')} style={S.btnPay}>
                    Se connecter pour continuer
                  </button>
                ) : (
                  <button onClick={() => setShowPayModal(true)} style={S.btnPay}>
                    Voir les coordonnées — 50 DH
                  </button>
                )}
              </div>
            )}
          </div>

          {isSold && (
            <div style={S.soldBanner}>🚫 Ce produit est déjà vendu</div>
          )}
        </div>
      </div>

      {/* ── Lightbox ── */}
      {lightbox && images.length > 0 && (
        <div style={S.lightboxOverlay} onClick={() => setLightbox(false)}>
          <div style={S.lightboxInner} onClick={e => e.stopPropagation()}>
            {/* Close */}
            <button onClick={() => setLightbox(false)} style={S.lbClose}>✕</button>

            {/* Prev / Next */}
            {images.length > 1 && (
              <>
                <button
                  style={{ ...S.lbArrow, left: '12px' }}
                  onClick={() => setSelectedImg(i => (i - 1 + images.length) % images.length)}
                >‹</button>
                <button
                  style={{ ...S.lbArrow, right: '12px' }}
                  onClick={() => setSelectedImg(i => (i + 1) % images.length)}
                >›</button>
              </>
            )}

            <img
              src={`${API_BASE_URL}${images[selectedImg]}`}
              alt={product.title}
              style={S.lbImg}
            />

            {/* Dot indicators */}
            {images.length > 1 && (
              <div style={S.lbDots}>
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImg(i)}
                    style={{
                      ...S.lbDot,
                      background: selectedImg === i ? '#c9983a' : 'rgba(255,255,255,0.4)',
                      transform: selectedImg === i ? 'scale(1.3)' : 'scale(1)',
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showPayModal && (
        <PaymentModal
          type="reveal_seller"
          productId={id}
          amount={50}
          label="Voir les coordonnées du vendeur"
          onSuccess={handlePaymentSuccess}
          onClose={() => setShowPayModal(false)}
        />
      )}
    </div>
  );
};

/* ── Seller info sub-component ── */
const SellerInfoDisplay = ({ seller, productId, navigate }) => {
  const [starting, setStarting] = React.useState(false);

  const handleContact = async () => {
    if (!seller?._id) return;
    setStarting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/messages/conversations`,
        { sellerId: seller._id, productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const convId = res.data.data?._id;
      navigate(`/messages?conv=${convId}`);
    } catch (e) {
      navigate('/messages');
    } finally {
      setStarting(false);
    }
  };

  if (!seller) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <p style={{ margin: 0, fontWeight: '700', color: '#2c1a0e', fontSize: '15px' }}>
        👤 {seller.shopName || seller.name}
      </p>
      {seller.phone && (
        <a href={`tel:${seller.phone}`} style={S.contactLink}>📞 {seller.phone}</a>
      )}
      {seller.whatsapp && (
        <a href={`https://wa.me/${seller.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" style={{ ...S.contactLink, color: '#25d366' }}>
          💬 WhatsApp — {seller.whatsapp}
        </a>
      )}
      {seller.facebook && (
        <a href={seller.facebook} target="_blank" rel="noopener noreferrer" style={S.contactLink}>🔵 Facebook</a>
      )}
      {seller.email && (
        <a href={`mailto:${seller.email}`} style={S.contactLink}>✉️ {seller.email}</a>
      )}

      {/* Message button */}
      <button
        onClick={handleContact}
        disabled={starting}
        style={{
          marginTop: '8px',
          padding: '11px',
          background: '#2c1a0e',
          color: '#f5f0e8',
          border: 'none',
          borderRadius: '4px',
          fontFamily: "'Special Elite', monospace",
          fontSize: '13px',
          letterSpacing: '0.06em',
          cursor: starting ? 'not-allowed' : 'pointer',
          opacity: starting ? 0.7 : 1,
          width: '100%',
        }}
      >
        {starting ? 'Ouverture...' : '💬 Envoyer un message au vendeur'}
      </button>
    </div>
  );
};

/* ── Styles object ── */
const S = {
  back: {
    background: 'none', border: '1.5px solid rgba(107,76,42,0.3)',
    padding: '8px 18px', borderRadius: '4px', cursor: 'pointer',
    color: '#6b4c2a', fontFamily: 'inherit', fontSize: '14px',
    marginBottom: '24px', display: 'inline-block',
    transition: 'border-color 0.2s',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)',
    gap: '32px',
    alignItems: 'start',
    width: '100%',
  },
  /* images */
  imageCol: { minWidth: 0, overflow: 'hidden' },
  mainImgWrap: {
    position: 'relative', cursor: 'zoom-in',
    borderRadius: '6px', overflow: 'hidden',
    border: '1.5px solid rgba(201,152,58,0.3)',
    background: '#faf6ed',
    width: '100%',
  },
  mainImg: {
    width: '100%',
    aspectRatio: '4/3',
    objectFit: 'cover', display: 'block',
    filter: 'sepia(8%) contrast(1.03)',
  },
  zoomHint: {
    position: 'absolute', bottom: '10px', right: '10px',
    background: 'rgba(44,26,14,0.65)', color: '#fff',
    fontSize: '11px', padding: '4px 10px', borderRadius: '3px',
    fontFamily: "'Josefin Sans', sans-serif",
    letterSpacing: '0.06em', pointerEvents: 'none',
  },
  thumbRow: {
    display: 'flex', gap: '8px', marginTop: '10px',
    flexWrap: 'wrap',
  },
  thumb: {
    width: '64px', height: '64px', objectFit: 'cover',
    borderRadius: '3px', cursor: 'pointer',
    transition: 'opacity 0.2s, border-color 0.2s',
    filter: 'sepia(8%)',
  },
  noImg: {
    background: '#f5f0e8', borderRadius: '4px',
    aspectRatio: '4/3', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    color: '#aaa', fontSize: '1.2rem',
  },
  /* info */
  infoCol: { minWidth: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '14px' },
  badge: {
    display: 'inline-block', padding: '4px 12px',
    borderRadius: '3px', fontSize: '12px',
    fontFamily: "'Josefin Sans', sans-serif",
    fontWeight: '700', letterSpacing: '0.08em',
    textTransform: 'uppercase', alignSelf: 'flex-start',
  },
  badgeAvail: { background: 'rgba(122,122,58,0.12)', color: '#5a6a20', border: '1px solid rgba(122,122,58,0.4)' },
  badgeSold:  { background: 'rgba(192,84,42,0.1)',   color: '#c0542a', border: '1px solid rgba(192,84,42,0.3)'  },
  title: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: 'clamp(1.2rem, 3vw, 1.9rem)',
    fontStyle: 'italic', color: '#2c1a0e',
    margin: 0, lineHeight: 1.3,
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
  },
  price: {
    fontFamily: "'Special Elite', monospace",
    fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
    color: '#c0542a', margin: 0, fontWeight: '700',
  },
  catLine: {
    fontFamily: "'Josefin Sans', sans-serif",
    fontSize: '11px', letterSpacing: '0.12em',
    textTransform: 'uppercase', color: '#8a6a4a',
    margin: 0,
  },
  desc: {
    fontSize: '14px', lineHeight: '1.75', color: '#5a4030',
    fontFamily: "'Libre Baskerville', Georgia, serif",
    margin: 0,
    background: 'rgba(201,152,58,0.06)',
    border: '1px solid rgba(201,152,58,0.2)',
    borderRadius: '4px',
    padding: '12px 14px',
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
    whiteSpace: 'pre-wrap',
  },
  sellerBox: {
    background: '#faf6ed',
    border: '1px solid rgba(107,76,42,0.2)',
    borderRadius: '4px',
    padding: '16px',
    boxShadow: '2px 2px 0 rgba(107,76,42,0.07)',
  },
  sellerBoxTitle: {
    fontWeight: '700', fontSize: '13px', margin: '0 0 12px',
    fontFamily: "'Josefin Sans', sans-serif",
    textTransform: 'uppercase', letterSpacing: '0.08em',
    color: '#6b4c2a',
  },
  lockedBox: { textAlign: 'center', padding: '8px 0 0' },
  lockTitle: { fontWeight: '700', fontSize: '15px', margin: '0 0 6px', color: '#2c1a0e' },
  lockSub: { color: '#8a6a4a', fontSize: '13px', margin: '0 0 14px', lineHeight: '1.6' },
  btnPay: {
    width: '100%', padding: '13px',
    background: '#c0542a',
    color: '#fff', border: '2px solid #6b4c2a',
    borderRadius: '3px', fontSize: '14px',
    fontWeight: '700', cursor: 'pointer',
    fontFamily: "'Special Elite', monospace",
    letterSpacing: '0.06em',
    transition: 'background 0.2s',
  },
  contactLink: {
    color: '#c0542a', textDecoration: 'none',
    fontWeight: '600', fontSize: '14px',
    fontFamily: "'Josefin Sans', sans-serif",
  },
  soldBanner: {
    background: '#f5f0e8', color: '#8a6a4a',
    padding: '12px', borderRadius: '3px',
    fontWeight: '600', textAlign: 'center',
    border: '1px solid rgba(107,76,42,0.2)',
    fontSize: '14px',
  },
  /* lightbox */
  lightboxOverlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(10,6,2,0.93)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000,
  },
  lightboxInner: {
    position: 'relative',
    maxWidth: '90vw', maxHeight: '90vh',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
  },
  lbImg: {
    maxWidth: '90vw', maxHeight: '80vh',
    objectFit: 'contain',
    borderRadius: '4px',
    filter: 'sepia(8%)',
    border: '2px solid rgba(201,152,58,0.3)',
  },
  lbClose: {
    position: 'absolute', top: '-40px', right: 0,
    background: 'none', border: 'none',
    color: '#fff', fontSize: '1.6rem',
    cursor: 'pointer', padding: '4px 8px',
    lineHeight: 1,
  },
  lbArrow: {
    position: 'absolute', top: '50%', transform: 'translateY(-50%)',
    background: 'rgba(255,255,255,0.12)', border: 'none',
    color: '#fff', fontSize: '2rem', cursor: 'pointer',
    padding: '8px 14px', borderRadius: '3px',
    lineHeight: 1, zIndex: 1,
    transition: 'background 0.2s',
  },
  lbDots: {
    display: 'flex', gap: '8px', marginTop: '14px',
    justifyContent: 'center',
  },
  lbDot: {
    width: '8px', height: '8px', borderRadius: '50%',
    border: 'none', cursor: 'pointer', padding: 0,
    transition: 'transform 0.2s, background 0.2s',
  },
};

/* ── Responsive via CSS-in-JS media query trick ── */
const styleTag = document.createElement('style');
styleTag.textContent = `
  @media (max-width: 700px) {
    .pd-grid { grid-template-columns: 1fr !important; gap: 20px !important; }
  }
  @media (max-width: 480px) {
    .pd-grid { padding: 0 !important; }
  }
`;
document.head.appendChild(styleTag);

export default ProductDetail;