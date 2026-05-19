import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import jotiyaLogo from '../assets/jotiya-logo.png';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const Auth = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [tab, setTab] = useState('login'); // 'login' | 'register'

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', phone: '' });

  const [loginError, setLoginError] = useState('');
  const [registerMsg, setRegisterMsg] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [loading, setLoading] = useState(false);

  /* ── LOGIN ── */
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    if (!loginForm.email || !loginForm.password) {
      setLoginError('Email et mot de passe requis.');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, loginForm);
      login(res.data.token);
      navigate('/');
    } catch (err) {
      setLoginError(err.response?.data?.message || 'Email ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  };

  /* ── REGISTER ── */
  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterMsg('');
    const { name, email, password } = registerForm;
    if (!name || !email || !password) {
      setRegisterError('Nom, email et mot de passe sont obligatoires.');
      return;
    }
    if (password.length < 6) {
      setRegisterError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/auth/register`, registerForm);
      setRegisterMsg('Compte créé ! Connectez-vous maintenant.');
      setRegisterForm({ name: '', email: '', password: '', phone: '' });
      setTimeout(() => { setTab('login'); setRegisterMsg(''); }, 1800);
    } catch (err) {
      setRegisterError(err.response?.data?.message || "Erreur lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* LEFT PANEL */}
      <div style={styles.left}>
        <img src={jotiyaLogo} alt="Jotiya" style={styles.logo} />
        <p style={styles.tagline}>La marketplace marocaine de confiance</p>
      </div>

      {/* RIGHT PANEL */}
      <div style={styles.right}>
        {/* TABS */}
        <div style={styles.tabs}>
          <button
            style={{ ...styles.tab, ...(tab === 'login' ? styles.tabActive : {}) }}
            onClick={() => { setTab('login'); setLoginError(''); }}
          >
            Connexion
          </button>
          <button
            style={{ ...styles.tab, ...(tab === 'register' ? styles.tabActive : {}) }}
            onClick={() => { setTab('register'); setRegisterError(''); setRegisterMsg(''); }}
          >
            S'inscrire
          </button>
        </div>

        {/* ── LOGIN FORM ── */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} style={styles.form}>
            <h2 style={styles.title}>Bon retour 👋</h2>
            {loginError && <div style={styles.errorBox}>{loginError}</div>}

            <input
              style={styles.input}
              type="email"
              placeholder="Email"
              value={loginForm.email}
              onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
            />
            <input
              style={styles.input}
              type="password"
              placeholder="Mot de passe"
              value={loginForm.password}
              onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
            />

            <button style={styles.btn} disabled={loading} type="submit">
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>

            <p style={styles.switchText}>
              Pas encore de compte ?{' '}
              <span style={styles.link} onClick={() => setTab('register')}>S'inscrire</span>
            </p>
          </form>
        )}

        {/* ── REGISTER FORM ── */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} style={styles.form}>
            <h2 style={styles.title}>Créer un compte</h2>
            {registerError && <div style={styles.errorBox}>{registerError}</div>}
            {registerMsg && <div style={styles.successBox}>{registerMsg}</div>}

            <input
              style={styles.input}
              type="text"
              placeholder="Nom complet *"
              value={registerForm.name}
              onChange={e => setRegisterForm({ ...registerForm, name: e.target.value })}
            />
            <input
              style={styles.input}
              type="email"
              placeholder="Email *"
              value={registerForm.email}
              onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })}
            />
            <input
              style={styles.input}
              type="password"
              placeholder="Mot de passe (min. 6 caractères) *"
              value={registerForm.password}
              onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })}
            />
            <input
              style={styles.input}
              type="text"
              placeholder="Téléphone (optionnel)"
              value={registerForm.phone}
              onChange={e => setRegisterForm({ ...registerForm, phone: e.target.value })}
            />

            <button style={styles.btn} disabled={loading} type="submit">
              {loading ? 'Inscription...' : "Créer mon compte"}
            </button>

            <p style={styles.switchText}>
              Déjà un compte ?{' '}
              <span style={styles.link} onClick={() => setTab('login')}>Se connecter</span>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

const styles = {
  page: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  left: {
    flex: 1,
    background: 'linear-gradient(135deg, #f97316, #fb923c)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    '@media (max-width: 768px)': { display: 'none' },
  },
  logo: {
    maxWidth: '80%',
    borderRadius: '16px',
    boxShadow: '0 12px 32px rgba(0,0,0,0.2)',
  },
  tagline: {
    marginTop: '20px',
    color: '#fff',
    fontSize: '18px',
    fontWeight: '600',
    textAlign: 'center',
  },
  right: {
    flex: 1,
    background: '#fff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 32px',
  },
  tabs: {
    display: 'flex',
    width: '100%',
    maxWidth: '400px',
    marginBottom: '28px',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid #e0e0e0',
  },
  tab: {
    flex: 1,
    padding: '13px',
    border: 'none',
    background: '#f5f5f5',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    color: '#666',
    transition: 'all 0.2s',
  },
  tabActive: {
    background: '#f97316',
    color: '#fff',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxWidth: '400px',
    gap: '14px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#222',
    margin: '0 0 4px',
  },
  input: {
    padding: '13px 16px',
    fontSize: '15px',
    border: '1px solid #ddd',
    borderRadius: '10px',
    background: '#fafafa',
    outline: 'none',
    transition: 'border 0.2s',
    fontFamily: 'inherit',
    width: '100%',
    boxSizing: 'border-box',
  },
  btn: {
    padding: '14px',
    background: '#f97316',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'background 0.2s',
    marginTop: '4px',
  },
  errorBox: {
    background: '#ffebee',
    color: '#c62828',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '14px',
  },
  successBox: {
    background: '#e8f5e9',
    color: '#2e7d32',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '14px',
  },
  switchText: {
    textAlign: 'center',
    fontSize: '14px',
    color: '#666',
    margin: '4px 0 0',
  },
  link: {
    color: '#f97316',
    fontWeight: '700',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
};

export default Auth;