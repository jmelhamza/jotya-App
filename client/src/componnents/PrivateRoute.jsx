// src/components/PrivateRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // 👈 استيراد الهوك الجديد

const PrivateRoute = ({ children }) => {
  const { isLoggedIn, user } = useAuth(); // 👈 استخدام الهوك الجديد

  if (!isLoggedIn || user?.role !== 'admin') {
    // إذا لم يكن المستخدم مسجلاً دخوله أو لم يكن مسؤولاً، يتم تحويله إلى الصفحة الرئيسية
    return <Navigate to="/" />;
  }

  return children;
};

export default PrivateRoute;