import React, { useState, useEffect, useCallback, type ReactNode } from 'react';
import { getAdminDashboardStats, type RankingPeriod } from '../../../services/api';
import type { AdminDashboardStats } from '../../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Wallet, Users, Gamepad2, AlertTriangle, LayoutDashboard } from 'lucide-react';

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center h-64 text-gray-400">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    >
      <LayoutDashboard className="h-12 w-12 text-[var(--primary-gold)]" />
    </motion.div>
    <p className="mt-4 text-lg text-gray-300">Carregando estatísticas...</p>
  </div>
);

interface StatCardProps {
  title: string;
  value: string | number | null;
  icon: ReactNode;
  color: string;
  isCurrency?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, isCurrency = false }) => {
  const formatCurrency = (valueInCents: number) => {
    const value = valueInCents / 100;
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const displayValue =
    value === null || value === undefined
      ? '-'
      : isCurrency
      ? formatCurrency(Number(value))
      : Number(value).toLocaleString('pt-BR');

  return (
    <div className="bg-white/5 p-5 rounded-lg border border-white/10 flex items-center gap-5 hover:scale-[1.02] transition-transform">
      <div className={`flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center bg-gradient-to-br ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-white">{displayValue}</p>
      </div>
    </div>
  );
};

const DashboardStats: React.FC = () => {
  const [period, setPeriod] = useState<RankingPeriod>('monthly');
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = useCallback((currentPeriod: RankingPeriod) => {
    setLoading(true);
    setError('');
    getAdminDashboardStats(currentPeriod)
      .then(response => setStats(response.data.statistics))
      .catch(() => setError('Não foi possível carregar as estatísticas.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchStats(period);
  }, [period, fetchStats]);

  const periodLabels: { key: RankingPeriod; label: string }[] = [
    { key: 'daily', label: 'Hoje' },
    { key: 'weekly', label: 'Esta Semana' },
    { key: 'monthly', label: 'Este Mês' },
    { key: 'all_time', label: 'Geral' },
  ];

  return (
    <div className="relative min-h-screen bg-[#101010] p-4 sm:p-6 lg:p-8 overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full filter blur-3xl opacity-50 animate-blob"></div>
      <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="bg-black/30 backdrop-blur-md border border-white/10 shadow-2xl rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Dashboard Administrativo</h1>
              <p className="text-sm text-gray-400 mt-1">Visão geral das métricas da plataforma.</p>
            </div>
            <div className="flex justify-center bg-black/20 p-1 rounded-full border border-white/10">
              {periodLabels.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setPeriod(key)}
                  className={`w-full px-4 py-2 text-sm font-semibold rounded-full transition-colors relative ${
                    period === key ? 'text-black' : 'text-gray-300 hover:bg-white/5'
                  }`}
                >
                  {period === key && (
                    <motion.div
                      layoutId="active-admin-tab"
                      className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={period}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {loading ? (
                  <LoadingSpinner />
                ) : error ? (
                  <p className="text-center text-red-400 p-4 bg-red-900/50 rounded-lg flex items-center gap-2 justify-center">
                    <AlertTriangle size={16} /> {error}
                  </p>
                ) : stats ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                      title="Receita Bruta (GGR)"
                      value={stats.gross_gaming_revenue_in_cents}
                      icon={<DollarSign />}
                      color="from-green-500 to-emerald-600"
                      isCurrency
                    />
                    <StatCard
                      title="Total Depositado"
                      value={stats.total_deposited_in_cents}
                      icon={<Wallet />}
                      color="from-blue-500 to-cyan-600"
                      isCurrency
                    />
                    <StatCard
                      title="Novos Utilizadores"
                      value={stats.new_users}
                      icon={<Users />}
                      color="from-purple-500 to-indigo-600"
                    />
                    <StatCard
                      title="Jogos Disputados"
                      value={stats.games_played}
                      icon={<Gamepad2 />}
                      color="from-orange-500 to-red-600"
                    />
                  </div>
                ) : (
                  <p className="text-center text-gray-400">Nenhum dado disponível.</p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
