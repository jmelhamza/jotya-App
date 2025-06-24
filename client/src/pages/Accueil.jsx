import React from 'react';
import '../styles/Acceil.css'

const Accueil = () => {
  return (
    <div className="accueil-container">
      <section className="hero">
        <h1>Bienvenue à Jotiya</h1>
        <p>Vendez et achetez facilement vos objets inutilisés en toute simplicité.</p>
        <a href="/produits" className="cta-button">Voir les produits</a>
      </section>

      <section className="how-it-works">
        <h2>Comment ça marche ?</h2>
        <ul>
          <li>📤 Déposez votre produit</li>
          <li>🛍️ Parcourez les produits disponibles</li>
          <li>📞 Contactez le vendeur via téléphone ou Facebook</li>
        </ul>
      </section>
    </div>
  );
};

export default Accueil;
