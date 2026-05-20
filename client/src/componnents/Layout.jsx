import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { Outlet, useLocation } from 'react-router-dom';

const Layout = () => {
  const { pathname } = useLocation();
  const isMessagesPage = pathname === '/messages';

  return (
    <>
      <Navbar />
      <main style={isMessagesPage
        ? { height: 'calc(100vh - 70px)', overflow: 'hidden', padding: '0' }
        : { minHeight: '80vh', padding: '20px' }
      }>
        <Outlet />
      </main>
      {!isMessagesPage && <Footer />}
    </>
  );
};

export default Layout;