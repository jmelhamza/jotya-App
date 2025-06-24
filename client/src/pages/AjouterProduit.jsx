import React, { useState } from 'react';
import axios from 'axios';
import "../styles/AjouterProduit.css"

const AjouterProduit = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    image: '',
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');

  const handleChange = e => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Le titre est requis';
    if (!formData.price || isNaN(formData.price)) newErrors.price = 'Prix valide requis';
    if (!formData.image.trim()) newErrors.image = 'URL de l\'image requise';
    return newErrors;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('');
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      try {
        const token = localStorage.getItem('token');
        const productData = {
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          image: [formData.image],  // لأن في الموديل image هو array
        };

        await axios.post('http://localhost:5000/api/products', productData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setMessage('Produit ajouté avec succès!');
        setFormData({title: '', description: '', price: '', image: ''});
      } catch (error) {
        console.error("Erreur Axios:", error.response)
        setMessage('Erreur lors de l\'ajout du produit');
      }
    }
  };

  return (
    <div className="ajouter-produit-container" style={{maxWidth:'600px', margin:'20px auto'}}>
      <h2>Ajouter un produit</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          placeholder="Titre"
          value={formData.title}
          onChange={handleChange}
        />
        {errors.title && <p className="error">{errors.title}</p>}

        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
        />

        <input
          type="text"
          name="price"
          placeholder="Prix"
          value={formData.price}
          onChange={handleChange}
        />
        {errors.price && <p className="error">{errors.price}</p>}

        <input
          type="text"
          name="image"
          placeholder="URL de l'image"
          value={formData.image}
          onChange={handleChange}
        />
        {errors.image && <p className="error">{errors.image}</p>}

        <button type="submit">Ajouter</button>
      </form>
    </div>
  );
};

export default AjouterProduit;
