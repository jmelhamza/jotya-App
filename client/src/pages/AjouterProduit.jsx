import React, { useState } from 'react';
import axios from 'axios';
import '../styles/AjouterProduit.css';

const AjouterProduit = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState(''); // ✅ state ديال الوصف
  const [price, setPrice] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!imageFile) {
      alert('Veuillez choisir une image');
      return;
    }

    try {
      // رفع الصورة
      const formData = new FormData();
      formData.append('image', imageFile);

      const uploadRes = await axios.post('http://localhost:5000/api/products/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const imageUrl = uploadRes.data.imageUrl;

      // إرسال البيانات
      await axios.post('http://localhost:5000/api/products', {
        title,
        description, // ✅ نضيف الوصف هنا
        price,
        image: [imageUrl],
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        }
      });

      alert('Produit ajouté avec succès!');
      setTitle('');
      setDescription('');
      setPrice('');
      setImageFile(null);
      setImagePreview(null);
    } catch (error) {
      console.error(error);
      alert("Erreur lors de l'ajout du produit");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="ajouter-produit-form">
      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Titre du produit"
        required
      />
      
      <textarea
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="Description du produit"
        required
      ></textarea>

      <input
        type="number"
        value={price}
        onChange={e => setPrice(e.target.value)}
        placeholder="Prix"
        required
      />

      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        required
      />

      {imagePreview && <img src={imagePreview} alt="Prévisualisation" style={{ width: '150px', marginTop: '10px' }} />}

      <button type="submit">Ajouter produit</button>
    </form>
  );
};

export default AjouterProduit;
