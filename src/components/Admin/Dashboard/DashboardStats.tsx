import React, { useState, useEffect, useCallback, type ReactNode } from 'react';
import { getAdminDashboardStats, type RankingPeriod } from '../../../services/api';
import type { AdminDashboardStats } from '../../../types';

// Ícones para os cards
const RevenueIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>;
const DepositIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-3-5.197M15 21a6 6 0 00-9-5.197" /></svg>;
const GamesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg>;


const StatCard: React.FC<{ title: string; value: string | number; icon: ReactNode; bgColor: string; isCurrency?: boolean }> = ({ title, value, icon, bgColor, isCurrency = false }) => (
  <div className="bg-white rounded-lg shadow-md flex items-center p-5">
    <div className={`rounded-full p-3 mr-4 ${bgColor}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-800">
        {isCurrency ? `R$ ${(Number(value) / 100).toFixed(2)}` : value}
      </p>
    </div>
  </div>
);

const DashboardStats: React.FC = () => {
  const [period, setPeriod] = useState<RankingPeriod>('monthly');
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = useCallback((currentPeriod: RankingPeriod) => {
    setLoading(true);
    setError('');
    getAdminDashboardStats(currentPeriod)
      .then(response => {
        setStats(response.data.statistics);
      })
      .catch(() => {
        setError('Não foi possível carregar as estatísticas.');
      })
      .finally(() => {
        setLoading(false);
      });
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
    <div>
      <div className="flex items-center justify-end mb-6">
        <div className="flex space-x-2 p-1 bg-gray-200 rounded-lg">
          {periodLabels.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${
                period === key ? 'bg-white text-gray-800 shadow' : 'bg-transparent text-gray-600 hover:bg-white/60'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading && <p>Carregando estatísticas...</p>}
      {error && <p className="text-red-500">{error}</p>}
      
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Receita Bruta (GGR)" value={stats.gross_gaming_revenue_in_cents} icon={<RevenueIcon />} bgColor="bg-green-500" isCurrency />
          <StatCard title="Total Depositado" value={stats.total_deposited_in_cents} icon={<DepositIcon />} bgColor="bg-blue-500" isCurrency />
          <StatCard title="Novos Usuários (período)" value={stats.new_users} icon={<UsersIcon />} bgColor="bg-purple-500" />
          <StatCard title="Jogos Disputados" value={stats.games_played} icon={<GamesIcon />} bgColor="bg-orange-500" />
        </div>
      )}
    </div>
  );
};

export default DashboardStats;
