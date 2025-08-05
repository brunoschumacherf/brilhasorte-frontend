import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import DepositModal from '../Wallet/DepositModal';
import WithdrawalModal from '../Wallet/WithdrawalModal';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <nav className="bg-gray-800 text-white shadow-lg">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center">
          <Link to="/games" className="text-2xl font-bold">BrilhaSorte</Link>
          <ul className="flex items-center space-x-2 md:space-x-4">
            {isAuthenticated && user ? (
              <>
                {/* Link Condicional para o Dashboard Admin */}
                {user.admin && (
                  <li><Link to="/admin/dashboard" className="px-3 py-2 text-sm rounded-md bg-purple-600 hover:bg-purple-700">Admin</Link></li>
                )}

                <li className="hidden lg:block"><span className="font-semibold">Saldo: R$ {(user.balance_in_cents / 100).toFixed(2)}</span></li>
                <li><button onClick={() => setIsWithdrawalModalOpen(true)} className="bg-yellow-500 hover:bg-yellow-600 px-3 py-2 text-sm md:px-4 rounded-md transition-colors">Sacar</button></li>
                <li><button onClick={() => setIsDepositModalOpen(true)} className="bg-green-500 hover:bg-green-600 px-3 py-2 text-sm md:px-4 rounded-md transition-colors">Depositar</button></li>
                <li><Link to="/referrals" className="hover:text-yellow-400">Afiliados</Link></li>
                <li><Link to="/rankings" className="hover:text-yellow-400">Rankings</Link></li>
                <li><Link to="/history" className="hover:text-yellow-400">Histórico</Link></li>
                <li><Link to="/profile" className="hover:text-yellow-400">Perfil</Link></li>
                <li><button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 px-3 py-2 text-sm md:px-4 rounded-md transition-colors">Sair</button></li>
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
      <DepositModal isOpen={isDepositModalOpen} onClose={() => setIsDepositModalOpen(false)} />
      <WithdrawalModal isOpen={isWithdrawalModalOpen} onClose={() => setIsWithdrawalModalOpen(false)} />
    </>
  );
};

export default Navbar;