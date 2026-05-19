import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { Link } from 'react-router-dom';
import '../styles/MonCompte.css';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const MonCompte = () => {
  const [user, setUser] = useState(null);
  const [myProducts, setMyProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [editProduct, setEditProduct] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', price: '', status: '', image: null });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Vous devez être connecté.');
          setLoading(false);
          return;
        }
        const decoded = jwtDecode(token);
        const userId = decoded.id || decoded._id;

        const userRes = await axios.get(`${API_BASE_URL}/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(userRes.data);

        const productsRes = await axios.get(`${API_BASE_URL}/api/products/user/${userId}`);
        setMyProducts(productsRes.data);
      } catch {
        setError('Erreur lors de la récupération des données.');
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`${API_BASE_URL}/api/users/upload-profile`, formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
      });
      setUser(res.data);
      setMessage("Photo mise à jour !");
    } catch {
      setError("Erreur lors de l'envoi de l'image.");
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Supprimer ce produit ?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyProducts(myProducts.filter(p => p._id !== productId));
      setMessage("Produit supprimé.");
    } catch {
      alert("Erreur lors de la suppression.");
    }
  };

  const handleEditClick = (product) => {
    setEditProduct(product);
    setEditForm({ title: product.title, price: product.price, status: product.status, image: null });
    setMessage('');
    setError('');
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });
  };

  const submitEdit = async () => {
    if (!editProduct) return;
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('title', editForm.title);
      formData.append('price', editForm.price);
      formData.append('status', editForm.status);
      if (editForm.image) formData.append('image', editForm.image);

      const res = await axios.put(`${API_BASE_URL}/api/products/${editProduct._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
      });
      const updated = res.data.data;
      setMyProducts(myProducts.map(p => p._id === updated._id ? updated : p));
      setEditProduct(null);
      setMessage("Produit modifié !");
    } catch {
      setError("Erreur lors de la modification.");
    }
  };

  if (loading) return <p className="loading">Chargement...</p>;
  if (error && !user) return <p className="error">{error}</p>;
  if (!user) return <p className="error">Utilisateur introuvable.</p>;

  const sellerStatusLabel = {
    none: null,
    pending: '⏳ Demande vendeur en cours d\'examen…',
    approved: '✅ Compte vendeur actif',
    rejected: '❌ Demande vendeur refusée',
  };

  return (
    <div className="mon-compte-container">
      <h2>Mon Compte</h2>

      <div className="user-info-card">
        <div className="profile-section">
          {user.image ? (
            <img src={`${API_BASE_URL}${user.image}`} alt="photo de profil" className="user-image" />
          ) : (
            <div className="profile-placeholder-letter">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="upload-button-wrapper">
            <label htmlFor="profile-upload" className="custom-upload-button">Changer la photo</label>
            <input id="profile-upload" type="file" onChange={handleImageChange} style={{ display: 'none' }} />
          </div>
        </div>

        <div className="info-section">
          <p><strong>Nom :</strong> {user.name}</p>
          <p><strong>Email :</strong> {user.email}</p>
          <p><strong>Téléphone :</strong> {user.phone || 'Non renseigné'}</p>
          <p><strong>Rôle :</strong> {user.role}</p>
          {user.shopName && <p><strong>Boutique :</strong> {user.shopName}</p>}

          {sellerStatusLabel[user.sellerStatus] && (
            <p style={{ marginTop: '8px' }}>{sellerStatusLabel[user.sellerStatus]}</p>
          )}

          {user.role === 'user' && user.sellerStatus !== 'pending' && (
            <Link to="/devenir-vendeur" style={{
              display: 'inline-block', marginTop: '10px', padding: '8px 16px',
              background: '#333', color: '#fff', borderRadius: '8px', fontSize: '13px', textDecoration: 'none'
            }}>
              Devenir vendeur
            </Link>
          )}

          <Link to="/mes-commandes" style={{
            display: 'inline-block', marginTop: '10px', marginLeft: '10px', padding: '8px 16px',
            background: '#e63946', color: '#fff', borderRadius: '8px', fontSize: '13px', textDecoration: 'none'
          }}>
            Mes commandes
          </Link>

          {message && <p className="success">{message}</p>}
          {error && <p className="error">{error}</p>}
        </div>
      </div>

      {(user.role === 'seller' || user.role === 'admin') && (
        <div className="my-products">
          <h3>Mes Produits</h3>
          {myProducts.length === 0 ? (
            <p>Aucun produit ajouté.</p>
          ) : (
            myProducts.map((product) => (
              <div key={product._id} className="product-item">
                {product.image?.[0] && (
                  <img src={`${API_BASE_URL}${product.image[0]}`} alt={product.title} />
                )}
                <div>
                  <p><strong>{product.title}</strong></p>
                  <p>{product.price} MAD</p>
                  <p>
                    <strong>Approbation :</strong>{' '}
                    <span style={{
                      color: { pending: '#e67e22', approved: '#27ae60', rejected: '#e74c3c' }[product.approvalStatus]
                    }}>
                      {{ pending: 'En attente', approved: 'Approuvé', rejected: 'Refusé' }[product.approvalStatus]}
                    </span>
                  </p>
                  <p>
                    <strong>État :</strong>{' '}
                    <span className={product.status === 'Disponible' ? 'status-disponible' : 'status-vendu'}>
                      {product.status}
                    </span>
                  </p>

                  <div className="product-item-buttons">
                    <button className="delete-btn" onClick={() => handleDelete(product._id)}>Supprimer</button>
                    <button className="edit-btn" onClick={() => handleEditClick(product)}>Modifier</button>
                  </div>

                  {editProduct?._id === product._id && (
                    <div className="edit-form">
                      <input type="text" name="title" value={editForm.title} onChange={handleEditChange} placeholder="Titre" />
                      <input type="number" name="price" value={editForm.price} onChange={handleEditChange} placeholder="Prix" />
                      <select name="status" value={editForm.status} onChange={handleEditChange}>
                        <option value="Disponible">Disponible</option>
                        <option value="Vendu">Vendu</option>
                      </select>
                      <input type="file" onChange={e => setEditForm(prev => ({ ...prev, image: e.target.files[0] }))} />
                      <button onClick={submitEdit}>Enregistrer</button>
                      <button onClick={() => setEditProduct(null)}>Annuler</button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default MonCompte;