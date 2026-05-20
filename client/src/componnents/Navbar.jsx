import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';
import { useAuth } from '../context/AuthContext';
import votreLogo from '../assets/kiki__2_-removebg-preview.png';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const { isLoggedIn, user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const close = () => { setIsOpen(false); setAccountOpen(false); };

  const handleLogout = () => { logout(); close(); navigate('/'); };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isLoggedIn) { setUnreadCount(0); return; }
    const token = localStorage.getItem('token');
    const fetchUnread = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/messages/unread`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUnreadCount(res.data.unread || 0);
      } catch {}
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 10000);
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/">
          <img src={votreLogo} alt="Logo de Jotiya" className="logo-image" />
        </Link>
      </div>

      <div className={`nav-links ${isOpen ? 'open' : ''}`}>
        <li><Link to="/" onClick={close}>Accueil</Link></li>
        <li><Link to="/produits" onClick={close}>Produits</Link></li>
        <li><Link to="/about" onClick={close}>À propos</Link></li>

        {isLoggedIn && user?.role === 'admin' && (
          <li><Link to="/admin" onClick={close}>Dashboard</Link></li>
        )}

        {!isLoggedIn && (
          <li><Link to="/connexion" onClick={close} className="nav-login-btn">Connexion</Link></li>
        )}

        {isLoggedIn && (
          <li className="account-menu-item" ref={dropdownRef}>
            <button className="account-btn" onClick={() => setAccountOpen(!accountOpen)}>
              <span className="account-avatar">
                {user?.name?.[0]?.toUpperCase() || '?'}
              </span>
              <span className="account-name">{user?.name?.split(' ')[0]}</span>
              {unreadCount > 0 && <span className="account-badge">{unreadCount}</span>}
              <svg className={`chevron-icon ${accountOpen ? 'open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {accountOpen && (
              <div className="account-dropdown">

                {/* Section 1 — Mon espace */}
                <div className="dropdown-section-label">Mon espace</div>
                <Link to="/mon-compte" onClick={close}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                  Mon Compte
                </Link>
                <Link to="/mes-commandes" onClick={close}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
                  Mes commandes
                </Link>
                <Link to="/messages" onClick={close} className="dropdown-messages-link">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                  Messages
                  {unreadCount > 0 && <span className="dropdown-badge">{unreadCount}</span>}
                </Link>

                {/* Section 2 — Vente (seller ou user) */}
                {(user?.role === 'seller' || user?.role === 'user') && (
                  <>
                    <div className="dropdown-divider" />
                    <div className="dropdown-section-label">Vente</div>
                    {user?.role === 'seller' && (
                      <Link to="/ajouter-produit" onClick={close}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Vendre un produit
                      </Link>
                    )}
                    {user?.role === 'user' && (
                      <Link to="/devenir-vendeur" onClick={close}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/><path d="M16 3H8l-2 4h12l-2-4z"/></svg>
                        Devenir vendeur
                      </Link>
                    )}
                    {user?.role === 'admin' && (
                      <Link to="/ajouter-produit" onClick={close}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Ajouter produit
                      </Link>
                    )}
                  </>
                )}

                {/* Section 3 — Déconnexion */}
                <div className="dropdown-divider" />
                <button className="dropdown-logout" onClick={handleLogout}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  Déconnexion
                </button>

              </div>
            )}
          </li>
        )}
      </div>

      <div
        className={`hamburger ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter') setIsOpen(!isOpen); }}
      >
        <span></span><span></span><span></span>
      </div>
    </nav>
  );
};

export default Navbar;