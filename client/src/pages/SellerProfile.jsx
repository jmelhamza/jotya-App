import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

// ✅ أضف هذا السطر في الأعلى لاستخدام المتغير البيئي
const API_BASE_URL = import.meta.env.VITE_API_URL;

const SellerProfile = () => {
  const { id } = useParams();
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSeller = async () => {
      try {
        // ✅ تم تعديل رابط API
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

  return (
    <div style={{ maxWidth: '500px', margin: 'auto', padding: '1rem', textAlign: 'center' }}>
      {seller.image ? (
        <img
          // ✅ تم تعديل رابط الصورة
          src={`${API_BASE_URL}${seller.image}`}
          alt={seller.name}
          style={{
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            objectFit: 'cover',
            marginBottom: '1rem',
            border: '2px solid #ccc'
          }}
        />
      ) : (
        <div
          style={{
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            backgroundColor: '#ddd',
            display: 'inline-block',
            marginBottom: '1rem',
            lineHeight: '150px',
            fontSize: '3rem',
            color: '#666'
          }}
        >
          {seller.name.charAt(0).toUpperCase()}
        </div>
      )}
      <h2>Profil de {seller.name}</h2>
      <p><strong>Email :</strong> {seller.email}</p>
      <p><strong>Téléphone :</strong> {seller.phone ? seller.phone : 'Non renseigné'}</p>
    </div>
  );
};

export default SellerProfile;