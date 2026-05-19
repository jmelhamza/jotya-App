import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import '../styles/Products.css';
import { CartContext } from '../context/CartContext.jsx';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const categories = [
  { value: 'Tous', label: 'Tous', icon: '🛍️' },
  { value: 'Electronique', label: 'Électronique', icon: '📱' },
  { value: 'Telephonie', label: 'Téléphonie', icon: '📞' },
  { value: 'Informatique', label: 'Informatique', icon: '💻' },
  { value: 'Vetements', label: 'Vêtements', icon: '👕' },
  { value: 'Chaussures', label: 'Chaussures', icon: '👟' },
  { value: 'Sacs', label: 'Sacs', icon: '👜' },
  { value: 'Accessoires', label: 'Accessoires', icon: '💍' },
  { value: 'Beaute', label: 'Beauté', icon: '💄' },
  { value: 'Meubles', label: 'Meubles', icon: '🛋️' },
  { value: 'Decoration', label: 'Décoration', icon: '🪴' },
  { value: 'Cuisine', label: 'Cuisine', icon: '🍳' },
  { value: 'Jouets', label: 'Jouets', icon: '🧸' },
  { value: 'Livres', label: 'Livres', icon: '📚' },
  { value: 'Sport', label: 'Sport', icon: '⚽' },
  { value: 'Outils', label: 'Outils', icon: '🔧' },
  { value: 'Vehicules', label: 'Véhicules', icon: '🚗' },
  { value: 'Immobilier', label: 'Immobilier', icon: '🏠' },
  { value: 'Animaux', label: 'Animaux', icon: '🐾' },
  { value: 'Services', label: 'Services', icon: '🛠️' },
  { value: 'Autres', label: 'Autres', icon: '📦' },
];

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filterCat, setFilterCat] = useState('Tous');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  const { addToCart } = useContext(CartContext);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/products`);
        setProducts(res.data.data);
      } catch (err) {
        setError('Erreur lors du chargement des produits.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filtered = products.filter(p => {
    const matchCat = filterCat === 'Tous' || p.category === filterCat;
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  if (loading) return <p className="loading-msg">Chargement des produits...</p>;
  if (error) return <p className="error-msg">{error}</p>;

  return (
    <div className="products-container">
      <h2>Produits disponibles</h2>

      <input
        type="text"
        className="search-input"
        placeholder="Rechercher un produit..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <div className="filter-buttons">
        {categories.map(cat => (
          <button
            key={cat.value}
            className={filterCat === cat.value ? 'active-filter' : ''}
            onClick={() => setFilterCat(cat.value)}
          >
            <span>{cat.icon}</span> {cat.label}
          </button>
        ))}
      </div>

      <div className="products-grid">
        {filtered.length === 0 ? (
          <p>Aucun produit disponible dans cette catégorie.</p>
        ) : (
          filtered.map(product => (
            <div
              key={product._id}
              className="product-card"
              onClick={() => navigate(`/produits/${product._id}`)}
              style={{ cursor: 'pointer' }}
            >
              {product.image && product.image.length > 0 && (
                <img
                  src={`${API_BASE_URL}${product.image[0]}`}
                  alt={product.title}
                  className="product-image"
                  onClick={e => { e.stopPropagation(); setSelectedImage(`${API_BASE_URL}${product.image[0]}`); }}
                />
              )}
              <h3>{product.title}</h3>
              <p className="price">{product.price} MAD</p>
              <p className="category"><strong>Catégorie :</strong> {product.category}</p>

              {product.seller ? (
                <p>
                  Vendeur: <a
                    href={`/vendeur/${product.seller._id}`}
                    onClick={e => e.stopPropagation()}
                  >
                    {product.seller.shopName || product.seller.name}
                  </a>
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

              {product.status === 'Disponible' && product.seller?.role === 'admin' && (
                <button
                  className="add-to-cart-btn"
                  onClick={e => { e.stopPropagation(); addToCart(product); }}
                >
                  Ajouter au panier
                </button>
              )}
            </div>
          ))
        )}
      </div>

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