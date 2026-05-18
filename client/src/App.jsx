import { Routes, Route } from "react-router-dom";
import Accueil from "./pages/Accueil";
import Products from "./pages/Products";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import MonCompte from "./pages/MonCompte";
import AdminDashboard from "./pages/AdminDashboard";
import AjouterProduit from "./pages/AjouterProduit";
import SellerProfile from "./pages/SellerProfile";
import About from "./pages/About";
import Logout from "./pages/Logout";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Accueil />} />
      <Route path="/produits" element={<Products />} />
      <Route path="/connexion" element={<Login />} />
      <Route path="/inscription" element={<Register />} />
      <Route path="/panier" element={<Cart />} />
      <Route path="/mon-compte" element={<MonCompte />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/ajouter-produit" element={<AjouterProduit />} />
      <Route path="/vendeur/:id" element={<SellerProfile />} />
      <Route path="/about" element={<About />} />
      <Route path="/deconnexion" element={<Logout />} />
    </Routes>
  );
}

export default App;