import React, { useState, useEffect } from 'react';
import { getGameHistory } from '../../services/api';
import type { JsonApiData, GameHistoryItem } from '../../types';

// O tipo combinado para facilitar o uso
type CombinedGameHistoryItem = GameHistoryItem & {
  prize_name: string;
  scratch_card_name: string;
};

const GameHistoryList: React.FC = () => {
  const [games, setGames] = useState<CombinedGameHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getGameHistory()
      .then(response => {
        // A API de histórico de jogos envia os dados relacionados em 'included'
        const includedData = response.data.included || [];

        const combinedGames = response.data.data.map(gameData => {
          const prizeRel = gameData.relationships?.prize.data;
          const cardRel = gameData.relationships?.scratch_card.data;

          const prize = includedData.find(inc => inc.id === prizeRel?.id && inc.type === 'prize');
          const scratchCard = includedData.find(inc => inc.id === cardRel?.id && inc.type === 'scratch_card');
          
          return {
            ...gameData.attributes,
            id: parseInt(gameData.id),
            prize_name: prize?.attributes.name || 'N/A',
            scratch_card_name: scratchCard?.attributes.name || 'N/A',
          };
        });

        setGames(combinedGames);
      })
      .catch(() => {
        setError('Não foi possível carregar o histórico de jogos.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);


  if (loading) {
    return <p className="text-center p-4">Carregando histórico...</p>;
  }

  if (error) {
    return <p className="text-center p-4 text-red-500">{error}</p>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <h3 className="text-xl font-semibold p-4 border-b">Histórico de Jogos</h3>
      {games.length === 0 ? (
        <p className="p-4 text-gray-500">Nenhum jogo encontrado.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jogo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prêmio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Ganho</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {games.map((game) => (
                <tr key={game.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(game.created_at).toLocaleString('pt-BR')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{game.scratch_card_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{game.prize_name}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${game.winnings_in_cents > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                    R$ {(game.winnings_in_cents / 100).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default GameHistoryList;