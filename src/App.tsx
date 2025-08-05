import React, { type ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import Navbar from './components/Layout/Navbar';
import AdminRoute from './components/Admin/AdminRoute';
// Páginas
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage'; // Nova página
import ResetPasswordPage from './pages/ResetPasswordPage'; // Nova página
import GamesPage from './pages/GamesPage';
import ProfilePage from './pages/ProfilePage';
import GameRevealPage from './pages/GameRevealPage';
import HistoryPage from './pages/HistoryPage';
import RankingsPage from './pages/RankingsPage';
import ReferralsPage from './pages/ReferralsPage';
import DashboardPage from './pages/Admin/DashboardPage';

const PrivateRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return <p className="text-center mt-8">Carregando...</p>;
  }
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-gray-100">
          <Navbar />
          <main className="flex-grow container mx-auto p-6">
            <Routes>
              {/* Rotas Públicas */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

              {/* Rotas Privadas de Usuário */}
              <Route path="/games" element={<PrivateRoute><GamesPage /></PrivateRoute>} />
              <Route path="/games/:gameId" element={<PrivateRoute><GameRevealPage /></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
              <Route path="/history" element={<PrivateRoute><HistoryPage /></PrivateRoute>} />
              <Route path="/rankings" element={<PrivateRoute><RankingsPage /></PrivateRoute>} />
              <Route path="/referrals" element={<PrivateRoute><ReferralsPage /></PrivateRoute>} />

              {/* Rotas Privadas de Admin */}
              <Route path="/admin/dashboard" element={<AdminRoute><DashboardPage /></AdminRoute>} />

              {/* Redirecionamento Padrão */}
              <Route path="*" element={<Navigate to="/games" />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;