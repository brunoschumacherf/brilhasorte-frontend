import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGameHistory } from '../services/api';
import type { GameHistoryItem } from '../types';
import EmptyState from '../components/Shared/EmptyState';

const GamesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg>;

const MyGamesPage: React.FC = () => {
  const [pendingGames, setPendingGames] = useState<GameHistoryItem[]>([]);
  const [finishedGames, setFinishedGames] = useState<GameHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getGameHistory()
      .then(response => {
        const allGames = response.data.data.map(item => ({
          ...item.attributes,
          id: parseInt(item.id),
        }));
        setPendingGames(allGames.filter(game => game.status === 'pending'));
        setFinishedGames(allGames.filter(game => game.status === 'finished'));
      })
      .catch(() => setError('Não foi possível carregar suas raspadinhas.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      <div>
        <h2 className="text-3xl font-bold mb-4 text-[var(--primary-gold)]">Raspadinhas Pendentes</h2>
        {loading ? <p className="text-[var(--text-secondary)]">Carregando...</p> :
         error ? <p className="text-red-400">{error}</p> :
         pendingGames.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingGames.map(game => (
              <div key={game.id} className="bg-[var(--surface-dark)] border border-[var(--border-color)] rounded-lg p-5 flex flex-col justify-between">
                <h3 className="text-lg font-semibold text-white">{game.scratch_card.name}</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1">Comprada em: {new Date(game.created_at).toLocaleDateString('pt-BR')}</p>
                <button 
                  onClick={() => navigate(`/games/${game.id}`)}
                  className="mt-4 w-full bg-[var(--primary-gold)] text-black font-bold py-2 px-4 rounded-lg transition-transform hover:scale-105"
                >
                  Raspar Agora
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[var(--text-secondary)]">Você não tem raspadinhas pendentes.</p>
        )}
      </div>

      <div>
        <h2 className="text-3xl font-bold mb-4 text-white">Últimos Jogos Finalizados</h2>
        {loading ? <p className="text-[var(--text-secondary)]">Carregando...</p> :
         finishedGames.length > 0 ? (
          <div className="bg-[var(--surface-dark)] border border-[var(--border-color)] rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="border-b border-[var(--border-color)]">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase">Jogo</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase">Prêmio</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase">Valor Ganho</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase">Data</th>
                    </tr>
                </thead>
                <tbody>
                  {finishedGames.slice(0, 10).map(game => (
                    <tr key={game.id} className="border-b border-[var(--border-color)] hover:bg-[#2a2a2a]">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-primary)]">{game.scratch_card.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">{game.prize.name}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${game.winnings_in_cents > 0 ? 'text-green-400' : 'text-[var(--text-primary)]'}`}>
                        R$ {(game.winnings_in_cents / 100).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">{new Date(game.created_at).toLocaleString('pt-BR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <EmptyState 
            icon={<GamesIcon />}
            title="Nenhum jogo finalizado"
            message="Seus jogos finalizados aparecerão aqui."
            actionText="Ver Raspadinhas"
            actionTo="/games"
          />
        )}
      </div>
    </div>
  );
};

export default MyGamesPage;
