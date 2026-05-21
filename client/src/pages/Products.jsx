import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import '../styles/Products.css';
import { useNavigate } from 'react-router-dom';

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

const statusOptions = [
  { value: '', label: 'Tous les états' },
  { value: 'Disponible', label: 'Disponible' },
  { value: 'Vendu', label: 'Vendu' },
];

const sortOptions = [
  { value: 'newest', label: 'Plus récents' },
  { value: 'price_asc', label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix décroissant' },
];

const Products = () => {
  const [products, setProducts]       = useState([]);
  const [filterCat, setFilterCat]     = useState('Tous');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSort, setFilterSort]   = useState('newest');
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [search, setSearch]           = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [filterOpen, setFilterOpen]   = useState(false);

  const filterRef = useRef(null);
  const navigate  = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/products`);
        setProducts(res.data.data);
      } catch {
        setError('Erreur lors du chargement des produits.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const resetFilters = () => { setFilterCat('Tous'); setFilterStatus(''); setFilterSort('newest'); };

  const activeFiltersCount = [
    filterCat !== 'Tous',
    filterStatus !== '',
    filterSort !== 'newest',
  ].filter(Boolean).length;

  let filtered = products.filter(p => {
    const matchCat    = filterCat === 'Tous' || p.category === filterCat;
    const matchStatus = filterStatus === '' || p.status === filterStatus;
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchStatus && matchSearch;
  });

  if (filterSort === 'price_asc')  filtered = [...filtered].sort((a, b) => Number(a.price) - Number(b.price));
  if (filterSort === 'price_desc') filtered = [...filtered].sort((a, b) => Number(b.price) - Number(a.price));

  if (loading) return <p className="loading-msg">Chargement des produits...</p>;
  if (error)   return <p className="error-msg">{error}</p>;

  const selectedCatLabel = categories.find(c => c.value === filterCat);

  return (
    <div className="products-container">
      <h2>Produits disponibles</h2>

      {/* Search + Filter bar */}
      <div className="search-filter-bar">
        <input
          type="text"
          className="search-input"
          placeholder="Rechercher un produit..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <span className="divider" />
        <div className="filter-wrapper" ref={filterRef}>
          <button
            className={`filter-toggle-btn ${filterOpen ? 'active' : ''} ${activeFiltersCount > 0 ? 'has-filters' : ''}`}
            onClick={() => setFilterOpen(!filterOpen)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="18" height="18">
              <line x1="4" y1="6" x2="20" y2="6"/>
              <line x1="7" y1="12" x2="17" y2="12"/>
              <line x1="10" y1="18" x2="14" y2="18"/>
            </svg>
            Filtres
            {activeFiltersCount > 0 && <span className="filter-count-badge">{activeFiltersCount}</span>}
            <svg className={`filter-chevron ${filterOpen ? 'open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          {filterOpen && (
            <div className="filter-dropdown-panel">
              <div className="filter-panel-header">
                <span>Filtres</span>
                {activeFiltersCount > 0 && (
                  <button className="filter-reset-btn" onClick={resetFilters}>Réinitialiser</button>
                )}
              </div>

              <div className="filter-section">
                <p className="filter-section-title">Catégorie</p>
                <div className="filter-cat-grid">
                  {categories.map(cat => (
                    <button
                      key={cat.value}
                      className={`filter-cat-chip ${filterCat === cat.value ? 'active' : ''}`}
                      onClick={() => setFilterCat(cat.value)}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-section">
                <p className="filter-section-title">État</p>
                <div className="filter-chips-row">
                  {statusOptions.map(opt => (
                    <button
                      key={opt.value}
                      className={`filter-chip ${filterStatus === opt.value ? 'active' : ''}`}
                      onClick={() => setFilterStatus(opt.value)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-section">
                <p className="filter-section-title">Trier par</p>
                <div className="filter-chips-row">
                  {sortOptions.map(opt => (
                    <button
                      key={opt.value}
                      className={`filter-chip ${filterSort === opt.value ? 'active' : ''}`}
                      onClick={() => setFilterSort(opt.value)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <button className="filter-apply-btn" onClick={() => setFilterOpen(false)}>
                Voir {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Active filter tags */}
      {(filterCat !== 'Tous' || filterStatus !== '') && (
        <div className="active-filters-summary">
          {filterCat !== 'Tous' && (
            <span className="active-filter-tag">
              {selectedCatLabel?.icon} {selectedCatLabel?.label}
              <button onClick={() => setFilterCat('Tous')}>×</button>
            </span>
          )}
          {filterStatus !== '' && (
            <span className="active-filter-tag">
              {filterStatus}
              <button onClick={() => setFilterStatus('')}>×</button>
            </span>
          )}
        </div>
      )}

      <p className="results-count">
        {filtered.length} produit{filtered.length !== 1 ? 's' : ''} trouvé{filtered.length !== 1 ? 's' : ''}
      </p>

      {/* ── Product grid ── */}
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
              {product.image?.length > 0 && (
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
                  Vendeur :{' '}
                  <a href={`/vendeur/${product.seller._id}`} onClick={e => e.stopPropagation()}>
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

              {/* 🔒 Locked info hint */}
              {product.status === 'Disponible' && (
                <div style={{
                  marginTop: '10px',
                  padding: '8px 12px',
                  background: '#fafafa',
                  border: '1px dashed #d1d5db',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#888',
                  textAlign: 'center',
                }}>
                  🔒 Voir les coordonnées — 20 DH
                </div>
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