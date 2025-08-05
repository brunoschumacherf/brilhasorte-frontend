import React, { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AdminRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <p className="text-center mt-8">Verificando permissões...</p>;
  }

  // Se o usuário está autenticado E é um admin, renderiza a página.
  // Caso contrário, redireciona para a página principal de jogos.
  if (isAuthenticated && user?.admin) {
    return <>{children}</>;
  }

  return <Navigate to="/games" />;
};

export default AdminRoute;