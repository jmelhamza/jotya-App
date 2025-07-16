import React, { useState } from 'react';
import '../styles/Login.css';
import jotiyaLogo from '../assets/jotiya-logo.png';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// ✅ أضف هذا السطر في الأعلى لاستخدام المتغير البيئي
// سيتم تحديد قيمة هذا المتغير من ملف .env.development أو .env.production
const API_BASE_URL = import.meta.env.VITE_API_URL;

const Login = () => {
  const navigate = useNavigate();

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
        // ✅ تم تعديل هذا السطر لاستخدام الرابط الأساسي الديناميكي
        const res = await axios.post(`${API_BASE_URL}/api/auth/login`, formData);

        const token= res.data.token;
        localStorage.setItem('token', res.data.token);
        setMessage("Connexion réussie !");
        navigate('/'); 
      } catch (err) {
        console.error(err);
        setMessage("Email ou mot de passe incorrect.");
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
        {message && <p>{message}</p>}
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
        <p>Pas de compte ? <a href="/inscription">S'inscrire</a></p>
      </div>
    </div>
  );
};

export default Login;