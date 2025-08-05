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

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-4 text-gray-800">Ranking de Ganhadores</h1>
      
      <div className="flex justify-center space-x-2 mb-6 border-b pb-4">
        {periodLabels.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setPeriod(key)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              period === key
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && <p className="text-center text-gray-500">Carregando...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {!loading && !error && (
        <ul className="space-y-3">
          {rankings.length > 0 ? (
            rankings.map((player, index) => (
              <li key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100">
                <div className="flex items-center">
                  <span className="text-lg font-bold text-gray-500 w-8">{index + 1}.</span>
                  <span className="text-md font-semibold text-gray-800">{player.full_name}</span>
                </div>
                <span className="text-lg font-bold text-green-600">
                  R$ {(player.total_winnings / 100).toFixed(2)}
                </span>
              </li>
            ))
          ) : (
            <p className="text-center text-gray-500 py-4">Nenhum ranking disponível para este período.</p>
          )}
        </ul>
      )}
    </div>
  );
};

export default RankingsList;