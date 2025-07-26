// client/src/components/Navbar.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';
import { useAuth } from '../context/AuthContext'; // 👈 استيراد الهوك الجديد
import votreLogo from '../assets/kiki__2_-removebg-preview.png'; // 👈 قم بتغيير هذا المسار واسم الملف

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isLoggedIn, user, logout } = useAuth(); // 👈 استخدام الهوك الجديد

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  
  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/">
          <img src={votreLogo} alt="Logo de Jotiya" className="logo-image" />
        </Link>
      </div>

      <div className={`nav-links ${isOpen ? "open" : ""}`}>
        <li><Link to="/" onClick={() => setIsOpen(false)}>Accueil</Link></li>
        <li><Link to="/produits" onClick={() => setIsOpen(false)}>Produits</Link></li>
        <li><Link to="/panier" onClick={() => setIsOpen(false)}>Panier</Link></li>
        <li><Link to="/a-propos" onClick={() => setIsOpen(false)}>À propos</Link></li>

        {/* ✅ عرض الروابط الخاصة بالمسؤول فقط في حالة تسجيل الدخول ودوره 'admin' */}
        {isLoggedIn && user?.role === 'admin' && (
          <>
            <li><Link to="/ajouter-produit" onClick={() => setIsOpen(false)}>Ajouter un produit</Link></li>
            <li><Link to="/admin" onClick={() => setIsOpen(false)}>Dashboard</Link></li>
          </>
        )}

        {/* ✅ عرض رابط "Mon Compte" فقط للمستخدمين المسجلين */}
        {isLoggedIn && <li><Link to="/mon-compte" onClick={() => setIsOpen(false)}>Mon Compte</Link></li>}

        {/* ✅ عرض زر تسجيل الخروج أو تسجيل الدخول */}
        {isLoggedIn ? (
          <li><Link to="/" onClick={handleLogout}>Déconnexion</Link></li>
        ) : (
          null // ✅ لا يوجد رابط تسجيل دخول للمستخدمين العاديين
        )}
      </div>

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