import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import '../styles/Products.css';
import { CartContext } from '../context/CartContext.jsx';

const categories = [
  'Tous',
  'Electronique',
  'Vetements',
  'Meubles',
  'Cuisine',
  'Jouets',
  'Livres',
  'Outils',
  'Accessoires',
  'Decoration',
  'Sport',
];

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filterCat, setFilterCat] = useState('Tous');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const { addToCart } = useContext(CartContext);

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

  const filteredProducts = filterCat === 'Tous' ? products : products.filter(p => p.category === filterCat);

  if (loading) return <p>Chargement des produits...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="products-container">
      <h2>Produits disponibles</h2>

      <div className="filter-buttons">
        {categories.map(cat => (
          <button
            key={cat}
            className={filterCat === cat ? 'active-filter' : ''}
            onClick={() => setFilterCat(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="products-grid">
        {filteredProducts.length === 0 ? (
          <p>Aucun produit disponible dans cette catégorie.</p>
        ) : (
          filteredProducts.map(product => (
            <div key={product._id} className="product-card">
              {product.image && product.image.length > 0 && (
                <img
                  src={`http://localhost:5000${product.image[0]}`}
                  alt={product.title}
                  className="product-image"
                  onClick={() => setSelectedImage(`http://localhost:5000${product.image[0]}`)}
                  style={{ cursor: 'pointer' }}
                />
              )}
              <h3>{product.title}</h3>
              <p>{product.description}</p>
              <p className="price">{product.price} MAD</p>
              <p className="category"><strong>Catégorie :</strong> {product.category}</p>

              {product.seller ? (
                <p>
                  Publié par: <a href={`/vendeur/${product.seller._id}`}>{product.seller.name}</a>
                </p>
              ) : (
                <p>Vendeur inconnu</p>
              )}

              <p>
                <strong>État :</strong>{' '}
                <span className={product.status === 'Disponible' ? 'status-disponible' : 'status-vendu'}>
                  {product.status}
                </span>
              </p>

              {/* ✅ زر إضافة إلى السلة فقط إذا كان البائع admin */}
              {product.status === 'Disponible' && product.seller?.role === 'admin' && (
                <button className="add-to-cart-btn" onClick={() => addToCart(product)}>
                  Ajouter au panier
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Popup الصورة الكبيرة */}
      {selectedImage && (
        <div className="image-popup" onClick={() => setSelectedImage(null)}>
          <button className="close-button" onClick={() => setSelectedImage(null)}>Fermer ✖</button>
          <img src={selectedImage} alt="Produit agrandi" />
        </div>
      )}
    </div>
  );
};

export default Products;
