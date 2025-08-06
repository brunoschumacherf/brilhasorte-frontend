import React, { useState, useEffect } from 'react';
import { getGameHistory } from '../../services/api';
import type { GameHistoryItem } from '../../types';

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
      .catch(() => setError('Não foi possível carregar o histórico de jogos.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-center p-4 text-[var(--text-secondary)]">Carregando histórico de jogos...</p>;
  if (error) return <p className="text-center p-4 text-red-400">{error}</p>;

  return (
    <div>
      {games.length === 0 ? (
        <p className="p-4 text-center text-[var(--text-secondary)]">Nenhum jogo encontrado.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead >
              <tr className="border-b border-[var(--border-color)]">
                <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase">Data</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase">Jogo</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase">Prêmio</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase">Valor Ganho</th>
              </tr>
            </thead>
            <tbody>
              {games.map((game) => (
                <tr key={game.id} className="border-b border-[var(--border-color)] hover:bg-[#2a2a2a]">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">{new Date(game.created_at).toLocaleString('pt-BR')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-primary)]">{game.scratch_card_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">{game.prize_name}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${game.winnings_in_cents > 0 ? 'text-green-400' : 'text-[var(--text-primary)]'}`}>
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