import React, { useState } from 'react';
import '../styles/Login.css';
import jotiyaLogo from '../assets/jotiya-logo.png';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "L'email est requis";
    if (!formData.password) newErrors.password = "Le mot de passe est requis";
    return newErrors;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    setMessage('');

    if (Object.keys(validationErrors).length === 0) {
      try {
        const res = await axios.post(`${API_BASE_URL}/api/auth/login`, formData);
        const { token } = res.data;
        login(token);
        setMessage("Connexion réussie !");
        navigate('/');
      } catch (err) {
        console.error(err);
        setMessage(err.response?.data?.message || "Email ou mot de passe incorrect.");
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <img src={jotiyaLogo} alt="Jotiya Logo" className="login-image" />
      </div>
      <div className="login-right">
        <h2>Connexion</h2>
        {message && <p className="error">{message}</p>}
        <form className="login-form" onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <p className="error">{errors.email}</p>}

          <input
            type="password"
            name="password"
            placeholder="Mot de passe"
            value={formData.password}
            onChange={handleChange}
          />
          {errors.password && <p className="error">{errors.password}</p>}

          <button type="submit">Se connecter</button>
        </form>
        <p>Pas encore de compte ? <Link to="/inscription">S'inscrire</Link></p>
      </div>
    </div>
  );
};

export default Login;