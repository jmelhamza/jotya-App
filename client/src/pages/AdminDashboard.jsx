import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/AdminDashboard.css';

// ✅ أضف هذا السطر في الأعلى لاستخدام المتغير البيئي
const API_BASE_URL = import.meta.env.VITE_API_URL;

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchUsers();
    fetchProducts();
  }, []);

  const fetchUsers = async () => {
    try {
      // ✅ تم تعديل رابط API الأول
      const res = await axios.get(`${API_BASE_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error('Erreur utilisateurs:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      // ✅ تم تعديل رابط API الثاني
      const res = await axios.get(`${API_BASE_URL}/api/products`);
      setProducts(res.data.data);
    } catch (err) {
      console.error('Erreur produits:', err);
    }
  };

  const deleteUser = async (id) => {
    try {
      // ✅ تم تعديل رابط API الثالث
      await axios.delete(`${API_BASE_URL}/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage('Utilisateur supprimé');
      fetchUsers();
    } catch (err) {
      setMessage("Erreur lors de la suppression de l'utilisateur");
    }
  };

  const deleteProduct = async (id) => {
    try {
      // ✅ تم تعديل رابط API الرابع
      await axios.delete(`${API_BASE_URL}/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage('Produit supprimé');
      fetchProducts();
    } catch (err) {
      setMessage("Erreur lors de la suppression du produit");
    }
  };

  return (
    <div className="admin-dashboard">
      <h2>Dashboard Admin</h2>
      {message && <p>{message}</p>}

      <div className="dashboard-section">
        <h3>Utilisateurs</h3>
        <table>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <button onClick={() => deleteUser(user._id)}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="dashboard-section">
        <h3>Produits</h3>
        <table>
          <thead>
            <tr>
              <th>Titre</th>
              <th>Prix</th>
              <th>Vendeur</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id}>
                <td>{product.title}</td>
                <td>{product.price} DH</td>
                <td>{product.seller ? product.seller.name : "Vendeur inconnu"}</td>

                <td>
                  <button onClick={() => deleteProduct(product._id)}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;