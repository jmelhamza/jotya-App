import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import '../styles/MonCompte.css';

const MonCompte = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Vous devez être connecté.');
          setLoading(false);
          return;
        }

        const decoded = jwtDecode(token);
        const userId = decoded.id || decoded._id;

        const res = await axios.get(`http://localhost:5000/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setUser(res.data);
      } catch (err) {
        setError('Erreur lors de la récupération des données utilisateur.');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5000/api/users/upload-profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      setMessage("Photo mise à jour avec succès !");
      window.location.reload(); // إعادة تحميل الصفحة لعرض الصورة الجديدة
    } catch (err) {
      setError("Erreur lors de l'envoi de l'image.");
    }
  };

  if (loading) return <p className="loading">Chargement des données utilisateur...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!user) return <p className="error">Utilisateur non trouvé.</p>;

  return (
    <div className="mon-compte-container">
      <h2>Mon Compte</h2>

      <div className="user-info">
        {user.image && (
          <img
            src={`http://localhost:5000${user.image}`}
            alt="photo de profil"
            className="user-image"
          />
        )}
        <input type="file" onChange={handleImageChange} />
        <p><strong>Nom :</strong> {user.name}</p>
        <p><strong>Email :</strong> {user.email}</p>
        <p><strong>Téléphone :</strong> {user.phone || 'Non renseigné'}</p>
        {message && <p className="success">{message}</p>}
      </div>
    </div>
  );
};

export default MonCompte;
