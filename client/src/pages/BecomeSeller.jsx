import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const BecomeSeller = () => {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    shopName: '',
    phone: '',
    whatsapp: '',
    facebook: '',
  });
  const [cinFile, setCinFile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isLoggedIn) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h2>Vous devez être connecté</h2>
        <p>Veuillez <a href="/connexion">vous connecter</a> pour faire une demande.</p>
      </div>
    );
  }

  if (user?.role === 'seller') {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h2>Vous êtes déjà vendeur ✅</h2>
        <p>Vous pouvez <a href="/ajouter-produit">ajouter vos produits</a>.</p>
      </div>
    );
  }

  if (user?.role === 'admin') {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h2>Vous êtes administrateur</h2>
        <p>Vous avez accès à toutes les fonctionnalités.</p>
      </div>
    );
  }

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!form.shopName || !form.phone) {
      setError('Nom de la boutique et téléphone sont obligatoires.');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('shopName', form.shopName);
      formData.append('phone', form.phone);
      formData.append('whatsapp', form.whatsapp);
      formData.append('facebook', form.facebook);
      if (cinFile) formData.append('cinImage', cinFile);

      await axios.post(`${API_BASE_URL}/api/users/become-seller`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage('Votre demande a été envoyée ! L\'admin l\'examinera bientôt.');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'envoi de la demande.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '520px', margin: '60px auto', padding: '0 20px' }}>
      <h2 style={{ marginBottom: '8px' }}>Devenir vendeur</h2>
      <p style={{ color: '#666', marginBottom: '28px' }}>
        Remplissez ce formulaire et l'admin validera votre compte vendeur.
      </p>

      {message && (
        <div style={{ background: '#e8f5e9', color: '#2e7d32', padding: '14px', borderRadius: '10px', marginBottom: '20px' }}>
          {message}
        </div>
      )}
      {error && (
        <div style={{ background: '#ffebee', color: '#c62828', padding: '14px', borderRadius: '10px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {!message && (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '5px' }}>
              Nom de la boutique *
            </label>
            <input
              type="text"
              name="shopName"
              value={form.shopName}
              onChange={handleChange}
              placeholder="Ex: Boutique Amina"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '5px' }}>
              Téléphone *
            </label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Ex: 0612345678"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '5px' }}>
              WhatsApp (optionnel)
            </label>
            <input
              type="text"
              name="whatsapp"
              value={form.whatsapp}
              onChange={handleChange}
              placeholder="Ex: 212612345678"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '5px' }}>
              Lien Facebook (optionnel)
            </label>
            <input
              type="text"
              name="facebook"
              value={form.facebook}
              onChange={handleChange}
              placeholder="https://facebook.com/votre-page"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '5px' }}>
              Carte d'identité (CIN) — photo recto/verso (optionnel)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={e => setCinFile(e.target.files[0])}
              style={{ fontSize: '14px' }}
            />
            <p style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
              L'image de votre CIN est utilisée uniquement pour la vérification.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '14px',
              background: loading ? '#ccc' : '#333',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '6px',
            }}
          >
            {loading ? 'Envoi en cours...' : 'Envoyer la demande'}
          </button>
        </form>
      )}
    </div>
  );
};

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: '8px',
  border: '1px solid #ccc',
  fontSize: '14px',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
};

export default BecomeSeller;