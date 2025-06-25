import React, { useState, useEffect } from 'react';
import '../styles/Acceil.css';
import bg1 from '../assets/bg1.jpg';
import bg2 from '../assets/bg2.jpg';
import bg3 from '../assets/bg3.jpg';
import bg4 from '../assets/bg4.jpg';

const Accueil = () => {
  const images = [bg1, bg2, bg3, bg4];
  const [currentIndex, setCurrentIndex] = useState(0);

  // auto slide every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [images.length]);

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  return (
    <div
      className="accueil-container"
      style={{
        backgroundImage: `url(${images[currentIndex]})`,
      }}
    >
      <div className="slider-buttons">
        <button onClick={prevSlide} className="slide-button">‹</button>
        <button onClick={nextSlide} className="slide-button">›</button>
      </div>

      <section className="hero">
        <h1>Bienvenue à Jotiya</h1>
        <a href="/produits" className="cta-button">Voir les produits</a>
      </section>

      <section className="how-it-works">
        
        <ul>
          <li>📤 Déposez votre produit</li>
          <li>🛍️ Parcourez les produits disponibles</li>
          <li>📞 Contactez le vendeur via téléphone</li>
        </ul>
      </section>
    </div>
  );
};

export default Accueil;
