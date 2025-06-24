import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const SellerProfile = () => {
  const { id } = useParams();
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSeller = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/users/${id}`);
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
    <div>
      <h2>Profil de {seller.name}</h2>
      <p>Email: {seller.email}</p>
      <p>Téléphone: {seller.phone ? seller.phone : 'Non renseigné'}</p>
      {/* عرض معلومات أخرى إذا بغيت */}
    </div>
  );
};

export default SellerProfile;
