// client/src/pages/SellerProfile.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import '../styles/SellerProfile.css';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const SellerProfile = () => {
  const { id } = useParams();
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSeller = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/users/${id}`);
        setSeller(res.data);
      } catch (err) {
        setError('Erreur lors de la récupération des données du vendeur');
      } finally {
        setLoading(false);
      }
    };
    fetchSeller();
  }, [id]);

  if (loading) return <p>Chargement du profil...</p>;
  if (error) return <p>{error}</p>;
  if (!seller) return <p>Vendeur non trouvé.</p>;

  return (
    <div className="seller-profile-container">
      {seller.image ? (
        <img
          src={`${API_BASE_URL}${seller.image}`}
          alt={seller.name}
          className="profile-image"
        />
      ) : (
        <div className="profile-placeholder">
          {seller.name.charAt(0).toUpperCase()}
        </div>
      )}
      <h2>Profil de {seller.name}</h2>
      <p><strong>Téléphone :</strong> {seller.phone ? seller.phone : 'Non renseigné'}</p>
      
      {/* ✅ هذا هو القسم الجديد مع الروابط النصية */}
      <div className="social-media-links">
        <a href="https://www.facebook.com/hamza.houari.18062" target="_blank" rel="noopener noreferrer">
            Facebook
        </a>
        <a href="https://www.instagram.com/hamza_ijmal/" target="_blank" rel="noopener noreferrer">
            Instagram
        </a>
        <a href={`https://wa.me/212639691765`} target="_blank" rel="noopener noreferrer">
            WhatsApp
        </a>
      </div>

    </div>
  );
};

export default SellerProfile;