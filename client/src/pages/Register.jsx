import React, { useState } from 'react';
import '../styles/Register.css';
import jotiyaLogo from '../assets/jotiya-logo.png';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',  // زدت هاد الحقل
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Le nom est requis";
    if (!formData.email.trim()) newErrors.email = "L'email est requis";
    else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) newErrors.email = "Email invalide";
    if (!formData.password) newErrors.password = "Le mot de passe est requis";
    else if (formData.password.length < 6) newErrors.password = "Mot de passe doit contenir au moins 6 caractères";
    // خاصنا نتحقق من رقم الهاتف (اختياري)
    if (formData.phone && !/^\+?\d{7,15}$/.test(formData.phone)) {
      newErrors.phone = "Numéro de téléphone invalide";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      try {
        const response = await axios.post('http://localhost:5000/api/auth/register', formData);
        setMessage('Inscription réussie ! Vous pouvez maintenant vous connecter.');
        setFormData({ name: '', email: '', password: '', phone: '' });
      } catch (error) {
        setMessage('Erreur lors de l\'inscription.');
      }
    }
  };

  return (
    <div className="register-container">
      <div className="register-left">
        <img src={jotiyaLogo} alt="Jotiya Logo" className="register-image" />
      </div>
      <div className="register-right">
        <h2>Inscription</h2>
        {message && <p>{message}</p>}
        <form className="register-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Nom"
            value={formData.name}
            onChange={handleChange}
          />
          {errors.name && <p className="error">{errors.name}</p>}

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

          <input
            type="text"
            name="phone"
            placeholder="Numéro de téléphone (optionnel)"
            value={formData.phone}
            onChange={handleChange}
          />
          {errors.phone && <p className="error">{errors.phone}</p>}

          <button type="submit">S'inscrire</button>
        </form>
        <p>Déjà un compte ? <a href="/connexion">Se connecter</a></p>
      </div>
    </div>
  );
};

export default Register;
