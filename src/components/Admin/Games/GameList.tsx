import React, { useState, useEffect } from 'react';
import { getAdminGameList } from '../../../services/api';
import type { AdminGameListItem } from '../../../types';
import PaginationControls from '../../Shared/PaginationControls';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Gamepad2, Trophy, Ticket } from 'lucide-react';

type ProcessedGame = AdminGameListItem & {
  relationships: any;
};

const GameList: React.FC = () => {
  const [games, setGames] = useState<ProcessedGame[]>([]);
  const [included, setIncluded] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchGames = async (page: number) => {
    setLoading(true);
    try {
      const response = await getAdminGameList(page);
      const formattedGames: ProcessedGame[] = response.data.data.map((item: any) => ({
        ...item.attributes,
        id: parseInt(item.id, 10),
        relationships: item.relationships,
      }));
      setGames(formattedGames);
      setIncluded(response.data.included || []);
      setTotalPages(parseInt(response.headers['total-pages'] || '1'));
      setCurrentPage(parseInt(response.headers['current-page'] || '1'));
    } catch (error) {
      toast.error('Não foi possível carregar a lista de jogos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames(currentPage);
  }, [currentPage]);

  const findIncludedData = (relationship: { data: { id: string; type: string } } | undefined) => {
    if (!relationship?.data) return { name: 'N/A', email: 'N/A', full_name: 'N/A' };
    const { id, type } = relationship.data;
    const found = included.find(item => item.id === id && item.type === type);
    return found?.attributes || { name: 'N/A', email: 'N/A', full_name: 'N/A' };
  };

  const formatWinnings = (winningsInCents: number) => {
    return (winningsInCents / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const renderContent = () => {
    if (loading) return <div className="text-center text-gray-400 py-12">A carregar jogos...</div>;
    if (games.length === 0) return <div className="text-center text-gray-400 py-12">Nenhum jogo encontrado.</div>;

    return (
        <div className="space-y-4">
            {games.map((game, index) => {
                const user = findIncludedData(game.relationships.user);
                const prize = findIncludedData(game.relationships.prize);
                const scratchCard = findIncludedData(game.relationships.scratch_card);
                const hasWon = game.winnings_in_cents > 0;

                return (
                    <motion.div
                        key={game.id}
                        className="bg-white/5 p-4 rounded-lg border border-white/10"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                            <div>
                                <p className="text-xs text-gray-400">Utilizador</p>
                                <p className="font-medium text-white truncate">{user.full_name || user.email}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Raspadinha</p>
                                <p className="font-medium text-gray-300 flex items-center gap-2"><Ticket size={14} /> {scratchCard.name}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Prémio</p>
                                <p className="font-medium text-gray-300 flex items-center gap-2"><Trophy size={14} /> {prize.name}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Valor Ganho</p>
                                <p className={`font-semibold ${hasWon ? 'text-green-400' : 'text-gray-400'}`}>
                                    {formatWinnings(game.winnings_in_cents)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Data</p>
                                <p className="text-gray-300">{new Date(game.created_at).toLocaleString('pt-BR')}</p>
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
  };

  return (
    <div className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-3"><Gamepad2 /> Histórico de Jogos</h1>
                <p className="text-sm text-gray-400 mt-1">Gira e monitorize todos os jogos de raspadinha.</p>
            </div>
        </div>

        <div className="bg-black/30 backdrop-blur-md border border-white/10 shadow-2xl rounded-2xl p-6">
            {renderContent()}
            
            {totalPages > 1 && (
                <div className="mt-6">
                    <PaginationControls
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={(page) => setCurrentPage(page)}
                    />
                </div>
            )}
        </div>
    </div>
  );
};

export default GameList;
