import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const statusConfig = {
  pending:  { label: 'En attente',  color: '#e67e22', bg: '#fef3e2' },
  accepted: { label: 'Acceptée ✅', color: '#27ae60', bg: '#e8f5e9' },
  rejected: { label: 'Refusée ❌',  color: '#e74c3c', bg: '#ffebee' },
};

const MesCommandes = () => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleOrderClick = async (order) => {
    if (!order.product || !order.seller) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API_BASE_URL}/api/messages/conversations`,
        { sellerId: order.seller._id, productId: order.product._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const convId = res.data.data?._id;
      if (convId) {
        navigate(`/messages?convId=${convId}`);
      } else {
        navigate('/messages');
      }
    } catch {
      navigate('/messages');
    }
  };

  useEffect(() => {
    if (!isLoggedIn) { navigate('/connexion'); return; }
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_BASE_URL}/api/orders/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(res.data.data);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [isLoggedIn, navigate]);

  if (loading) return (
    <div style={{ padding: '60px', textAlign: 'center', color: '#888' }}>
      Chargement de vos commandes...
    </div>
  );

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>Mes commandes</h2>

      {orders.length === 0 ? (
        <div style={styles.empty}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📦</div>
          <h3 style={{ margin: '0 0 8px', color: '#333' }}>Aucune commande</h3>
          <p style={{ color: '#888', marginBottom: '20px' }}>
            Vous n'avez pas encore passé de commande.
          </p>
          <Link to="/produits" style={styles.btn}>Découvrir les produits</Link>
        </div>
      ) : (
        <div style={styles.list}>
          {orders.map(order => {
            const s = statusConfig[order.status] || statusConfig.pending;
            return (
              <div key={order._id} style={{...styles.card, cursor: 'pointer'}} onClick={() => handleOrderClick(order)}>
                {/* Image */}
                {order.product?.image?.[0] && (
                  <img
                    src={`${API_BASE_URL}${order.product.image[0]}`}
                    alt={order.product.title}
                    style={styles.img}
                  />
                )}

                {/* Info */}
                <div style={styles.info}>
                  <p style={styles.productName}>{order.product?.title}</p>
                  <p style={styles.price}>{order.totalPrice} MAD</p>

                  {/* Seller contact — shown only when accepted */}
                  {order.status === 'accepted' && order.seller && (
                    <div style={styles.sellerBox}>
                      <p style={{ margin: '0 0 4px', fontWeight: '600', fontSize: '13px' }}>
                        Contactez le vendeur :
                      </p>
                      {order.seller.phone && (
                        <p style={styles.contact}>📞 {order.seller.phone}</p>
                      )}
                      {order.seller.whatsapp && (
                        <a
                          href={`https://wa.me/${order.seller.whatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={styles.waLink}
                        >
                          💬 WhatsApp
                        </a>
                      )}
                    </div>
                  )}

                  <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#bbb' }}>
                    {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </p>
                </div>

                {/* Status badge */}
                <div style={{ ...styles.badge, color: s.color, background: s.bg }}>
                  {s.label}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const styles = {
  page: {
    maxWidth: '750px',
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
  list: {
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
    borderRadius: '14px',
    padding: '16px',
    boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
  },
  img: {
    width: '90px',
    height: '90px',
    objectFit: 'cover',
    borderRadius: '10px',
    flexShrink: 0,
  },
  info: {
    flex: 1,
  },
  productName: {
    margin: '0 0 4px',
    fontWeight: '700',
    fontSize: '16px',
    color: '#222',
  },
  price: {
    margin: '0 0 6px',
    fontWeight: '700',
    fontSize: '15px',
    color: '#f97316',
  },
  sellerBox: {
    background: '#f8f8f8',
    borderRadius: '8px',
    padding: '8px 12px',
    marginTop: '6px',
  },
  contact: {
    margin: '2px 0',
    fontSize: '13px',
    color: '#444',
  },
  waLink: {
    display: 'inline-block',
    marginTop: '4px',
    padding: '4px 12px',
    background: '#25d366',
    color: '#fff',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    textDecoration: 'none',
  },
  badge: {
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '700',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  empty: {
    textAlign: 'center',
    padding: '60px 20px',
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

export default MesCommandes;