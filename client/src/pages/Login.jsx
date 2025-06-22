import React from 'react';
import '../styles/Login.css';
import jotiyaLogo from '../assets/jotiya-logo.png'; // تأكد من المسار الصحيح

const Login = () => {
  return (
    <div className="login-container">
      <div className="login-left">
        <img src={jotiyaLogo} alt="Jotiya Logo" className="login-image" />
      </div>
      <div className="login-right">
        <h2>Connexion</h2>
        <form className="login-form">
          <input type="email" placeholder="Email" required />
          <input type="password" placeholder="Mot de passe" required />
          <button type="submit">Se connecter</button>
        </form>
        <p>Pas de compte ? <a href="/inscription">S'inscrire</a></p>
      </div>
    </div>
  );
};

export default Login;
