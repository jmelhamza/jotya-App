import React from 'react';
import '../styles/Register.css';
import jotiyaLogo from '../assets/jotiya-logo.png'; // تأكد من المسار

const Register = () => {
  return (
    <div className="register-container">
      <div className="register-left">
        <img src={jotiyaLogo} alt="Jotiya Logo" className="register-image" />
      </div>
      <div className="register-right">
        <h2>Inscription</h2>
        <form className="register-form">
          <input type="text" placeholder="Nom" required />
          <input type="email" placeholder="Email" required />
          <input type="password" placeholder="Mot de passe" required />
          <button type="submit">S'inscrire</button>
        </form>
        <p>Déjà un compte ? <a href="/connexion">Se connecter</a></p>
      </div>
    </div>
  );
};

export default Register;
