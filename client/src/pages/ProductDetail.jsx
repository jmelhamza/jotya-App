import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImg, setSelectedImg] = useState(0);
  const [message, setMessage] = useState('');
  const [orderMessage, setOrderMessage] = useState('');
  const [orderSent, setOrderSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [contactingVendeur, setContactingVendeur] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/products`);
        const found = res.data.data.find(p => p._id === id);
        if (!found) setError('Produit introuvable.');
        else setProduct(found);
      } catch {
        setError('Erreur lors du chargement du produit.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleContactSeller = async () => {
    if (!isLoggedIn) { navigate('/connexion'); return; }
    if (!product?.seller) return;
    setContactingVendeur(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API_BASE_URL}/api/messages/conversations`,
        { sellerId: product.seller._id, productId: product._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate(`/messages?convId=${res.data.data._id}`);
    } catch (err) {
      alert('Erreur lors de la création de la conversation.');
    } finally {
      setContactingVendeur(false);
    }
  };

  const handleOrder = async () => {    if (!isLoggedIn) {
      navigate('/connexion');
      return;
    }
    setSending(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/api/orders`,
        { productId: product._id, quantity: 1, message: orderMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrderSent(true);
      setMessage('Votre demande a été envoyée ! L\'admin vous contactera bientôt.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Erreur lors de l\'envoi de la demande.');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <p style={{ padding: '40px', textAlign: 'center' }}>Chargement...</p>;
  if (error) return <p style={{ padding: '40px', textAlign: 'center', color: 'red' }}>{error}</p>;
  if (!product) return null;

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px' }}>
      <button
        onClick={() => navigate(-1)}
        style={{ marginBottom: '20px', background: 'none', border: '1px solid #ccc', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}
      >
        ← Retour
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        {/* Images */}
        <div>
          {product.image && product.image.length > 0 && (
            <>
              <img
                src={`${API_BASE_URL}${product.image[selectedImg]}`}
                alt={product.title}
                style={{ width: '100%', borderRadius: '12px', objectFit: 'cover', maxHeight: '400px' }}
              />
              {product.image.length > 1 && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                  {product.image.map((img, i) => (
                    <img
                      key={i}
                      src={`${API_BASE_URL}${img}`}
                      alt={`img-${i}`}
                      onClick={() => setSelectedImg(i)}
                      style={{
                        width: '70px',
                        height: '70px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        border: selectedImg === i ? '2px solid #333' : '2px solid transparent'
                      }}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Info */}
        <div>
          <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>{product.title}</h1>
          <p style={{ fontSize: '28px', fontWeight: '700', color: '#e63946', marginBottom: '10px' }}>
            {product.price} MAD
          </p>
          <p style={{ marginBottom: '6px' }}>
            <strong>Catégorie :</strong> {product.category}
          </p>
          <p style={{ marginBottom: '6px' }}>
            <strong>État :</strong>{' '}
            <span style={{ color: product.status === 'Disponible' ? 'green' : 'gray' }}>
              {product.status}
            </span>
          </p>
          {product.description && (
            <p style={{ marginBottom: '16px', lineHeight: '1.6', color: '#555' }}>
              {product.description}
            </p>
          )}

          {product.seller && (
            <div style={{ background: '#f8f8f8', borderRadius: '10px', padding: '14px', marginBottom: '20px' }}>
              <p style={{ fontWeight: '600', marginBottom: '6px' }}>
                Vendeur : {product.seller.shopName || product.seller.name}
              </p>
              {product.seller.phone && <p>📞 {product.seller.phone}</p>}
              {product.seller.whatsapp && (
                <p>
                  <a href={`https://wa.me/${product.seller.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                    💬 WhatsApp
                  </a>
                </p>
              )}
              {product.seller.facebook && (
                <p>
                  <a href={product.seller.facebook} target="_blank" rel="noopener noreferrer">
                    Facebook
                  </a>
                </p>
              )}
              <Link to={`/vendeur/${product.seller._id}`} style={{ fontSize: '13px', color: '#888' }}>
                Voir le profil du vendeur →
              </Link>
            </div>
          )}

          {/* Contact seller button */}
          {product.status !== 'Vendu' && product.seller && user?._id !== product.seller._id && (
            <button
              onClick={handleContactSeller}
              disabled={contactingVendeur}
              style={{
                width: '100%',
                padding: '12px',
                background: '#fff',
                color: '#e63946',
                border: '2px solid #e63946',
                borderRadius: '10px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: contactingVendeur ? 'not-allowed' : 'pointer',
                marginBottom: '10px',
              }}
            >
              {contactingVendeur ? 'Connexion...' : '💬 Contacter le vendeur'}
            </button>
          )}

          {product.status === 'Vendu' ? (
            <p style={{ color: 'gray', fontStyle: 'italic' }}>Ce produit est déjà vendu.</p>
          ) : orderSent ? (
            <p style={{ color: 'green', fontWeight: '600' }}>{message}</p>
          ) : (
            <>
              <textarea
                placeholder="Message au vendeur (optionnel)..."
                value={orderMessage}
                onChange={e => setOrderMessage(e.target.value)}
                style={{
                  width: '100%',
                  height: '80px',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #ccc',
                  marginBottom: '12px',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
              <button
                onClick={handleOrder}
                disabled={sending}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: '#e63946',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: sending ? 'not-allowed' : 'pointer'
                }}
              >
                {sending ? 'Envoi en cours...' : isLoggedIn ? 'Envoyer une demande d\'achat' : 'Se connecter pour commander'}
              </button>
              {message && <p style={{ color: 'red', marginTop: '10px' }}>{message}</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;