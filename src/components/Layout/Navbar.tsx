import React, { useState, useMemo, useRef, useEffect, type ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import DepositModal from '../Wallet/DepositModal';
import WithdrawalModal from '../Wallet/WithdrawalModal';
import { Menu, X, ChevronDown, User, Gamepad2 } from 'lucide-react';

// --- ESTRUTURA DE DADOS DOS LINKS ---

// 1. Links para o novo menu "Jogo"
const gameNavItems = [
  { label: 'Raspadinha', to: '/games' },
  { label: 'Mines', to: '/mines' },
  { label: 'Double', to: '/games' },
  { label: 'Plinko', to: '/games' },
];

// 2. Links para o menu "Minha Conta"
const accountNavItems = [
  { to: '/rankings', label: 'Rankings' },
  { to: '/history', label: 'Histórico' },
  { to: '/my-games', label: 'Minhas Raspadinhas' },
  { to: '/referrals', label: 'Afiliados' },
  { to: '/profile', label: 'Perfil' },
  { to: '/support', label: 'Suporte' },
  { to: '/admin/dashboard', label: 'Admin', adminOnly: true },
];

// --- COMPONENTES REUTILIZÁVEIS ---

const Logo = () => (
  <NavLink to="/games" className="flex flex-shrink-0 items-center gap-2 text-2xl font-bold text-[var(--primary-gold)]">
    <img src="/logo.png" alt="BrilhaSorte Logo" className="h-8 w-8" />
    <span className="hidden sm:inline">BrilhaSorte</span>
  </NavLink>
);

const BalanceDisplay = ({ balanceInCents }: { balanceInCents: number }) => (
    <div className="bg-zinc-800 text-green-400 font-semibold px-3 py-1.5 rounded-full text-xs border border-zinc-700 shadow-sm">
        Saldo: R$ {(balanceInCents / 100).toFixed(2)}
    </div>
);

type UserActionsProps = {
    user: { balance_in_cents: number };
    onDeposit: () => void;
    onWithdraw: () => void;
    onLogout: () => void;
};

const UserActions: React.FC<UserActionsProps> = ({ user, onDeposit, onWithdraw, onLogout }) => (
    <div className="flex items-center space-x-3">
        <BalanceDisplay balanceInCents={user.balance_in_cents} />
        <button onClick={onWithdraw} className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-3 rounded-md text-sm transition-colors">Sacar</button>
        <button onClick={onDeposit} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-3 rounded-md text-sm transition-colors">Depositar</button>
        <button onClick={onLogout} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-3 rounded-md text-sm transition-colors">Sair</button>
    </div>
);

// Componente de Dropdown genérico e reutilizável
const DesktopDropdownMenu = ({ items, triggerText, triggerIcon }: { items: { to: string, label: string }[], triggerText: string, triggerIcon: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && event.target instanceof Node && !dropdownRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-300 transition-colors hover:bg-[var(--surface-dark)] hover:text-[var(--primary-gold)]"
      >
        {triggerIcon}
        {triggerText}
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-48 origin-top-left rounded-md bg-[var(--surface-dark)] shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {items.map(item => (
              <NavLink key={item.label} to={item.to} onClick={() => setIsOpen(false)}
                className={({ isActive }) => `block px-4 py-2 text-sm ${isActive && item.to !== '/games' ? 'bg-gray-700 text-white' : 'text-gray-300'} hover:bg-gray-600 hover:text-white`}>
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);

  // Filtra os links de conta que o usuário pode ver
  const accessibleAccountItems = useMemo(() => {
    if (!isAuthenticated) return [];
    return accountNavItems.filter(item => !item.adminOnly || (item.adminOnly && user?.admin));
  }, [isAuthenticated, user]);
  
  // Junta todos os links para o menu mobile
  const allAccessibleNavItems = useMemo(() => {
    if(!isAuthenticated) return [];
    // Adiciona um "título" para os jogos no mobile para melhor organização
    return [
        { label: 'Jogos', isTitle: true },
        ...gameNavItems,
        { label: 'Conta', isTitle: true },
        ...accessibleAccountItems
    ];
  }, [isAuthenticated, accessibleAccountItems]);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate('/login');
  };

  return (
    <>
      <nav className="sticky top-0 z-40 bg-black/80 backdrop-blur-sm border-b border-[var(--border-color)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Lado Esquerdo: Logo e Menus de Navegação */}
            <div className="flex items-center gap-4">
              <Logo />
              <div className="hidden md:flex md:items-center md:gap-2">
                {isAuthenticated && (
                  <>
                    <DesktopDropdownMenu 
                      items={gameNavItems}
                      triggerText="Jogo"
                      triggerIcon={<Gamepad2 size={16} />}
                    />
                    <DesktopDropdownMenu 
                      items={accessibleAccountItems}
                      triggerText="Minha Conta"
                      triggerIcon={<User size={16} />}
                    />
                  </>
                )}
              </div>
            </div>

            {/* Lado Direito Desktop: Ações do Usuário */}
            <div className="hidden md:block">
              {isAuthenticated && user && <UserActions user={user} onDeposit={() => setIsDepositModalOpen(true)} onWithdraw={() => setIsWithdrawalModalOpen(true)} onLogout={handleLogout} />}
            </div>
            
            {/* Lado Direito Mobile: Saldo e Botão de Menu */}
            <div className="flex items-center gap-2 md:hidden">
              {isAuthenticated && user && <BalanceDisplay balanceInCents={user.balance_in_cents} />}
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white">
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Painel do Menu Mobile */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-700">
            {isAuthenticated ? (
               <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                {allAccessibleNavItems.map((item) => 
                  item.isTitle ? (
                    <h3 key={item.label} className="px-3 pt-4 pb-1 text-xs font-bold uppercase text-gray-500">{item.label}</h3>
                  ) : (
                    <NavLink key={item.label} to={item.to} onClick={() => setIsMenuOpen(false)}
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white">
                      {item.label}
                    </NavLink>
                  )
                )}
                <div className="border-t border-gray-600 mt-4 pt-4 space-y-2">
                    <button onClick={() => { setIsDepositModalOpen(true); setIsMenuOpen(false); }} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium bg-green-500 text-white">Depositar</button>
                    <button onClick={() => { setIsWithdrawalModalOpen(true); setIsMenuOpen(false); }} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium bg-yellow-500 text-black">Sacar</button>
                    <button onClick={handleLogout} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium bg-red-500 text-white">Sair</button>
                </div>
               </div>
            ) : (
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                 <NavLink to="/login" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white">Login</NavLink>
                 <NavLink to="/register" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white">Cadastro</NavLink>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Modais */}
      <DepositModal isOpen={isDepositModalOpen} onClose={() => setIsDepositModalOpen(false)} />
      <WithdrawalModal isOpen={isWithdrawalModalOpen} onClose={() => setIsWithdrawalModalOpen(false)} />
    </>
  );
};

export default Navbar;