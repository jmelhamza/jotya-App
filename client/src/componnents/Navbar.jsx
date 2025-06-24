import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = () => {
  const token = localStorage.getItem("token");
  const role = token ? JSON.parse(atob(token.split('.')[1])).role : null;

  return (
    <nav className="navbar">
      <div className="logo"><Link to="/">Jotiya</Link></div>
      <ul className="nav-links">
        <li><Link to="/">Accueil</Link></li>
        <li><Link to="/produits">Produits</Link></li>
          <li><Link to="/mon-compte">Mon Compte</Link></li> {/* هنا زدنا الرابط */}
        {token && <li><Link to="/ajouter-produit">Ajouter un produit</Link></li>}
        {role === 'admin' && <li><Link to="/admin">Dashboard</Link></li>}
        {!token ? (
          <li><Link to="/connexion">Connexion</Link></li>
        ) : (
          <li > <Link to="/logout">Déconnexion</Link></li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
