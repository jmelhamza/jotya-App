import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/SellerPage.css';

const SellerPage = () => {
  const { sellerId } = useParams();
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        const resUser = await axios.get(`http://localhost:5000/api/users/${sellerId}`);
        setSeller(resUser.data);

        const resProducts = await axios.get(`http://localhost:5000/api/products`);
        const sellerProducts = resProducts.data.data.filter(
          product => product.seller === sellerId
        );
        setProducts(sellerProducts);
      } catch (error) {
        console.error('Erreur lors de la récupération des données du vendeur', error);
      }
    };

    fetchSellerData();
  }, [sellerId]);

  if (!seller) return <p>Chargement...</p>;

  return (
    <div className="seller-container">
      <h2 className="seller-title">Profil du vendeur: {seller.name}</h2>
      <p className="seller-info">Email: {seller.email}</p>

      <h3 className="product-list-title">Produits de ce vendeur:</h3>
      <ul className="product-list">
        {products.map(product => (
          <li key={product._id} className="product-item">
            {product.title} - {product.price} DH
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SellerPage;
