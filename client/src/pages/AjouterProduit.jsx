import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import PaymentModal from '../componnents/PaymentModal';
import "../styles/AjouterProduit.css";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const categories = [
  { value: 'Electronique', label: 'Électronique' },
  { value: 'Telephonie', label: 'Téléphonie' },
  { value: 'Informatique', label: 'Informatique' },
  { value: 'Vetements', label: 'Vêtements' },
  { value: 'Chaussures', label: 'Chaussures' },
  { value: 'Sacs', label: 'Sacs' },
  { value: 'Accessoires', label: 'Accessoires & bijoux' },
  { value: 'Beaute', label: 'Beauté & soins' },
  { value: 'Meubles', label: 'Meubles' },
  { value: 'Decoration', label: 'Décoration' },
  { value: 'Cuisine', label: 'Cuisine & vaisselle' },
  { value: 'Jouets', label: 'Jouets' },
  { value: 'Livres', label: 'Livres & médias' },
  { value: 'Sport', label: 'Sport & loisirs' },
  { value: 'Outils', label: 'Outils' },
  { value: 'Vehicules', label: 'Véhicules' },
  { value: 'Immobilier', label: 'Immobilier' },
  { value: 'Animaux', label: 'Animaux' },
  { value: 'Services', label: 'Services' },
  { value: 'Autres', label: 'Autres' },
];

const AjouterProduit = () => {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ title: '', price: '', description: '', status: 'Disponible', category: '' });
  const [images, setImages] = useState([]);
  const [publishOption, setPublishOption] = useState('');
  const [error, setError] = useState('');
  const [createdProductId, setCreatedProductId] = useState(null);
  const [showPayModal, setShowPayModal] = useState(false);

  if (!isLoggedIn) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h2>Connexion requise</h2>
        <p>Veuillez <Link to="/connexion">vous connecter</Link> pour ajouter un produit.</p>
      </div>
    );
  }

  if (user?.role === 'user') {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h2>Accès réservé aux vendeurs</h2>
        <p>Vous devez d'abord <Link to="/devenir-vendeur">devenir vendeur</Link> pour publier des produits.</p>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.title || !form.price || !form.category) {
      setError('Titre, prix et catégorie sont obligatoires.');
      return;
    }
    if (!publishOption) {
      setError('Choisissez une option de publication.');
      return;
    }

    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('price', form.price);
    formData.append('description', form.description);
    formData.append('status', form.status);
    formData.append('category', form.category);
    formData.append('publishOption', publishOption);
    images.forEach(img => formData.append('image', img));

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_BASE_URL}/api/products`, formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
      });

      const productId = res.data.data?._id || res.data._id;
      setCreatedProductId(productId);

      if (publishOption === 'paid_flat') {
        setShowPayModal(true);
      } else {
        navigate('/mes-ventes');
      }
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'ajout du produit.");
    }
  };

  const handlePaymentSuccess = () => {
    setShowPayModal(false);
    navigate('/mes-ventes');
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="ajouter-produit-form">
        <h2>Ajouter un produit</h2>

        <input type="text" name="title" value={form.title} onChange={handleChange} placeholder="Titre du produit *" required />
        <input type="number" name="price" value={form.price} onChange={handleChange} placeholder="Prix en MAD *" required min="0" />
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description (optionnel)" rows={4} />
        <select name="status" value={form.status} onChange={handleChange}>
          <option value="Disponible">Disponible</option>
          <option value="Vendu">Vendu</option>
        </select>
        <select name="category" value={form.category} onChange={handleChange} required>
          <option value="">-- Choisissez une catégorie *</option>
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
        <input type="file" multiple accept="image/*" onChange={e => setImages([...e.target.files])} />
        <p style={{ fontSize: '12px', color: '#aaa', marginTop: '-8px' }}>Vous pouvez sélectionner plusieurs photos.</p>

        <div style={styles.optionSection}>
          <p style={styles.optionTitle}>Comment voulez-vous publier ?</p>

          <div onClick={() => setPublishOption('paid_flat')} style={{ ...styles.optionCard, ...(publishOption === 'paid_flat' ? styles.optionCardActive : {}) }}>
            <div style={styles.optionHeader}>
              <span style={styles.optionName}>💳 Publication directe — 35 DH</span>
              <span style={styles.optionRadio}>{publishOption === 'paid_flat' ? '🔵' : '⚪'}</span>
            </div>
            <p style={styles.optionDesc}>Payez 35 DH une seule fois. Votre annonce est publiée immédiatement. Les acheteurs payent 20 DH pour voir vos coordonnées.</p>
          </div>

          <div onClick={() => setPublishOption('commission')} style={{ ...styles.optionCard, ...(publishOption === 'commission' ? styles.optionCardActive : {}) }}>
            <div style={styles.optionHeader}>
              <span style={styles.optionName}>🤝 Publication gratuite — 15% commission</span>
              <span style={styles.optionRadio}>{publishOption === 'commission' ? '🔵' : '⚪'}</span>
            </div>
            <p style={styles.optionDesc}>Publication gratuite. Jotya prend 15% sur chaque vente réalisée via la plateforme. L'annonce sera validée par un admin.</p>
          </div>
        </div>

        {error && <p className="error">{error}</p>}

        <button type="submit">
          {publishOption === 'paid_flat' ? 'Continuer vers le paiement →' : 'Soumettre le produit'}
        </button>
      </form>

      {showPayModal && createdProductId && (
        <PaymentModal
          type="publish_product"
          productId={createdProductId}
          amount={35}
          label="Publication de votre produit sur Jotya"
          onSuccess={handlePaymentSuccess}
          onClose={() => setShowPayModal(false)}
        />
      )}
    </>
  );
};

const styles = {
  optionSection: { margin: '16px 0' },
  optionTitle: { fontWeight: '700', fontSize: '14px', marginBottom: '10px', color: '#1a1a1a' },
  optionCard: { border: '2px solid #e5e7eb', borderRadius: '12px', padding: '14px 16px', marginBottom: '10px', cursor: 'pointer', transition: 'border-color 0.2s', background: '#fafafa' },
  optionCardActive: { borderColor: '#e63946', background: '#fff5f5' },
  optionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' },
  optionName: { fontWeight: '700', fontSize: '14px' },
  optionRadio: { fontSize: '16px' },
  optionDesc: { fontSize: '13px', color: '#666', margin: 0, lineHeight: '1.5' },
};

export default AjouterProduit;