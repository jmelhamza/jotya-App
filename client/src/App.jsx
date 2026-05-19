import { Routes, Route } from "react-router-dom";
import Accueil from "./pages/Accueil";
import Products from "./pages/Products";
import Auth from "./pages/Auth";
import Cart from "./pages/Cart";
import MonCompte from "./pages/MonCompte";
import AdminDashboard from "./pages/AdminDashboard";
import AjouterProduit from "./pages/AjouterProduit";
import SellerProfile from "./pages/SellerProfile";
import About from "./pages/About";
import Logout from "./pages/Logout";
import ProductDetail from "./pages/ProductDetail";
import BecomeSeller from "./pages/BecomeSeller";
import MesCommandes from "./pages/MesCommandes";
import Layout from "./componnents/Layout";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Accueil />} />
        <Route path="/produits" element={<Products />} />
        <Route path="/produits/:id" element={<ProductDetail />} />

        {/* Une seule page Auth pour connexion + inscription */}
        <Route path="/connexion" element={<Auth />} />
        <Route path="/inscription" element={<Auth />} />

        <Route path="/panier" element={<Cart />} />
        <Route path="/mon-compte" element={<MonCompte />} />
        <Route path="/mes-commandes" element={<MesCommandes />} />
        <Route path="/devenir-vendeur" element={<BecomeSeller />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/ajouter-produit" element={<AjouterProduit />} />
        <Route path="/vendeur/:id" element={<SellerProfile />} />
        <Route path="/about" element={<About />} />
        <Route path="/deconnexion" element={<Logout />} />
      </Route>
    </Routes>
  );
}

export default App;