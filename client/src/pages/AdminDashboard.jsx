import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/AdminDashboard.css';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [sellerRequests, setSellerRequests] = useState([]);
  const [payments, setPayments] = useState([]);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('paiements');

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    await Promise.all([fetchUsers(), fetchProducts(), fetchOrders(), fetchPayments()]);
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/users`, { headers });
      setUsers(res.data);
      setSellerRequests(res.data.filter(u => u.sellerStatus === 'pending'));
    } catch (err) {
      console.error('Erreur utilisateurs:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/products/all`, { headers });
      setProducts(res.data.data);
    } catch (err) {
      console.error('Erreur produits:', err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/orders`, { headers });
      setOrders(res.data.data);
    } catch (err) {
      console.error('Erreur commandes:', err);
    }
  };

  const fetchPayments = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/payments`, { headers });
      setPayments(res.data.data || []);
    } catch (err) {
      console.error('Erreur paiements:', err);
    }
  };

  const confirmPayment = async (paymentId) => {
    try {
      await axios.patch(`${API_BASE_URL}/api/payments/confirm/${paymentId}`, {}, { headers });
      setMessage('✅ Paiement confirmé — accès accordé.');
      fetchPayments();
    } catch {
      setMessage('Erreur lors de la confirmation.');
    }
  };

  const rejectPayment = async (paymentId) => {
    const reason = window.prompt('Raison du refus (optionnel)') || '';
    try {
      await axios.patch(`${API_BASE_URL}/api/payments/reject/${paymentId}`, { reason }, { headers });
      setMessage('❌ Paiement refusé.');
      fetchPayments();
    } catch {
      setMessage('Erreur lors du refus.');
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Supprimer cet utilisateur ?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/users/${id}`, { headers });
      setMessage('Utilisateur supprimé.');
      fetchUsers();
    } catch {
      setMessage("Erreur lors de la suppression de l'utilisateur.");
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Supprimer ce produit ?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/products/${id}`, { headers });
      setMessage('Produit supprimé.');
      fetchProducts();
    } catch {
      setMessage("Erreur lors de la suppression du produit.");
    }
  };

  const reviewProduct = async (id, approvalStatus) => {
    try {
      await axios.patch(`${API_BASE_URL}/api/products/${id}/review`, { approvalStatus }, { headers });
      setMessage(`Produit ${approvalStatus === 'approved' ? 'approuvé' : 'refusé'}.`);
      fetchProducts();
    } catch {
      setMessage('Erreur lors de la mise à jour du produit.');
    }
  };

  const reviewSeller = async (id, sellerStatus) => {
    try {
      await axios.patch(`${API_BASE_URL}/api/users/${id}/review-seller`, { sellerStatus }, { headers });
      setMessage(`Demande vendeur ${sellerStatus === 'approved' ? 'approuvée' : 'refusée'}.`);
      fetchUsers();
    } catch {
      setMessage('Erreur lors de la mise à jour.');
    }
  };

  const reviewOrder = async (id, status) => {
    try {
      await axios.patch(`${API_BASE_URL}/api/orders/${id}/review`, { status }, { headers });
      setMessage(`Commande ${status === 'accepted' ? 'acceptée' : 'refusée'}.`);
      fetchOrders();
      fetchProducts();
    } catch {
      setMessage('Erreur lors de la mise à jour de la commande.');
    }
  };

  const approvalBadge = (s) => {
    const map = { pending: 'badge badge-pending', approved: 'badge badge-done', rejected: 'badge badge-rejected' };
    const labels = { pending: 'En attente', approved: 'Approuvé', rejected: 'Refusé' };
    return <span className={map[s] || 'badge'}>{labels[s] || s}</span>;
  };

  const pendingPayments = payments.filter(p => p.status === 'pending');
  const tabs = [
    { key: 'paiements',   label: `💰 Paiements (${pendingPayments.length} en attente)` },
    { key: 'produits',    label: `Produits (${products.filter(p => p.approvalStatus === 'pending').length} en attente)` },
    { key: 'commandes',   label: `Commandes (${orders.filter(o => o.status === 'pending').length} en attente)` },
    { key: 'vendeurs',    label: `Demandes vendeur (${sellerRequests.length})` },
    { key: 'utilisateurs', label: 'Utilisateurs' },
  ];

  return (
    <div className="admin-dashboard">
      <h2>Dashboard Admin</h2>
      <p className="admin-subtitle">Jotya — gestion de la plateforme</p>
      {message && <p className="admin-message">{message}</p>}

      {/* Stats */}
      <div className="admin-stats">
        <div className="stat-card">
          <p className="stat-label">Paiements en attente</p>
          <p className="stat-value">{pendingPayments.length}</p>
          {pendingPayments.length > 0 && <p className="stat-sub">À confirmer</p>}
        </div>
        <div className="stat-card">
          <p className="stat-label">Produits total</p>
          <p className="stat-value">{products.length}</p>
          <p className="stat-sub">{products.filter(p => p.approvalStatus === 'pending').length} en attente</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Vendeurs en attente</p>
          <p className="stat-value">{sellerRequests.length}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Utilisateurs</p>
          <p className="stat-value">{users.length}</p>
        </div>
      </div>

      <div className="admin-tabs">
        {tabs.map(t => (
          <button
            key={t.key}
            className={`tab-btn ${activeTab === t.key ? 'active' : ''}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* PAIEMENTS MANUELS */}
      {activeTab === 'paiements' && (
        <div className="dashboard-section">
          <h3>💰 Paiements CashPlus</h3>
          {payments.length === 0 ? (
            <p className="admin-empty">Aucun paiement pour l'instant.</p>
          ) : (
            <div className="admin-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Acheteur</th>
                    <th>Type</th>
                    <th>Montant</th>
                    <th>Produit</th>
                    <th>Reçu</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map(p => (
                    <tr key={p._id}>
                      <td>{new Date(p.createdAt).toLocaleDateString('fr-FR')}</td>
                      <td>
                        <strong>{p.payer?.name}</strong>
                        <br /><span style={{ fontSize: '11px', color: '#999' }}>{p.payer?.phone}</span>
                      </td>
                      <td>{p.type === 'reveal_seller' ? '🔓 Coordonnées' : '📢 Publication'}</td>
                      <td><strong style={{ color: '#c0542a' }}>{p.amount} DH</strong></td>
                      <td style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.product?.title || '—'}</td>
                      <td>
                        {p.receiptImage
                          ? <a href={`${API_BASE_URL}${p.receiptImage}`} target="_blank" rel="noopener noreferrer" className="receipt-link">📎 Voir le reçu</a>
                          : <span style={{ color: '#ccc' }}>—</span>}
                      </td>
                      <td>
                        <span className={`badge ${p.status === 'pending' ? 'badge-pending' : p.status === 'completed' ? 'badge-done' : 'badge-rejected'}`}>
                          {p.status === 'pending' ? '⏳ En attente' : p.status === 'completed' ? '✅ Confirmé' : '❌ Refusé'}
                        </span>
                      </td>
                      <td>
                        {p.status === 'pending' && (
                          <div className="btn-actions">
                            <button className="btn-confirm" onClick={() => confirmPayment(p._id)}>✅ Confirmer</button>
                            <button className="btn-reject"  onClick={() => rejectPayment(p._id)}>❌ Refuser</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* PRODUITS */}
      {activeTab === 'produits' && (
        <div className="dashboard-section">
          <h3>📦 Gestion des produits</h3>
          <div className="admin-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Titre</th>
                  <th>Vendeur</th>
                  <th>Prix</th>
                  <th>Catégorie</th>
                  <th>Statut</th>
                  <th>Approbation</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id}>
                    <td>{p.title}</td>
                    <td>{p.seller?.name || '—'}</td>
                    <td>{p.price} MAD</td>
                    <td>{p.category}</td>
                    <td>{p.status}</td>
                    <td>{approvalBadge(p.approvalStatus)}</td>
                    <td>
                      <div className="btn-actions">
                        {p.approvalStatus === 'pending' && (
                          <>
                            <button className="btn-approve" onClick={() => reviewProduct(p._id, 'approved')}>✅ Approuver</button>
                            <button className="btn-reject" onClick={() => reviewProduct(p._id, 'rejected')}>❌ Refuser</button>
                          </>
                        )}
                        {p.approvalStatus === 'approved' && (
                          <button className="btn-reject" onClick={() => reviewProduct(p._id, 'rejected')}>Désapprouver</button>
                        )}
                        {p.approvalStatus === 'rejected' && (
                          <button className="btn-approve" onClick={() => reviewProduct(p._id, 'approved')}>Réapprouver</button>
                        )}
                        <button className="btn-delete" onClick={() => deleteProduct(p._id)}>🗑️ Supprimer</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* COMMANDES */}
      {activeTab === 'commandes' && (
        <div className="dashboard-section">
          <h3>🛒 Gestion des commandes</h3>
          <div className="admin-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Acheteur</th>
                  <th>Vendeur</th>
                  <th>Prix</th>
                  <th>Message</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id}>
                    <td>{o.product?.title || '—'}</td>
                    <td>{o.buyer?.name}<br /><small>{o.buyer?.phone}</small></td>
                    <td>{o.seller?.shopName || o.seller?.name}<br /><small>{o.seller?.phone}</small></td>
                    <td>{o.totalPrice} MAD</td>
                    <td style={{ maxWidth: '150px', fontSize: '12px' }}>{o.message || '—'}</td>
                    <td>{approvalBadge(o.status)}</td>
                    <td>
                      <div className="btn-actions">
                        {o.status === 'pending' && (
                          <>
                            <button className="btn-approve" onClick={() => reviewOrder(o._id, 'accepted')}>✅ Accepter</button>
                            <button className="btn-reject" onClick={() => reviewOrder(o._id, 'rejected')}>❌ Refuser</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DEMANDES VENDEURS */}
      {activeTab === 'vendeurs' && (
        <div className="dashboard-section">
          <h3>🏪 Demandes vendeur</h3>
          {sellerRequests.length === 0 ? (
            <p>Aucune demande en attente.</p>
          ) : (
            <div className="admin-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Boutique</th>
                    <th>Téléphone</th>
                    <th>WhatsApp</th>
                    <th>Facebook</th>
                    <th>CIN</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sellerRequests.map(u => (
                    <tr key={u._id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.shopName || '—'}</td>
                      <td>{u.phone || '—'}</td>
                      <td>{u.whatsapp || '—'}</td>
                      <td>{u.facebook ? <a href={u.facebook} target="_blank" rel="noopener noreferrer">Voir</a> : '—'}</td>
                      <td>
                        {u.cinImage
                          ? <a href={`${API_BASE_URL}${u.cinImage}`} target="_blank" rel="noopener noreferrer">Voir CIN</a>
                          : '—'}
                      </td>
                      <td>
                        <div className="btn-actions">
                          <button className="btn-approve" onClick={() => reviewSeller(u._id, 'approved')}>✅ Approuver</button>
                          <button className="btn-reject" onClick={() => reviewSeller(u._id, 'rejected')}>❌ Refuser</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* UTILISATEURS */}
      {activeTab === 'utilisateurs' && (
        <div className="dashboard-section">
          <h3>👥 Utilisateurs</h3>
          <div className="admin-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th>Statut vendeur</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                    <td>{u.sellerStatus}</td>
                    <td>
                      <button className="btn-delete" onClick={() => deleteUser(u._id)}>🗑️ Supprimer</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;