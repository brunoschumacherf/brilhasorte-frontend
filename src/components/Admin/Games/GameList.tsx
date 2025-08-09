import React, { useState, useEffect } from 'react';
import { getAdminGameList } from '../../../services/api';
import type { AdminGameListItem } from '../../../types';
import TableSkeleton from '../../Shared/TableSkeleton';
import PaginationControls from '../../Shared/PaginationControls';
import { toast } from 'react-toastify';

// This new type represents the actual shape of the data we'll use in the component's state.
type ProcessedGame = AdminGameListItem & {
  relationships: any;
};

const GameList: React.FC = () => {
  const [games, setGames] = useState<ProcessedGame[]>([]);
  const [included, setIncluded] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetches data for the specified page
  const fetchGames = async (page: number) => {
    setLoading(true);
    try {
      const response = await getAdminGameList(page);

      // We map the API response to a flatter, easier-to-use structure.
      const formattedGames: ProcessedGame[] = response.data.data.map(item => ({
        ...item.attributes, // Spread all the attributes like status, winnings, etc.
        id: parseInt(item.id, 10), // Use the main ID, converting it to a number.
        relationships: item.relationships, // Keep the relationships for user, prize, etc.
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

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const findIncludedData = (relationship: { data: { id: string; type: string } } | undefined) => {
    if (!relationship?.data) return { name: 'N/A', email: 'N/A' };
    const { id, type } = relationship.data;
    const found = included.find(item => item.id === id && item.type === type);
    return found?.attributes || { name: 'N/A', email: 'N/A' };
  };

  const formatWinnings = (winningsInCents: number) => {
    return (winningsInCents / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Histórico de Jogos (Raspadinhas)</h1>

      <div className="bg-gray-800 shadow sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Usuário</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Raspadinha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Prêmio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Valor Ganho</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Data</th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {loading ? <TableSkeleton cols={5} /> : games.map((game) => {
                const user = findIncludedData(game.relationships.user);
                const prize = findIncludedData(game.relationships.prize);
                const scratchCard = findIncludedData(game.relationships.scratch_card);

                return (
                  <tr key={game.id} className="hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">
                      {user.full_name || user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {scratchCard.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {prize.name}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${game.winnings_in_cents > 0 ? 'text-green-400' : 'text-gray-400'}`}>
                      {formatWinnings(game.winnings_in_cents)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {new Date(game.created_at).toLocaleString('pt-BR')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default GameList;