import React, { useState, useEffect } from 'react';
import { getAdminGameList } from '../../../services/api';
import type { AdminGameListItem } from '../../../types';

const GameList: React.FC = () => {
  const [games, setGames] = useState<AdminGameListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getAdminGameList()
      .then(response => {
        const includedData = response.data.included || [];
        const gameData = response.data.data.map(item => {
          const userRel = item.relationships?.user.data;
          const prizeRel = item.relationships?.prize.data;
          const cardRel = item.relationships?.scratch_card.data;

          const user = includedData.find(inc => inc.id === userRel?.id && inc.type === 'user');
          const prize = includedData.find(inc => inc.id === prizeRel?.id && inc.type === 'prize');
          const scratchCard = includedData.find(inc => inc.id === cardRel?.id && inc.type === 'scratch_card');

          return {
            ...item.attributes,
            id: parseInt(item.id),
            user: user?.attributes as any || { id: null, full_name: 'N/A' },
            prize: prize?.attributes as any || { id: null, name: 'N/A' },
            scratch_card: scratchCard?.attributes as any || { id: null, name: 'N/A' },
          };
        });
        setGames(gameData);
      })
      .catch(() => {
        setError('Não foi possível carregar a lista de jogos.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Carregando jogos...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Gerenciamento de Jogos</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuário</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Raspadinha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prêmio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Ganho</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {games.map((game) => (
              <tr key={game.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{game.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{game.user.full_name || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{game.scratch_card.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{game.prize.name}</td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${game.winnings_in_cents > 0 ? 'text-green-600' : ''}`}>
                  R$ {(game.winnings_in_cents / 100).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(game.created_at).toLocaleString('pt-BR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GameList;