import { Routes, Route } from 'react-router-dom';
import Layout from './componnents/layout';
import Products from './pages/Products';
import Login from './pages/login';
import Register from './pages/register';
import AjouterProduit from './pages/AjouterProduit';
import AdminDashboard from './pages/AdminDashboard';
import PrivateRoute from './componnents/PrivateRoute';
import Logout from './pages/Logout';
import SellerPage from './pages/SellerPage';
import SellerProfile from './pages/SellerProfile';
import MonCompte from './pages/MonCompte';

function App() {
  return (
    <Routes>
      {/* ✅ Routes بدون حماية */}
      <Route path="/connexion" element={<Login />} />
      <Route path="/inscription" element={<Register />} />

      {/* ✅ Routes تحت Layout ولكن محميين */}
      <Route path="/" element={
        <PrivateRoute>
          <Layout />
        </PrivateRoute>
      }>
        <Route index element={<Products />} />
        <Route path="produits" element={<Products />} />
        <Route path="ajouter-produit" element={<AjouterProduit />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="admin" element={<AdminDashboard/>} />
        {/* <Route path="/vendeur/:sellerId" element={</SellerProfile >} /> */}
         <Route path="/vendeur/:id" element={<SellerProfile />} />
          <Route path="/mon-compte" element={<MonCompte />} />
      </Route>
    </Routes>
  );
}

export default App;
