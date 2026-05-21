import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const statusConfig = {
  pending:  { label: 'En attente ⏳', color: '#e67e22', bg: '#fef3e2' },
  accepted: { label: 'Acceptée ✅',   color: '#27ae60', bg: '#e8f5e9' },
  rejected: { label: 'Refusée ❌',    color: '#e74c3c', bg: '#ffebee' },
};

const MesVentes = () => {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!isLoggedIn) { navigate('/connexion'); return; }
    if (user?.role !== 'seller' && user?.role !== 'admin') {
      navigate('/'); return;
    }
    fetchOrders();
  }, [isLoggedIn, user]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/orders/seller`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data.data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (orderId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API_BASE_URL}/api/orders/${orderId}/seller-review`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setActionMsg(status === 'accepted' ? '✅ Commande acceptée !' : '❌ Commande refusée.');
      fetchOrders();
      setTimeout(() => setActionMsg(''), 3000);
    } catch (err) {
      setActionMsg(err.response?.data?.message || 'Erreur lors du traitement.');
    }
  };

  const handleContactBuyer = async (order) => {
    if (!order.buyer?._id || !order.product?._id) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API_BASE_URL}/api/messages/conversations`,
        { sellerId: order.buyer._id, productId: order.product._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate(`/messages?convId=${res.data.data._id}`);
    } catch {
      navigate('/messages');
    }
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);
  const pendingCount = orders.filter(o => o.status === 'pending').length;

  if (loading) return (
    <div style={{ padding: '60px', textAlign: 'center', color: '#888' }}>
      Chargement de vos ventes...
    </div>
  );

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h2 style={styles.title}>
          Mes ventes
          {pendingCount > 0 && (
            <span style={styles.badge}>{pendingCount} en attente</span>
          )}
        </h2>
      </div>

      {actionMsg && (
        <div style={styles.actionMsg}>{actionMsg}</div>
      )}

      {/* Filter tabs */}
      <div style={styles.filters}>
        {[
          { key: 'all', label: `Tout (${orders.length})` },
          { key: 'pending', label: `En attente (${orders.filter(o=>o.status==='pending').length})` },
          { key: 'accepted', label: `Acceptées (${orders.filter(o=>o.status==='accepted').length})` },
          { key: 'rejected', label: `Refusées (${orders.filter(o=>o.status==='rejected').length})` },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              ...styles.filterBtn,
              ...(filter === f.key ? styles.filterBtnActive : {}),
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={styles.empty}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🛍️</div>
          <h3 style={{ margin: '0 0 8px', color: '#333' }}>Aucune vente ici</h3>
          <p style={{ color: '#888' }}>Quand un acheteur envoie une demande, elle apparaît ici.</p>
        </div>
      ) : (
        <div style={styles.list}>
          {filtered.map(order => {
            const s = statusConfig[order.status] || statusConfig.pending;
            return (
              <div key={order._id} style={styles.card}>
                {/* Product image */}
                {order.product?.image?.[0] && (
                  <img
                    src={`${API_BASE_URL}${order.product.image[0]}`}
                    alt={order.product.title}
                    style={styles.img}
                  />
                )}

                {/* Info */}
                <div style={styles.info}>
                  <p style={styles.productName}>{order.product?.title || '—'}</p>
                  <p style={styles.price}>{order.totalPrice} MAD</p>

                  {/* Buyer info */}
                  <div style={styles.buyerBox}>
                    <p style={{ margin: '0 0 2px', fontWeight: '600', fontSize: '13px' }}>
                      👤 Acheteur : {order.buyer?.name}
                    </p>
                    {order.buyer?.phone && (
                      <p style={{ margin: '0', fontSize: '13px', color: '#555' }}>
                        📞 {order.buyer.phone}
                      </p>
                    )}
                  </div>

                  {/* Message from buyer */}
                  {order.message && (
                    <p style={styles.buyerMsg}>
                      💬 "{order.message}"
                    </p>
                  )}

                  <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#bbb' }}>
                    {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </p>
                </div>

                {/* Right side: status + actions */}
                <div style={styles.right}>
                  <div style={{ ...styles.statusBadge, color: s.color, background: s.bg }}>
                    {s.label}
                  </div>

                  {order.status === 'pending' && (
                    <div style={styles.actions}>
                      <button
                        style={styles.btnAccept}
                        onClick={() => handleReview(order._id, 'accepted')}
                      >
                        ✅ Accepter
                      </button>
                      <button
                        style={styles.btnReject}
                        onClick={() => handleReview(order._id, 'rejected')}
                      >
                        ❌ Refuser
                      </button>
                    </div>
                  )}

                  <button
                    style={styles.btnMsg}
                    onClick={() => handleContactBuyer(order)}
                  >
                    💬 Contacter
                  </button>
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
    maxWidth: '860px',
    margin: '40px auto',
    padding: '0 20px',
    fontFamily: "'Segoe UI', sans-serif",
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px',
  },
  title: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  badge: {
    background: '#e63946',
    color: '#fff',
    fontSize: '13px',
    fontWeight: '700',
    padding: '3px 10px',
    borderRadius: '20px',
  },
  actionMsg: {
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    color: '#166534',
    padding: '12px 16px',
    borderRadius: '10px',
    marginBottom: '16px',
    fontWeight: '600',
  },
  filters: {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  filterBtn: {
    padding: '7px 16px',
    borderRadius: '20px',
    border: '1px solid #ddd',
    background: '#fff',
    cursor: 'pointer',
    fontSize: '13px',
    color: '#555',
  },
  filterBtnActive: {
    background: '#e63946',
    color: '#fff',
    border: '1px solid #e63946',
    fontWeight: '600',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  card: {
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-start',
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
    margin: '0 0 8px',
    fontWeight: '700',
    fontSize: '15px',
    color: '#f97316',
  },
  buyerBox: {
    background: '#f8f8f8',
    borderRadius: '8px',
    padding: '8px 12px',
    marginBottom: '6px',
  },
  buyerMsg: {
    fontSize: '13px',
    color: '#666',
    fontStyle: 'italic',
    margin: '6px 0 0',
    background: '#fffbeb',
    padding: '6px 10px',
    borderRadius: '6px',
    borderLeft: '3px solid #fbbf24',
  },
  right: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '10px',
    flexShrink: 0,
  },
  statusBadge: {
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '700',
    whiteSpace: 'nowrap',
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  btnAccept: {
    padding: '8px 16px',
    background: '#22c55e',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  btnReject: {
    padding: '8px 16px',
    background: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  btnMsg: {
    padding: '7px 14px',
    background: '#fff',
    color: '#e63946',
    border: '1.5px solid #e63946',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  empty: {
    textAlign: 'center',
    padding: '60px 20px',
  },
};

export default MesVentes;