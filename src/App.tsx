import React, { type ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Componentes
import UserLayout from './components/Layout/UserLayout';
import AdminLayout from './components/Admin/AdminLayout';
import AdminRoute from './components/Admin/AdminRoute';
// Páginas
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import GamesPage from './pages/GamesPage';
import MyGamesPage from './pages/MyGamesPage';
import ProfilePage from './pages/ProfilePage';
import GameRevealPage from './pages/GameRevealPage';
import HistoryPage from './pages/HistoryPage';
import RankingsPage from './pages/RankingsPage';
import ReferralsPage from './pages/ReferralsPage';
import DashboardPage from './pages/Admin/DashboardPage';
import UsersPage from './pages/Admin/UsersPage';
import DepositsPage from './pages/Admin/DepositsPage';
import WithdrawalsPage from './pages/Admin/WithdrawalsPage';
import AdminGamesPage from './pages/Admin/GamesPage';
import BonusCodesPage from './pages/Admin/BonusCodesPage';
import ScratchCardsPage from './pages/Admin/ScratchCardsPage';
import SupportPage from './pages/SupportPage';
import TicketDetailPage from './pages/TicketDetailPage';
import AdminSupportPage from './pages/Admin/SupportPage'; // Criar esta página
import AdminSupportDetailPage from './pages/Admin/SupportDetailPage'; // Criar esta página
import MinesPage from './pages/MinesPage'; // 1. Importe a nova página
import MinesGamesPage from './pages/Admin/MinesGamesPage'; // 1. Importe a nova página




const PrivateRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="flex justify-center items-center h-screen bg-[var(--background-dark)]"><p>Carregando...</p></div>;
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="dark" />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

          <Route path="/" element={<PrivateRoute><UserLayout /></PrivateRoute>}>
            <Route index element={<Navigate to="/games" />} />
            <Route path="/mines" element={<MinesPage />} /> {/* 2. Adicione a rota */}
            <Route path="games" element={<GamesPage />} />
            <Route path="my-games" element={<MyGamesPage />} />
            <Route path="games/:gameId" element={<GameRevealPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="rankings" element={<RankingsPage />} />
            <Route path="referrals" element={<ReferralsPage />} />
            <Route path="support" element={<SupportPage />} /> {/* Nova Rota */}
            <Route path="support/:ticketNumber" element={<TicketDetailPage />} /> {/* Nova Rota */}
          </Route>

          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<Navigate to="/admin/dashboard" />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="deposits" element={<DepositsPage />} />
            <Route path="withdrawals" element={<WithdrawalsPage />} />
            <Route path="games" element={<AdminGamesPage />} />
            <Route path="mines-games" element={<MinesGamesPage />} />
            <Route path="bonus-codes" element={<BonusCodesPage />} />
            <Route path="scratch-cards" element={<ScratchCardsPage />} />
            <Route path="support" element={<AdminSupportPage />} /> {/* Nova Rota */}
            <Route path="support/:ticketNumber" element={<AdminSupportDetailPage />} /> {/* Nova Rota */}
          </Route>

          <Route path="*" element={<Navigate to="/games" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
