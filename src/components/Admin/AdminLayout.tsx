import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
// Exemplo de como adicionar o link na navegação do seu AdminLayout.tsx

// Ícones para a barra lateral (SVG embutido)
const DashboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-3-5.197M15 21a6 6 0 00-9-5.197" /></svg>;
const GamesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg>;
const TransactionsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const BonusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 5v14a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0a2 2 0 00-2-2H9a2 2 0 00-2 2m4 0a2 2 0 00-2-2h-2a2 2 0 00-2 2m4 0V3m0 2v2m0-2a2 2 0 012 2v2m-4-4a2 2 0 00-2 2v2m0-2H9m2 0h2m2 10v-2a2 2 0 00-2-2H9a2 2 0 00-2 2v2m8-2a2 2 0 00-2-2h-2a2 2 0 00-2 2m0 0v2m0-2a2 2 0 012-2h2a2 2 0 012 2m0 0H9" /></svg>;
const ScratchCardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 012-2h3a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5z" /></svg>;
const SupportIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 0a5 5 0 10-7.07 7.071 5 5 0 007.07-7.071zm-4.95-4.95a7 7 0 10-9.9 9.9 7 7 0 009.9-9.9z" /></svg>;
const MinesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9V7a2 2 0 114 0v2m-4 0a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1-4h6a1 1 0 011 1v6a1 1 0 01-1 1h-6a1 1 0 01-1-1V6a1 1 0 011-1z" /></svg>;
const PlinkoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 2l1.5 3.09L17 6l-2.5 2.91L15 12l-3-1.5L9 12l.5-3.09L7 6l3.5-.91L12 2zM4 18h16a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2a2 2 0 012-2z" /></svg>;

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const getPageTitle = () => {
    const path = location.pathname.split('/').pop();
    switch (path) {
      case 'dashboard': return 'Dashboard';
      case 'users': return 'Gerenciamento de Usuários';
      case 'games': return 'Gerenciamento de Jogos';
      case 'deposits': return 'Gerenciamento de Depósitos';
      case 'withdrawals': return 'Gerenciamento de Saques';
      case 'bonus-codes': return 'Códigos de Bônus';
      case 'scratch-cards': return 'Raspadinhas';
      case 'mines-games': return 'Jogos Mines';
      case 'plinko-games': return 'Jogos Plinko';
      default: return 'Admin';
    }
  };

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-3 py-2 text-gray-300 rounded-md transition-colors text-sm font-medium ${
      isActive ? 'bg-gray-900 text-white' : 'hover:bg-gray-700 hover:text-white'
    }`;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-[#111827] text-white flex-shrink-0 flex flex-col">
        <div className="h-16 flex items-center justify-center px-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">BrilhaSorte Admin</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <NavLink to="/admin/dashboard" className={navLinkClasses}><DashboardIcon />Dashboard</NavLink>
          <NavLink to="/admin/users" className={navLinkClasses}><UsersIcon />Usuários</NavLink>
          <NavLink to="/admin/games" className={navLinkClasses}><GamesIcon />Jogos</NavLink>
          <NavLink to="/admin/deposits" className={navLinkClasses}><TransactionsIcon />Depósitos</NavLink>
          <NavLink to="/admin/withdrawals" className={navLinkClasses}><TransactionsIcon />Saques</NavLink>
          <NavLink to="/admin/bonus-codes" className={navLinkClasses}><BonusIcon />Códigos de Bônus</NavLink>
          <NavLink to="/admin/scratch-cards" className={navLinkClasses}><ScratchCardIcon />Raspadinhas</NavLink>
          <NavLink to="/admin/support" className={navLinkClasses}><SupportIcon />Suporte</NavLink>
          <NavLink to="/admin/mines-games" className={navLinkClasses}><MinesIcon />Jogos Mines</NavLink>
          <NavLink to="/admin/plinko-games" className={navLinkClasses}><PlinkoIcon />Jogos Plinko</NavLink>
        </nav>
        <div className="p-4 border-t border-gray-700">
          <NavLink to="/games" className="text-sm text-gray-400 hover:text-white transition-colors">
            &larr; Voltar ao site
          </NavLink>
        </div>
      </aside>
      
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm h-16 flex items-center px-6 border-b">
          <h1 className="text-xl font-semibold text-gray-800">{getPageTitle()}</h1>
        </header>
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
