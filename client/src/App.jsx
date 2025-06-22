import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login';
import Register from './pages/register';
import "./App.css"

function App() {
  return (
    <Routes>
      {/* Redirection de / vers /connexion */}
      <Route path="/" element={<Navigate to="/connexion" />} />
      <Route path="/connexion" element={<Login />} />
<Route path="/inscription" element={<Register />} />

    </Routes>
  );
}

export default App;


