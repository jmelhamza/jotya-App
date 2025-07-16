import React, { useState } from 'react';
import axios from 'axios';
import "../styles/AjouterProduit.css"

// ✅ أضف هذا السطر في الأعلى لاستخدام المتغير البيئي
const API_BASE_URL = import.meta.env.VITE_API_URL;

const categories = [
  { value: 'Electronique', label: 'Électronique' },
  { value: 'Vetements', label: 'Vêtements' },
  { value: 'Meubles', label: 'Meubles' },
  { value: 'Cuisine', label: 'Cuisine & vaisselle' },
  { value: 'Jouets', label: 'Jouets' },
  { value: 'Livres', label: 'Livres & médias' },
  { value: 'Outils', label: 'Outils' },
  { value: 'Accessoires', label: 'Accessoires & bijoux' },
  { value: 'Decoration', label: 'Décoration' },
  { value: 'Sport', label: 'Sport & loisirs' },
];

const AjouterProduit = () => {
  const [form, setForm] = useState({
    title: '',
    price: '',
    description: '',
    status: 'Disponible',
    category: '',
    image: null,
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setForm(prev => ({ ...prev, image: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title || !form.price || !form.category || !form.image) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('price', form.price);
    formData.append('description', form.description);
    formData.append('status', form.status);
    formData.append('category', form.category);
    formData.append('image', form.image);

    try {
      const token = localStorage.getItem('token');
      // ✅ تم تعديل هذا السطر لاستخدام الرابط الأساسي الديناميكي
      await axios.post(`${API_BASE_URL}/api/products`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      setMessage('Produit ajouté avec succès !');
      setError('');
      setForm({
        title: '',
        price: '',
        description: '',
        status: 'Disponible',
        category: '',
        image: null,
      });
    } catch (err) {
      setError('Erreur lors de l\'ajout du produit.');
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="ajouter-produit-form">
      <input
        type="text"
        name="title"
        value={form.title}
        onChange={handleChange}
        placeholder="Titre"
        required
      />
      <input
        type="number"
        name="price"
        value={form.price}
        onChange={handleChange}
        placeholder="Prix"
        required
      />
      <textarea
        name="description"
        value={form.description}
        onChange={handleChange}
        placeholder="Description"
      />

      <select
        name="status"
        value={form.status}
        onChange={handleChange}
      >
        <option value="Disponible">Disponible</option>
        <option value="Vendu">Vendu</option>
      </select>

      <select
        name="category"
        value={form.category}
        onChange={handleChange}
        required
      >
        <option value="">-- Choisissez une catégorie --</option>
        {categories.map(cat => (
          <option key={cat.value} value={cat.value}>
            {cat.label}
          </option>
        ))}
      </select>

      <input
        type="file"
        onChange={handleFileChange}
        required
      />

      <button type="submit">Ajouter le produit</button>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
    </form>
  );
};

export default AjouterProduit;