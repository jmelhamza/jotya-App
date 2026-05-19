import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const statusColor = {
  pending: '#e67e22',
  accepted: '#27ae60',
  rejected: '#e74c3c',
};

const statusLabel = {
  pending: 'En attente',
  accepted: 'Acceptée',
  rejected: 'Refusée',
};

const MesCommandes = () => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) { navigate('/connexion'); return; }
    const fetch = async () => {
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
    fetch();
  }, [isLoggedIn, navigate]);

  if (loading) return <p style={{ padding: '40px', textAlign: 'center' }}>Chargement...</p>;

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
      <h2 style={{ marginBottom: '24px' }}>Mes commandes</h2>

      {orders.length === 0 ? (
        <p style={{ color: '#888' }}>Vous n'avez pas encore passé de commande.</p>
      ) : (
        orders.map(order => (
          <div key={order._id} style={{
            background: '#f9f9f9',
            border: '1px solid #eee',
            borderRadius: '12px',
            padding: '18px 20px',
            marginBottom: '16px',
            display: 'flex',
            gap: '20px',
            alignItems: 'flex-start',
          }}>
            {order.product?.image?.[0] && (
              <img
                src={`${API_BASE_URL}${order.product.image[0]}`}
                alt={order.product.title}
                style={{ width: '90px', height: '90px', objectFit: 'cover', borderRadius: '10px' }}
              />
            )}
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 6px' }}>{order.product?.title}</h3>
              <p style={{ margin: '0 0 4px', color: '#e63946', fontWeight: '700' }}>
                {order.totalPrice} MAD
              </p>
              <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#555' }}>
                Vendeur : {order.seller?.shopName || order.seller?.name}
              </p>
              {order.seller?.phone && (
                <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#555' }}>
                  📞 {order.seller.phone}
                </p>
              )}
              {order.seller?.whatsapp && (
                <p style={{ margin: '0 0 4px', fontSize: '13px' }}>
                  <a href={`https://wa.me/${order.seller.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                    💬 Contacter sur WhatsApp
                  </a>
                </p>
              )}
              <p style={{ margin: '8px 0 0', fontSize: '13px' }}>
                Statut :{' '}
                <strong style={{ color: statusColor[order.status] }}>
                  {statusLabel[order.status]}
                </strong>
              </p>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#aaa' }}>
                {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                  year: 'numeric', month: 'long', day: 'numeric'
                })}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MesCommandes;