import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import '../styles/MonCompte.css';

// ✅ أضف هذا السطر في الأعلى لاستخدام المتغير البيئي
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

        // ✅ تعديل رابط API الأول
        const userRes = await axios.get(`${API_BASE_URL}/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(userRes.data);

        // ✅ تعديل رابط API الثاني
        const productsRes = await axios.get(`${API_BASE_URL}/api/products/user/${userId}`);
        setMyProducts(productsRes.data);
      } catch (err) {
        setError('Erreur lors de la récupération des données utilisateur.');
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
      // ✅ تعديل رابط API الثالث
      await axios.put(`${API_BASE_URL}/api/users/upload-profile`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      setMessage("Photo mise à jour avec succès !");
      window.location.reload();
    } catch (err) {
      setError("Erreur lors de l'envoi de l'image.");
    }
  };

  const handleDelete = async (productId) => {
    const confirm = window.confirm("Voulez-vous vraiment supprimer ce produit ?");
    if (!confirm) return;

    try {
      const token = localStorage.getItem('token');
      // ✅ تعديل رابط API الرابع
      await axios.delete(`${API_BASE_URL}/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyProducts(myProducts.filter(p => p._id !== productId));
      setMessage("Produit supprimé avec succès !");
    } catch (err) {
      alert("Erreur lors de la suppression du produit.");
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

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    setEditForm((prev) => ({ ...prev, image: file }));
  };

  const submitEdit = async () => {
    if (!editProduct) return;
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('title', editForm.title);
      formData.append('price', editForm.price);
      formData.append('status', editForm.status);
      if (editForm.image) {
        formData.append('image', editForm.image);
      }

      // ✅ تعديل رابط API الخامس
      const res = await axios.put(`${API_BASE_URL}/api/products/${editProduct._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      const updated = res.data.data;
      setMyProducts(myProducts.map(p => p._id === updated._id ? updated : p));
      setEditProduct(null);
      setMessage("Produit modifié avec succès !");
      setError('');
    } catch (err) {
      setError("Erreur lors de la modification du produit.");
      setMessage('');
    }
  };

  if (loading) return <p className="loading">Chargement des données utilisateur...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!user) return <p className="error">Utilisateur non trouvé.</p>;

  return (
    <div className="mon-compte-container">
      <h2>Mon Compte</h2>

      <div className="user-info-card">
        <div className="profile-section">
          {user.image && (
            // ✅ تعديل رابط الصورة الأول
            <img
              src={`${API_BASE_URL}${user.image}`}
              alt="photo de profil"
              className="user-image"
            />
          )}
          <div className="upload-button-wrapper">
            <label htmlFor="profile-upload" className="custom-upload-button">Changer la photo</label>
            <input id="profile-upload" type="file" onChange={handleImageChange} />
          </div>
        </div>

        <div className="info-section">
          <p><strong>Nom :</strong> {user.name}</p>
          <p><strong>Email :</strong> {user.email}</p>
          <p><strong>Téléphone :</strong> {user.phone || 'Non renseigné'}</p>
          {message && <p className="success">{message}</p>}
          {error && <p className="error">{error}</p>}
        </div>
      </div>

      <div className="my-products">
        <h3>Mes Produits</h3>
        {myProducts.length === 0 ? (
          <p>Aucun produit ajouté.</p>
        ) : (
          myProducts.map((product) => (
            <div key={product._id} className="product-item">
              {product.image && product.image[0] && (
                // ✅ تعديل رابط الصورة الثاني
                <img src={`${API_BASE_URL}${product.image[0]}`} alt={product.title} />
              )}
              <div>
                <p><strong>{product.title}</strong></p>
                <p>{product.price} MAD</p>
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

                {editProduct && editProduct._id === product._id && (
                  <div className="edit-form">
                    <input
                      type="text"
                      name="title"
                      value={editForm.title}
                      onChange={handleEditChange}
                      placeholder="Titre"
                    />
                    <input
                      type="number"
                      name="price"
                      value={editForm.price}
                      onChange={handleEditChange}
                      placeholder="Prix"
                    />
                    <select
                      name="status"
                      value={editForm.status}
                      onChange={handleEditChange}
                    >
                      <option value="Disponible">Disponible</option>
                      <option value="Vendu">Vendu</option>
                    </select>
                    <input type="file" onChange={handleEditImageChange} />
                    <button onClick={submitEdit}>Enregistrer</button>
                    <button onClick={() => setEditProduct(null)}>Annuler</button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MonCompte;