import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
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

  const [form, setForm] = useState({
    title: '',
    price: '',
    description: '',
    status: 'Disponible',
    category: '',
  });
  const [images, setImages] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

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

  const handleFileChange = (e) => {
    setImages([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!form.title || !form.price || !form.category) {
      setError('Titre, prix et catégorie sont obligatoires.');
      return;
    }

    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('price', form.price);
    formData.append('description', form.description);
    formData.append('status', form.status);
    formData.append('category', form.category);
    images.forEach(img => formData.append('image', img));

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/api/products`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      setMessage('Produit soumis ! Il sera publié après validation par l\'admin.');
      setError('');
      setForm({ title: '', price: '', description: '', status: 'Disponible', category: '' });
      setImages([]);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'ajout du produit.");
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="ajouter-produit-form">
      <h2>Ajouter un produit</h2>
      <p style={{ fontSize: '13px', color: '#888', marginBottom: '16px' }}>
        Votre produit sera soumis à validation avant d'être publié.
      </p>

      <input
        type="text"
        name="title"
        value={form.title}
        onChange={handleChange}
        placeholder="Titre du produit *"
        required
      />
      <input
        type="number"
        name="price"
        value={form.price}
        onChange={handleChange}
        placeholder="Prix en MAD *"
        required
        min="0"
      />
      <textarea
        name="description"
        value={form.description}
        onChange={handleChange}
        placeholder="Description (optionnel)"
        rows={4}
      />

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

      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileChange}
      />
      <p style={{ fontSize: '12px', color: '#aaa', marginTop: '-8px' }}>Vous pouvez sélectionner plusieurs photos.</p>

      <button type="submit">Soumettre le produit</button>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
    </form>
  );
};

export default AjouterProduit;