import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import DepositModal from '../Wallet/DepositModal';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false); // Estado para controlar o modal

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <nav className="bg-gray-800 text-white shadow-lg">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold">BrilhaSorte</Link>
          <ul className="flex items-center space-x-6">
            {isAuthenticated && user ? (
              <>
                <li><span className="text-gray-300 hidden sm:block">Olá, {user.full_name || user.email}</span></li>
                <li><span className="font-semibold">Saldo: R$ {(user.balance_in_cents / 100).toFixed(2)}</span></li>
                <li>
                  {/* Botão para abrir o modal de depósito */}
                  <button 
                    onClick={() => setIsDepositModalOpen(true)}
                    className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-md transition-colors"
                  >
                    Depositar
                  </button>
                </li>
                <li><Link to="/games" className="hover:text-yellow-400">Jogos</Link></li>
                <li><Link to="/profile" className="hover:text-yellow-400">Perfil</Link></li>
                <li>
                  <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md transition-colors">
                    Sair
                  </button>
                </li>
              </>
            ) : (
              <>
                <li><Link to="/login" className="hover:text-yellow-400">Login</Link></li>
                <li><Link to="/register" className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-4 py-2 rounded-md transition-colors">Cadastro</Link></li>
              </>
            )}
          </ul>
        </div>
      </nav>
      {/* Renderiza o modal (ele só será visível se isDepositModalOpen for true) */}
      <DepositModal isOpen={isDepositModalOpen} onClose={() => setIsDepositModalOpen(false)} />
    </>
  );
};

export default Navbar;