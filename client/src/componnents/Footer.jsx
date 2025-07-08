import React from 'react';
import '../styles/Footer.css';
import { Link } from 'react-router-dom';
const Footer = () => {
  return (
    <footer className="footer">
      <p className="footer-title">Jotiya - Votre marché aux puces en ligne</p>
      <div className="footer-links">
        
         <li><Link to="/a-propos" onClick={() => setIsOpen(false)}>À propos</Link></li>
        

      </div>
      <div className="footer-social">
        <a href="https://facebook.com" target="_blank">Facebook</a> – 
        <a href="https://wa.me/212600000000" target="_blank">WhatsApp</a> – 
        <a href="https://instagram.com" target="_blank">Instagram</a>
      </div>
      <p className="footer-copy">© 2025 Jotiya. Tous droits réservés.</p>
    </footer>
  );
};

export default Footer;
