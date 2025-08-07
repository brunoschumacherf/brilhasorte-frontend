import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import { useAuth } from '../../contexts/AuthContext';
import { getProfile } from '../../services/api';
import { toast } from 'react-toastify';

const UserLayout: React.FC = () => {
  const { updateUserDetails, isAuthenticated } = useAuth();
  const location = useLocation(); // Hook para detectar a mudança de rota

  // Função centralizada para buscar e atualizar os dados do perfil do usuário
  const refreshProfile = async () => {
    // Só executa se o usuário estiver de fato logado
    if (isAuthenticated) {
      try {
        const response = await getProfile();
        // Usa a função do AuthContext para atualizar o usuário globalmente
        updateUserDetails(response.data.data.attributes);
      } catch (error) {
        // Loga o erro no console sem incomodar o usuário
        console.error("Falha ao sincronizar o perfil:", error);
      }
    }
  };

  // Efeito que é disparado toda vez que o caminho da URL muda
  useEffect(() => {
    refreshProfile();
  }, [location.pathname]); // A dependência [location.pathname] é a chave aqui

  // Efeito que adiciona um listener para quando a janela/aba ganha foco
  useEffect(() => {
    window.addEventListener('focus', refreshProfile);

    // Função de limpeza: remove o listener quando o componente é desmontado
    return () => {
      window.removeEventListener('focus', refreshProfile);
    };
  }, [isAuthenticated]); // Recria o listener se o status de autenticação mudar

  return (
    <div className="flex flex-col min-h-screen bg-[var(--background-dark)]">
      <Navbar />
      <main className="flex-grow">
        {/* O conteúdo da página atual (seja /games, /profile, etc.) é renderizado aqui */}
        <Outlet />
      </main>
    </div>
  );
};

export default UserLayout;
