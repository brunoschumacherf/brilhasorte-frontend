import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Gamepad2, ArrowDownCircle, ArrowUpCircle, Gift, Ticket, LifeBuoy, Bomb, Gem, Menu, TowerControl, Rocket, Dices } from 'lucide-react';

const SidebarNavLink = ({ to, icon, children }: { to: string, icon: React.ReactNode, children: React.ReactNode }) => {
    const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
        `flex items-center px-3 py-2 text-gray-300 rounded-md transition-colors text-sm font-medium ${
            isActive ? 'bg-zinc-700 text-white' : 'hover:bg-zinc-700/50 hover:text-white'
        }`;
    return (
        <NavLink to={to} className={navLinkClasses}>
            {icon}
            {children}
        </NavLink>
    );
};

const SidebarContent = () => (
    <>
        <div className="h-20 flex items-center justify-center px-4 border-b border-zinc-700">
            <h2 className="text-xl font-bold text-white">BrilhaSorte Admin</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
            <SidebarNavLink to="/admin/dashboard" icon={<LayoutDashboard size={20} className="mr-3" />}>Dashboard</SidebarNavLink>
            <SidebarNavLink to="/admin/users" icon={<Users size={20} className="mr-3" />}>Utilizadores</SidebarNavLink>
            <SidebarNavLink to="/admin/games" icon={<Gamepad2 size={20} className="mr-3" />}>Jogos</SidebarNavLink>
            <SidebarNavLink to="/admin/deposits" icon={<ArrowDownCircle size={20} className="mr-3" />}>Depósitos</SidebarNavLink>
            <SidebarNavLink to="/admin/withdrawals" icon={<ArrowUpCircle size={20} className="mr-3" />}>Saques</SidebarNavLink>
            <SidebarNavLink to="/admin/bonus-codes" icon={<Gift size={20} className="mr-3" />}>Códigos de Bónus</SidebarNavLink>
            <SidebarNavLink to="/admin/scratch-cards" icon={<Ticket size={20} className="mr-3" />}>Raspadinhas</SidebarNavLink>
            <SidebarNavLink to="/admin/support" icon={<LifeBuoy size={20} className="mr-3" />}>Suporte</SidebarNavLink>
            <SidebarNavLink to="/admin/mines-games" icon={<Bomb size={20} className="mr-3" />}>Jogos Mines</SidebarNavLink>
            <SidebarNavLink to="/admin/plinko-games" icon={<Gem size={20} className="mr-3" />}>Jogos Plinko</SidebarNavLink>
            <SidebarNavLink to="/admin/tower"icon={<TowerControl size={20} className="mr-3" />}> Tower</SidebarNavLink>
            <SidebarNavLink to="/admin/limbo" icon={<Rocket size={20} className="mr-3" />}>Limbo</SidebarNavLink>
            <SidebarNavLink to="/admin/double" icon={<Dices size={20} className="mr-3" />}>Double</SidebarNavLink>

        </nav>
        <div className="p-4 border-t border-zinc-700">
            <NavLink to="/games" className="text-sm text-gray-400 hover:text-white transition-colors">
                &larr; Voltar ao site
            </NavLink>
        </div>
    </>
);

// --- Componente Principal do Layout ---
const AdminLayout: React.FC = () => {
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const getPageTitle = () => {
        const path = location.pathname.split('/').pop();
        switch (path) {
            case 'dashboard': return 'Dashboard';
            case 'users': return 'Gestão de Utilizadores';
            case 'games': return 'Gestão de Jogos';
            case 'deposits': return 'Gestão de Depósitos';
            case 'withdrawals': return 'Gestão de Saques';
            case 'bonus-codes': return 'Códigos de Bónus';
            case 'scratch-cards': return 'Raspadinhas';
            case 'support': return 'Tickets de Suporte';
            case 'mines-games': return 'Jogos Mines';
            case 'plinko-games': return 'Jogos Plinko';
            default: return 'Admin';
        }
    };

    return (
        <div className="flex min-h-screen bg-zinc-900 text-white">
            <aside className="w-64 bg-zinc-800 flex-shrink-0 flex-col hidden lg:flex">
                <SidebarContent />
            </aside>

            <div className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsSidebarOpen(false)}>
                <div className="absolute inset-0 bg-black/60"></div>
            </div>
            <aside className={`fixed top-0 left-0 h-full w-64 bg-zinc-800 flex-shrink-0 flex flex-col z-50 transform transition-transform duration-300 lg:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <SidebarContent />
            </aside>
            
            <div className="flex-1 flex flex-col">
                <header className="bg-zinc-800/50 backdrop-blur-sm h-20 flex items-center px-6 border-b border-zinc-700 sticky top-0 z-30">
                    <button className="lg:hidden mr-4 text-gray-300" onClick={() => setIsSidebarOpen(true)}>
                        <Menu size={24} />
                    </button>
                    <h1 className="text-xl font-semibold text-white">{getPageTitle()}</h1>
                </header>
                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
