import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { CartContext } from '../context/CartContext.jsx';

const Logout = () => {
  const navigate = useNavigate();
  const { clearCart } = useContext(CartContext);

  const handleLogout = () => {
    const confirmed = window.confirm("Êtes-vous sûr de vouloir vous déconnecter ?");
    
    if (confirmed) {
      localStorage.removeItem("token");
      clearCart();
      navigate("/connexion");
    } else {
      navigate("/");
    }
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Déconnexion</h2>
      <button onClick={handleLogout} style={{ padding: '10px 20px', backgroundColor: 'red', color: 'white', border: 'none', borderRadius: '5px' }}>
        Confirmer la déconnexion
      </button>
    </div>
  );
};

export default Logout;
