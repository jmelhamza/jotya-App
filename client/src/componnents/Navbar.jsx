import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';
import { useAuth } from '../context/AuthContext';
import votreLogo from '../assets/kiki__2_-removebg-preview.png';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isLoggedIn, user, logout } = useAuth();

  const close = () => setIsOpen(false);

  const handleLogout = () => {
    logout();
    close();
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/">
          <img src={votreLogo} alt="Logo de Jotiya" className="logo-image" />
        </Link>
      </div>

      <div className={`nav-links ${isOpen ? "open" : ""}`}>
        <li><Link to="/" onClick={close}>Accueil</Link></li>
        <li><Link to="/produits" onClick={close}>Produits</Link></li>
        <li><Link to="/panier" onClick={close}>Panier</Link></li>
        <li><Link to="/about" onClick={close}>À propos</Link></li>

        {/* Admin only */}
        {isLoggedIn && user?.role === 'admin' && (
          <>
            <li><Link to="/ajouter-produit" onClick={close}>Ajouter produit</Link></li>
            <li><Link to="/admin" onClick={close}>Dashboard</Link></li>
          </>
        )}

        {/* Seller only */}
        {isLoggedIn && user?.role === 'seller' && (
          <li><Link to="/ajouter-produit" onClick={close}>Vendre</Link></li>
        )}

        {/* Logged in users */}
        {isLoggedIn && (
          <>
            <li><Link to="/mon-compte" onClick={close}>Mon Compte</Link></li>
            <li><Link to="/mes-commandes" onClick={close}>Mes commandes</Link></li>
          </>
        )}

        {/* Become seller — for regular users only */}
        {isLoggedIn && user?.role === 'user' && (
          <li><Link to="/devenir-vendeur" onClick={close}>Devenir vendeur</Link></li>
        )}

        {isLoggedIn ? (
          <li><Link to="/" onClick={handleLogout}>Déconnexion</Link></li>
        ) : (
          <>
            <li><Link to="/connexion" onClick={close}>Connexion</Link></li>
            <li><Link to="/inscription" onClick={close}>S'inscrire</Link></li>
          </>
        )}
      </div>

      <div
        className={`hamburger ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter') setIsOpen(!isOpen); }}
      >
        <span></span>
        <span></span>
        <span></span>
      </div>
    </nav>
  );
};

export default Navbar;