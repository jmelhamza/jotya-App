import React, { useState } from 'react';
import '../styles/Login.css';
import axios from "axios";
import jotiyaLogo from '../assets/jotiya-logo.png';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", formData);
      const { token } = res.data;

      // ✅ خزن التوكن فـ localStorage
      localStorage.setItem("token", token);

      alert("Connexion réussie !");
      // redirect, reload, etc...
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Erreur lors de la connexion");
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <img src={jotiyaLogo} alt="Jotiya Logo" className="login-image" />
      </div>
      <div className="login-right">
        <h2>Connexion</h2>
        <form className="login-form" onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Mot de passe"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {error && <p className="error">{error}</p>}
          <button type="submit">Se connecter</button>
        </form>
        <p>Pas de compte ? <a href="/inscription">S'inscrire</a></p>
      </div>
    </div>
  );
};

export default Login;
