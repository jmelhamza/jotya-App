import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const confirmed = window.confirm("Êtes-vous sûr de vouloir vous déconnecter ?");
    
    if (confirmed) {
      // حذف التوكن من localStorage
      localStorage.removeItem("token");

      // الرجوع إلى صفحة الدخول
      navigate("/connexion");
    } else {
      // رجوع إلى الصفحة الرئيسية إذا لغى
      navigate("/");
    }
  }, [navigate]);

  return null; // لا حاجة لعرض شيء
};

export default Logout;
