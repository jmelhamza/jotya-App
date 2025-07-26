// client/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';

// إنشاء الـ Context
const AuthContext = createContext(null);

// إنشاء الـ Provider الذي سيغلف تطبيقك
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);

  useEffect(() => {
    // هذه الوظيفة تقوم بفك تشفير التوكن للحصول على معلومات المستخدم
    const parseToken = (t) => {
      if (!t) return null;
      try {
        const payload = JSON.parse(atob(t.split('.')[1]));
        return payload;
      } catch (e) {
        console.error("Failed to parse token:", e);
        return null;
      }
    };

    if (token) {
      const parsedUser = parseToken(token);
      setUser(parsedUser);
      // يمكنك هنا إضافة تحقق من صلاحية التوكن (expiration) إذا أردت
    } else {
      setUser(null);
    }
  }, [token]);

  // دالة لتسجيل الدخول
  const login = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  // دالة لتسجيل الخروج
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  // القيمة التي سيتم توفيرها لجميع المكونات
  const value = {
    token,
    user,
    isLoggedIn: !!token,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// إنشاء هوك (hook) مخصص لتسهيل استخدام الـ Context
export const useAuth = () => {
  return useContext(AuthContext);
};