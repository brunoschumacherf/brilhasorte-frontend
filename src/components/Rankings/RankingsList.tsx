import React, { useState, useEffect, useCallback } from 'react';
import { getRankings, type RankingPeriod } from '../../services/api';
import type { RankingItem } from '../../types';

const RankingsList: React.FC = () => {
  const [period, setPeriod] = useState<RankingPeriod>('weekly');
  const [rankings, setRankings] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRankings = useCallback((currentPeriod: RankingPeriod) => {
    setLoading(true);
    setError('');
    getRankings(currentPeriod)
      .then(response => {
        setRankings(response.data.ranking);
      })
      .catch(() => {
        setError('Não foi possível carregar os rankings.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchRankings(period);
  }, [period, fetchRankings]);

  const periodLabels: { key: RankingPeriod; label: string }[] = [
    { key: 'daily', label: 'Diário' },
    { key: 'weekly', label: 'Semanal' },
    { key: 'monthly', label: 'Mensal' },
    { key: 'all_time', label: 'Geral' },
  ];

  const getTrophyColor = (index: number) => {
    if (index === 0) return 'text-yellow-400'; // Ouro
    if (index === 1) return 'text-gray-400';  // Prata
    if (index === 2) return 'text-yellow-600'; // Bronze
    return 'text-[var(--text-secondary)]';
  };

  return (
    <div className="bg-[var(--surface-dark)] border border-[var(--border-color)] p-6 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-2 text-center text-[var(--primary-gold)]">Hall da Fama</h1>
      <p className="text-center text-[var(--text-secondary)] mb-6">Veja os jogadores com os maiores prêmios.</p>
      
      <div className="flex justify-center space-x-2 mb-8">
        {periodLabels.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setPeriod(key)}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${
              period === key
                ? 'bg-[var(--primary-gold)] text-black shadow-md'
                : 'bg-[#2a2a2a] text-[var(--text-secondary)] hover:bg-[#333]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && <p className="text-center text-[var(--text-secondary)]">Carregando...</p>}
      {error && <p className="text-center text-red-400">{error}</p>}

      {!loading && !error && (
        <ul className="space-y-3">
          {rankings.length > 0 ? (
            rankings.map((player, index) => (
              <li key={index} className="flex items-center justify-between p-4 rounded-lg bg-[#2a2a2a] border border-transparent hover:border-[var(--primary-gold)] transition-colors">
                <div className="flex items-center">
                  <span className={`text-xl font-bold w-10 ${getTrophyColor(index)}`}>{index + 1}.</span>
                  <span className="text-md font-medium text-[var(--text-primary)]">{player.full_name}</span>
                </div>
                <span className="text-lg font-bold text-green-400">
                  R$ {(player.total_winnings / 100).toFixed(2)}
                </span>
              </li>
            ))
          ) : (
            <div className="text-center text-[var(--text-secondary)] py-8">
              <p>Nenhum ranking disponível para este período.</p>
              <p className="text-sm">Jogue para aparecer aqui!</p>
            </div>
          )}
        </ul>
      )}
    </div>
  );
};

export default RankingsList;