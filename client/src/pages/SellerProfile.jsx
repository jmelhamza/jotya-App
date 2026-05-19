import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import '../styles/SellerProfile.css';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const SellerProfile = () => {
  const { id } = useParams();
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSeller = async () => {
      try {
        const [userRes, productsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/users/${id}`),
          axios.get(`${API_BASE_URL}/api/products/user/${id}`),
        ]);
        setSeller(userRes.data);
        setProducts(productsRes.data);
      } catch (err) {
        setError('Erreur lors de la récupération des données du vendeur.');
      } finally {
        setLoading(false);
      }
    };
    fetchSeller();
  }, [id]);

  if (loading) return <p>Chargement du profil...</p>;
  if (error) return <p>{error}</p>;
  if (!seller) return <p>Vendeur introuvable.</p>;

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

      <h2>
        {seller.shopName ? seller.shopName : `Profil de ${seller.name}`}
      </h2>

      {seller.shopName && <p style={{ color: '#888', marginBottom: '4px' }}>Vendeur : {seller.name}</p>}

      {seller.phone && <p>📞 <strong>Téléphone :</strong> {seller.phone}</p>}

      <div className="social-media-links">
        {seller.whatsapp && (
          <a
            href={`https://wa.me/${seller.whatsapp.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            💬 WhatsApp
          </a>
        )}
        {seller.facebook && (
          <a
            href={seller.facebook}
            target="_blank"
            rel="noopener noreferrer"
          >
            Facebook
          </a>
        )}
      </div>

      {products.length > 0 && (
        <div style={{ marginTop: '32px', width: '100%' }}>
          <h3>Produits de ce vendeur</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px', marginTop: '16px' }}>
            {products.filter(p => p.approvalStatus === 'approved').map(p => (
              <div key={p._id} style={{ border: '1px solid #eee', borderRadius: '10px', overflow: 'hidden' }}>
                {p.image?.[0] && (
                  <img
                    src={`${API_BASE_URL}${p.image[0]}`}
                    alt={p.title}
                    style={{ width: '100%', height: '130px', objectFit: 'cover' }}
                  />
                )}
                <div style={{ padding: '10px' }}>
                  <p style={{ fontWeight: '600', margin: '0 0 4px' }}>{p.title}</p>
                  <p style={{ color: '#e63946', margin: 0 }}>{p.price} MAD</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerProfile;