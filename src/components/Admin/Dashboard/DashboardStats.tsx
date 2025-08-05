import React, { useState, useEffect, useCallback } from 'react';
import { getAdminDashboardStats, type RankingPeriod } from '../../../services/api';
import type { AdminDashboardStats } from '../../../types';

// Componente para um card de estatística individual
const StatCard: React.FC<{ title: string; value: string | number; isCurrency?: boolean }> = ({ title, value, isCurrency = false }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <h4 className="text-sm font-medium text-gray-500">{title}</h4>
    <p className="mt-1 text-3xl font-semibold text-gray-900">
      {isCurrency ? `R$ ${(Number(value) / 100).toFixed(2)}` : value}
    </p>
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <div className="flex space-x-2">
          {periodLabels.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                period === key ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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
          <StatCard title="Receita Bruta (GGR)" value={stats.gross_gaming_revenue_in_cents} isCurrency />
          <StatCard title="Total Depositado" value={stats.total_deposited_in_cents} isCurrency />
          <StatCard title="Total Gasto em Jogos" value={stats.total_spent_on_games_in_cents} isCurrency />
          <StatCard title="Total Pago em Prêmios" value={stats.total_won_in_cents} isCurrency />
          <StatCard title="Jogos Disputados" value={stats.games_played} />
          <StatCard title="Novos Usuários (período)" value={stats.new_users} />
          <StatCard title="Total de Usuários" value={stats.total_users} />
        </div>
      )}
    </div>
  );
};

export default DashboardStats;