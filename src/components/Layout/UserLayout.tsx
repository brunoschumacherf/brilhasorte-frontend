import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import { useAuth } from '../../contexts/AuthContext';
import { getProfile } from '../../services/api';
import Footer from './Footer';
import { toast } from 'react-toastify';

const UserLayout: React.FC = () => {
  const { updateUserDetails, isAuthenticated } = useAuth();
  const location = useLocation(); 
  const refreshProfile = async () => {
    if (isAuthenticated) {
      try {
        const response = await getProfile();
        updateUserDetails(response.data.data.attributes);
      } catch (error) {
        console.error("Falha ao sincronizar o perfil:", error);
      }
    }
  };

  useEffect(() => {
    refreshProfile();
  }, [location.pathname]);

  useEffect(() => {
    window.addEventListener('focus', refreshProfile);
    return () => {
      window.removeEventListener('focus', refreshProfile);
    };
  }, [isAuthenticated]);

  return (
    <div className="flex flex-col min-h-screen bg-[var(--background-dark)]">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default UserLayout;
