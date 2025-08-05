import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const AdminLayout: React.FC = () => {
  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-4 py-2 text-gray-100 rounded-md transition-colors ${
      isActive ? 'bg-gray-700' : 'hover:bg-gray-700'
    }`;

  return (
    <div className="flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white p-4">
        <h2 className="text-xl font-bold mb-6">Admin</h2>
        <nav>
          <ul>
            <li>
              <NavLink to="/admin/dashboard" className={navLinkClasses}>
                Dashboard
              </NavLink>
            </li>
            <li className="mt-2">
              <NavLink to="/admin/users" className={navLinkClasses}>
                Usuários
              </NavLink>
            </li>
            {/* Adicionar mais links aqui no futuro (Jogos, Depósitos, etc.) */}
          </ul>
        </nav>
      </aside>

      {/* Conteúdo da Página */}
      <main className="flex-1 p-6 bg-gray-100">
        <Outlet /> {/* As rotas aninhadas serão renderizadas aqui */}
      </main>
    </div>
  );
};

export default AdminLayout;