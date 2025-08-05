import React, { type ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import Navbar from './components/Layout/Navbar';
import AdminLayout from './components/Admin/AdminLayout';
import AdminRoute from './components/Admin/AdminRoute';
// Páginas de Usuário
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import GamesPage from './pages/GamesPage';
import ProfilePage from './pages/ProfilePage';
import GameRevealPage from './pages/GameRevealPage';
import HistoryPage from './pages/HistoryPage';
import RankingsPage from './pages/RankingsPage';
import ReferralsPage from './pages/ReferralsPage';
// Páginas de Admin
import DashboardPage from './pages/Admin/DashboardPage';
import UsersPage from './pages/Admin/UsersPage';
import DepositsPage from './pages/Admin/DepositsPage';
import WithdrawalsPage from './pages/Admin/WithdrawalsPage'; // Importar nova página

const PrivateRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <p className="text-center mt-8">Carregando...</p>;
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* Lógica para não mostrar Navbar nas rotas de admin */}
        <Routes>
          <Route path="/admin/*" element={null} />
          <Route path="*" element={<Navbar />} />
        </Routes>
        
        {/* Container principal das rotas */}
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

          {/* Rotas Privadas de Usuário com layout padrão */}
          <Route path="/games" element={<PrivateRoute><div className="container mx-auto p-6"><GamesPage /></div></PrivateRoute>} />
          <Route path="/games/:gameId" element={<PrivateRoute><div className="container mx-auto p-6"><GameRevealPage /></div></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><div className="container mx-auto p-6"><ProfilePage /></div></PrivateRoute>} />
          <Route path="/history" element={<PrivateRoute><div className="container mx-auto p-6"><HistoryPage /></div></PrivateRoute>} />
          <Route path="/rankings" element={<PrivateRoute><div className="container mx-auto p-6"><RankingsPage /></div></PrivateRoute>} />
          <Route path="/referrals" element={<PrivateRoute><div className="container mx-auto p-6"><ReferralsPage /></div></PrivateRoute>} />

          {/* Rotas Privadas de Admin (agrupadas sob o AdminLayout) */}
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="deposits" element={<DepositsPage />} />
            <Route path="withdrawals" element={<WithdrawalsPage />} />
          </Route>

          {/* Redirecionamento Padrão */}
          <Route path="*" element={<Navigate to="/games" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;