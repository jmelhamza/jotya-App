import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null); // 👈 الصورة المفتوحة
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/products');
        setProducts(res.data.data);
      } catch (err) {
        setError('Erreur lors du chargement des produits');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) return <p>Chargement des produits...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="products-container">
      <h2>Produits disponibles</h2>
      <div className="products-grid">
        {products.length === 0 ? (
          <p>Aucun produit disponible.</p>
        ) : (
          products.map(product => (
            <div key={product._id} className="product-card">
              {product.image && product.image.length > 0 && (
                <img
                  src={`http://localhost:5000${product.image[0]}`}
                  alt={product.title}
                  onClick={() => setSelectedImage(`http://localhost:5000${product.image[0]}`)}
                  className="product-image"
                />
              )}
              <h3>{product.title}</h3>
              <p>{product.description}</p>
              <p className="price">{product.price} MAD</p>
              {product.seller ? (
                <p>Publié par: <a href={`/vendeur/${product.seller._id}`}>{product.seller.name}</a></p>
              ) : (
                <p>Vendeur inconnu</p>
              )}
            </div>
          ))
        )}
      </div>

      {/* 👇 Popup de l'image */}
      {selectedImage && (
  <div className="image-popup">
    <button className="close-button" onClick={() => setSelectedImage(null)}>Fermer ✖</button>
    <img src={selectedImage} alt="Agrandie" />
  </div>
)}
    </div>
  );
};

export default Products;
