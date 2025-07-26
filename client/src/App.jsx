// client/src/App.jsx
import { Routes, Route } from 'react-router-dom';
import Layout from './componnents/Layout.jsx';
import Products from './pages/Products';
import Login from './pages/Login';
import AjouterProduit from './pages/AjouterProduit';
import AdminDashboard from './pages/AdminDashboard';
import PrivateRoute from './componnents/PrivateRoute';
import Logout from './pages/Logout';
import SellerProfile from './pages/SellerProfile';
import MonCompte from './pages/MonCompte';
import Accueil from './pages/Accueil';
import Cart from './pages/Cart.jsx';
import About from './pages/About';

function App() {
  return (
    <Routes>
      {/* هذا المسار يغلف جميع صفحات الموقع بـ Layout (Navbar و Footer)
        المسارات الموجودة بالداخل ستظهر داخل <Outlet /> في Layout.jsx
      */}
      <Route path="/" element={<Layout />}>
        {/*
          مسارات عامة متاحة للجميع (لا تتطلب تسجيل الدخول)
          هذه الصفحات ستظهر مع Navbar و Footer
        */}
        <Route index element={<Accueil />} />
        <Route path="produits" element={<Products />} />
        <Route path="panier" element={<Cart />} />
        <Route path="a-propos" element={<About />} />
        
        {/* مسار تسجيل الدخول السري للمسؤول */}
        <Route path="admin-login" element={<Login />} />

        {/* مسارات محمية تتطلب تسجيل الدخول كمسؤول
          يتم حمايتها باستخدام PrivateRoute
        */}
        <Route path="ajouter-produit" element={<PrivateRoute><AjouterProduit /></PrivateRoute>} />
        <Route path="admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
        <Route path="mon-compte" element={<PrivateRoute><MonCompte /></PrivateRoute>} />
        
        {/* مسار تسجيل الخروج */}
        <Route path="logout" element={<Logout />} />
      </Route>

      {/* مسارات بدون Layout (إذا كانت هناك) */}
      <Route path="/vendeur/:id" element={<SellerProfile />} />
    </Routes>
  );
}

export default App;