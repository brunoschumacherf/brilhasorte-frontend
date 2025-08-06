import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import DepositModal from '../Wallet/DepositModal';
import WithdrawalModal from '../Wallet/WithdrawalModal';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate('/login');
  };

  const closeMenu = () => setIsMenuOpen(false);

  const navLinkClasses = "px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-[var(--surface-dark)] hover:text-[var(--primary-gold)]";
  const mobileNavLinkClasses = "block px-3 py-2 rounded-md text-base font-medium transition-colors hover:bg-[var(--surface-dark)] hover:text-[var(--primary-gold)]";

  const renderNavLinks = (isMobile = false) => (
    <>
      <NavLink to="/games" className={isMobile ? mobileNavLinkClasses : navLinkClasses} onClick={closeMenu}>Jogos</NavLink>
      <NavLink to="/rankings" className={isMobile ? mobileNavLinkClasses : navLinkClasses} onClick={closeMenu}>Rankings</NavLink>
      <NavLink to="/referrals" className={isMobile ? mobileNavLinkClasses : navLinkClasses} onClick={closeMenu}>Afiliados</NavLink>
      <NavLink to="/history" className={isMobile ? mobileNavLinkClasses : navLinkClasses} onClick={closeMenu}>Histórico</NavLink>
      <NavLink to="/profile" className={isMobile ? mobileNavLinkClasses : navLinkClasses} onClick={closeMenu}>Perfil</NavLink>
      {user?.admin && (
        <NavLink to="/admin/dashboard" className={`${isMobile ? mobileNavLinkClasses : navLinkClasses} bg-purple-600 hover:bg-purple-700 text-white`} onClick={closeMenu}>
          Admin
        </NavLink>
      )}
    </>
  );

  return (
    <>
      <nav className="bg-black bg-opacity-80 backdrop-blur-sm border-b border-[var(--border-color)] sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <NavLink to="/games" className="flex items-center gap-2 text-2xl font-bold text-[var(--primary-gold)]">
                <img src="/logo.png" alt="BrilhaSorte Logo" className="h-8 w-8" />
                <span>BrilhaSorte</span>
              </NavLink>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  {isAuthenticated && renderNavLinks()}
                </div>
              </div>
            </div>

            <div className="hidden md:block">
              {isAuthenticated && user && (
                <div className="ml-4 flex items-center md:ml-6 space-x-3">
                  <span className="text-sm">Saldo: <span className="font-bold text-green-400">R$ {(user.balance_in_cents / 100).toFixed(2)}</span></span>
                  <button onClick={() => setIsWithdrawalModalOpen(true)} className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-3 rounded-md text-sm">Sacar</button>
                  <button onClick={() => setIsDepositModalOpen(true)} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-3 rounded-md text-sm">Depositar</button>
                  <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-3 rounded-md text-sm">Sair</button>
                </div>
              )}
            </div>

            <div className="-mr-2 flex md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none">
                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {isAuthenticated && user ? (
                <>
                  {renderNavLinks(true)}
                  <div className="pt-4 pb-3 border-t border-gray-700">
                    <div className="flex items-center px-3">
                      <p className="text-base font-medium">{user.full_name || user.email}</p>
                    </div>
                    <div className="mt-3 px-3">
                      <p className="text-sm">Saldo: <span className="font-bold text-green-400">R$ {(user.balance_in_cents / 100).toFixed(2)}</span></p>
                    </div>
                    <div className="mt-3 px-2 space-y-2">
                       <button onClick={() => { setIsDepositModalOpen(true); closeMenu(); }} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium bg-green-500">Depositar</button>
                       <button onClick={() => { setIsWithdrawalModalOpen(true); closeMenu(); }} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium bg-yellow-500 text-black">Sacar</button>
                       <button onClick={handleLogout} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium bg-red-500">Sair</button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <NavLink to="/login" className={mobileNavLinkClasses} onClick={closeMenu}>Login</NavLink>
                  <NavLink to="/register" className={mobileNavLinkClasses} onClick={closeMenu}>Cadastro</NavLink>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      <DepositModal isOpen={isDepositModalOpen} onClose={() => setIsDepositModalOpen(false)} />
      <WithdrawalModal isOpen={isWithdrawalModalOpen} onClose={() => setIsWithdrawalModalOpen(false)} />
    </>
  );
};

export default Navbar;
