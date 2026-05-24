import React, { useState, useRef } from 'react';
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

const MAX_IMAGES = 5;

const AjouterProduit = () => {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();
  const inputRef = useRef(null);

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

  const isAdmin = user?.role === 'admin';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Add new files without losing existing ones
  const handleFilePick = (e) => {
    const picked = Array.from(e.target.files);
    setImages(prev => {
      const combined = [...prev, ...picked];
      return combined.slice(0, MAX_IMAGES);
    });
    // reset input so same file can be re-added after removal
    e.target.value = '';
  };

  const removeImage = (idx) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.title || !form.price || !form.category) {
      setError('Titre, prix et catégorie sont obligatoires.');
      return;
    }
    if (!isAdmin && !publishOption) {
      setError('Choisissez une option de publication.');
      return;
    }

    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('price', form.price);
    formData.append('description', form.description);
    formData.append('status', form.status);
    formData.append('category', form.category);
    formData.append('publishOption', isAdmin ? 'commission' : publishOption);
    images.forEach(img => formData.append('image', img));

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_BASE_URL}/api/products`, formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
      });

      const productId = res.data.data?._id || res.data._id;
      setCreatedProductId(productId);

      if (!isAdmin && publishOption === 'paid_flat') {
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

  const canAddMore = images.length < MAX_IMAGES;

  return (
    <>
      {/* hidden file input — single source of truth */}
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFilePick}
      />

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

        {/* ── Photo upload ── */}
        <div>
          <p style={{ margin: '0 0 10px', fontWeight: '600', fontSize: '13px', color: '#6b4c2a', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Photos ({images.length}/{MAX_IMAGES})
          </p>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            {/* Existing previews */}
            {images.map((img, i) => (
              <div key={i} style={{ position: 'relative', flexShrink: 0 }}>
                <img
                  src={URL.createObjectURL(img)}
                  alt={`photo ${i + 1}`}
                  style={{
                    width: '80px', height: '80px',
                    objectFit: 'cover',
                    borderRadius: '4px',
                    border: i === 0 ? '2px solid #c9983a' : '2px solid rgba(107,76,42,0.2)',
                    filter: 'sepia(8%)',
                    display: 'block',
                  }}
                />
                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  style={{
                    position: 'absolute', top: '-7px', right: '-7px',
                    width: '20px', height: '20px',
                    background: '#c0542a', color: '#fff',
                    border: 'none', borderRadius: '50%',
                    fontSize: '11px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    lineHeight: 1, padding: 0,
                  }}
                >✕</button>
                {i === 0 && (
                  <span style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    background: 'rgba(201,152,58,0.85)',
                    color: '#fff', fontSize: '8px',
                    textAlign: 'center', padding: '2px 0',
                    letterSpacing: '0.08em', fontWeight: '700',
                  }}>PRINCIPALE</span>
                )}
              </div>
            ))}

            {/* Add more button — only shows if under MAX */}
            {canAddMore && (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                style={{
                  width: '80px', height: '80px',
                  border: '2px dashed rgba(107,76,42,0.35)',
                  borderRadius: '4px',
                  background: 'rgba(201,152,58,0.06)',
                  cursor: 'pointer',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  gap: '4px', color: '#8a6a4a',
                  fontSize: '1.6rem', lineHeight: 1,
                  flexShrink: 0,
                }}
              >
                <span>+</span>
                <span style={{ fontSize: '9px', letterSpacing: '0.04em', fontWeight: '600' }}>PHOTO</span>
              </button>
            )}

            {/* Empty state — no photos yet */}
            {images.length === 0 && !canAddMore === false && (
              <p style={{ fontSize: '12px', color: '#aaa', margin: '8px 0 0', width: '100%' }}>
                Ajoutez jusqu'à {MAX_IMAGES} photos. La 1ère sera la photo principale.
              </p>
            )}
          </div>

          {images.length === 0 && (
            <p style={{ fontSize: '12px', color: '#a08060', margin: '8px 0 0' }}>
              Ajoutez jusqu'à {MAX_IMAGES} photos · La 1ère sera la principale
            </p>
          )}
        </div>

        {!isAdmin && (
          <div style={styles.optionSection}>
            <p style={styles.optionTitle}>Comment voulez-vous publier ?</p>

            <div onClick={() => setPublishOption('paid_flat')} style={{ ...styles.optionCard, ...(publishOption === 'paid_flat' ? styles.optionCardActive : {}) }}>
              <div style={styles.optionHeader}>
                <span style={styles.optionName}>💳 Publication directe — 50 DH</span>
                <span style={styles.optionRadio}>{publishOption === 'paid_flat' ? '🔵' : '⚪'}</span>
              </div>
              <p style={styles.optionDesc}>Payez 50 DH une seule fois. Votre annonce est publiée immédiatement. Les acheteurs payent 50 DH pour voir vos coordonnées.</p>
            </div>

            <div onClick={() => setPublishOption('commission')} style={{ ...styles.optionCard, ...(publishOption === 'commission' ? styles.optionCardActive : {}) }}>
              <div style={styles.optionHeader}>
                <span style={styles.optionName}>🤝 Publication gratuite — 15% commission</span>
                <span style={styles.optionRadio}>{publishOption === 'commission' ? '🔵' : '⚪'}</span>
              </div>
              <p style={styles.optionDesc}>Publication gratuite. Jotya prend 15% sur chaque vente réalisée via la plateforme. L'annonce sera validée par un admin.</p>
            </div>
          </div>
        )}

        {error && <p className="error">{error}</p>}

        <button type="submit">
          {isAdmin ? 'Publier le produit' : (publishOption === 'paid_flat' ? 'Continuer vers le paiement →' : 'Soumettre le produit')}
        </button>
      </form>

      {showPayModal && createdProductId && (
        <PaymentModal
          type="publish_product"
          productId={createdProductId}
          amount={50}
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