import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const token = localStorage.getItem("token");
  const role = token ? JSON.parse(atob(token.split('.')[1])).role : null;

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/">Jotiya</Link>
      </div>

      <div className={`nav-links ${isOpen ? "open" : ""}`}>
        <li><Link to="/" onClick={() => setIsOpen(false)}>Accueil</Link></li>
        <li><Link to="/produits" onClick={() => setIsOpen(false)}>Produits</Link></li>
        {/* ✅ تم إضافة onClick هنا */}
        <li><Link to="/panier" className="link-white" onClick={() => setIsOpen(false)}>Panier</Link></li>
        
        {token && <li><Link to="/ajouter-produit" onClick={() => setIsOpen(false)}>Ajouter un produit</Link></li>}
        

        <li><Link to="/mon-compte" onClick={() => setIsOpen(false)}>Mon Compte</Link></li>
       
        
        {role === 'admin' && <li><Link to="/admin" onClick={() => setIsOpen(false)}>Dashboard</Link></li>}
        {!token ? (
          <li><Link to="/connexion" onClick={() => setIsOpen(false)}>Connexion</Link></li>
        ) : (
          <li><Link to="/logout" onClick={() => setIsOpen(false)}>Déconnexion</Link></li>
        )}
      </div>

      {/* زر الهامبرغر */}
      <div
        className={`hamburger ${isOpen ? "open" : ""}`}
        onClick={toggleMenu}
        aria-label="Toggle menu"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter') toggleMenu(); }}
      >
        <span></span>
        <span></span>
        <span></span>
      </div>
    </nav>
  );
};

export default Navbar;