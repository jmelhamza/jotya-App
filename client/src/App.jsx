import { Routes, Route } from 'react-router-dom';
import Layout from './componnents/Layout.jsx';
import Products from './pages/Products';
import Login from './pages/Login';
import Register from './pages/Register';
import AjouterProduit from './pages/AjouterProduit';
import AdminDashboard from './pages/AdminDashboard';
import PrivateRoute from './componnents/PrivateRoute';
import Logout from './pages/Logout';
import SellerPage from './pages/SellerPage';
import SellerProfile from './pages/SellerProfile';
import MonCompte from './pages/MonCompte';
import Accueil from './pages/Accueil';
import Cart from './pages/Cart.jsx'
import About from './pages/About'

function App() {
  return (
    <Routes>
      {/* Routes بدون حماية */}
      <Route path="/connexion" element={<Login />} />
      <Route path="/inscription" element={<Register />} />

      {/* Routes تحت Layout ومحميين */}
      <Route path="/" element={
        <PrivateRoute>
          <Layout />
        </PrivateRoute>
      }>
        {/* هنا الصفحة الرئيسية هي Accueil */}
        <Route index element={<Accueil />} />
        <Route path="produits" element={<Products />} />
        <Route path="ajouter-produit" element={<AjouterProduit />} />
        <Route path="logout" element={<Logout />} />
        <Route path="admin" element={<AdminDashboard />} />
        <Route path="vendeur/:id" element={<SellerProfile />} />
        <Route path="mon-compte" element={<MonCompte />} />
        <Route path="panier" element={<Cart />} />
        <Route path="/a-propos" element={<About />} />
      </Route>
    </Routes>
  );
}

export default App;
