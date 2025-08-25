import React, { useState, useMemo, type ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import DepositModal from '../Wallet/DepositModal';
import WithdrawalModal from '../Wallet/WithdrawalModal';
import {
  ChevronDown, Gamepad2, User, LogOut, History,
  BarChart3, Ticket, LifeBuoy, Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const gameNavItems = [
  { label: 'Raspadinha', to: '/games', icon: <Gamepad2 size={16} /> },
  { label: 'Mines', to: '/mines', icon: <Gamepad2 size={16} /> },
  { label: 'Double', to: '/double', icon: <Gamepad2 size={16} /> },
  { label: 'Plinko', to: '/plinko', icon: <Gamepad2 size={16} /> },
  { label: 'Tower', to: '/tower', icon: <Gamepad2 size={16} /> },
  { label: 'Limpo', to: '/limbo', icon: <Gamepad2 size={16} /> },
];

const accountNavItems = [
  { to: '/profile', label: 'Perfil', icon: <User size={16} /> },
  { to: '/history', label: 'Histórico', icon: <History size={16} /> },
  { to: '/my-games', label: 'Minhas Raspadinhas', icon: <Ticket size={16} /> },
  { to: '/rankings', label: 'Rankings', icon: <BarChart3 size={16} /> },
  { to: '/referrals', label: 'Afiliados', icon: <Users size={16} /> },
  { to: '/support', label: 'Suporte', icon: <LifeBuoy size={16} /> },
  { to: '/admin/dashboard', label: 'Admin', adminOnly: true, icon: <User size={16} /> },
];

const Logo = () => (
  <NavLink to="/games" className="flex items-center gap-2 text-2xl font-bold text-white transition-transform hover:scale-105">
    <img src="/logo.png" alt="BrilhaSorte Logo" className="h-9 w-9" />
    <span className="hidden sm:inline bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-yellow-500">
      BrilhaSorte
    </span>
  </NavLink>
);

const NavItem = ({ to, label, icon }: { to: string; label: string; icon: ReactNode }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors 
      ${isActive ? 'bg-yellow-500/10 text-yellow-300' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`
    }
  >
    {icon}
    <span>{label}</span>
  </NavLink>
);

const NavDropdown = ({ items, trigger }: { items: typeof gameNavItems; trigger: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative" onMouseLeave={() => setIsOpen(false)}>
      <div onMouseEnter={() => setIsOpen(true)}>{trigger}</div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute left-0 mt-2 w-56 origin-top-left rounded-xl bg-zinc-900/80 backdrop-blur-lg shadow-2xl ring-1 ring-white/10"
          >
            <div className="p-2 space-y-1">
              {items.map(item => (
                <NavItem key={item.label} to={item.to} label={item.label} icon={item.icon} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const UserMenu = ({ user, onDeposit, onWithdraw, onLogout, accessibleAccountItems }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative" onMouseLeave={() => setIsOpen(false)}>
      <motion.button
        onMouseEnter={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-zinc-800 border border-zinc-700 text-white"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <User size={16} className="text-gray-400" />
        <span className="text-green-400 font-semibold">
          R$ {(user.balance_in_cents / 100).toFixed(2)}
        </span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-72 origin-top-right rounded-xl bg-zinc-900/90 backdrop-blur-lg shadow-2xl ring-1 ring-white/10"
          >
            <div className="p-4">
              <p className="text-center mb-4 text-sm font-semibold text-white truncate">{user.email}</p>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  onClick={onDeposit}
                  className="w-full px-3 py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:scale-105 transition-transform"
                >
                  Depositar
                </button>
                <button
                  onClick={onWithdraw}
                  className="w-full px-3 py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-yellow-500 to-amber-600 text-black hover:scale-105 transition-transform"
                >
                  Sacar
                </button>
              </div>

              <div className="space-y-1">
                {accessibleAccountItems.map((item: any) => (
                  <NavItem key={item.label} to={item.to} label={item.label} icon={item.icon} />
                ))}
              </div>

              <div className="border-t border-white/10 my-2" />
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
              >
                <LogOut size={16} />
                <span>Sair</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);

  const accessibleAccountItems = useMemo(() => {
    if (!isAuthenticated) return [];
    return accountNavItems.filter(item => !item.adminOnly || (item.adminOnly && user?.admin));
  }, [isAuthenticated, user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <Logo />

            <div className="flex items-center gap-2 sm:gap-4">
              {isAuthenticated && user ? (
                <>
                  <NavDropdown
                    items={gameNavItems}
                    trigger={
                      <button className="flex items-center gap-2 rounded-lg p-2 text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                        <Gamepad2 size={20} />
                        <span className="hidden md:inline">Jogos</span>
                      </button>
                    }
                  />
                  <UserMenu
                    user={user}
                    onDeposit={() => setIsDepositModalOpen(true)}
                    onWithdraw={() => setIsWithdrawalModalOpen(true)}
                    onLogout={handleLogout}
                    accessibleAccountItems={accessibleAccountItems}
                  />
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <NavLink
                    to="/login"
                    className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    Entrar
                  </NavLink>
                  <NavLink
                    to="/register"
                    className="px-4 py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 text-black hover:scale-105 transition-transform"
                  >
                    Cadastrar
                  </NavLink>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <DepositModal isOpen={isDepositModalOpen} onClose={() => setIsDepositModalOpen(false)} />
      <WithdrawalModal isOpen={isWithdrawalModalOpen} onClose={() => setIsWithdrawalModalOpen(false)} onSuccess={() => console.log('Saque realizado!')} />
    </>
  );
};

export default Navbar;
