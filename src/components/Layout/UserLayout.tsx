import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const UserLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--background-dark)]">
      <Navbar />
      <main className="flex-grow">
        {/* O conteúdo de cada página será renderizado aqui */}
        <Outlet />
      </main>
    </div>
  );
};

export default UserLayout;