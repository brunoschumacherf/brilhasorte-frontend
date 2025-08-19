import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getAdminTowerGames } from '../../services/api';
import TowerGameList from '../../components/Admin/Tower/TowerGameList';
import PaginationControls from '../../components/Shared/PaginationControls';
import type { TowerGame } from '../../types';
import { BarChart3 } from 'lucide-react'; // Usando um ícone relevante

// Função para deserializar a resposta JSON:API
const deserializeGames = (response: any): TowerGame[] => {
  const includedUsers = new Map(response.data.included?.map((item: any) => [item.id, item.attributes]));
  return response.data.data.map((item: any) => {
    const userId = item.relationships.user.data.id;
    return {
      ...item.attributes,
      id: parseInt(item.id),
      user: includedUsers.get(userId)
    };
  });
};

const TowerGamesPage: React.FC = () => {
  const [games, setGames] = useState<TowerGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchGames = async (page: number) => {
    setLoading(true);
    try {
      const response = await getAdminTowerGames(page);
      setGames(deserializeGames(response));
      setTotalPages(parseInt(response.headers['total-pages'] || '1'));
      setCurrentPage(parseInt(response.headers['current-page'] || '1'));
    } catch (error) {
      toast.error('Falha ao carregar o histórico de jogos do Tower.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames(currentPage);
  }, [currentPage]);

  return (
    <div className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-3"><BarChart3 /> Jogos Tower</h1>
                <p className="text-sm text-gray-400 mt-1">Gira e monitorize todos os jogos Tower.</p>
            </div>
        </div>

        <div className="bg-black/30 backdrop-blur-md border border-white/10 shadow-2xl rounded-2xl p-6">
            <TowerGameList games={games} loading={loading} />
            
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

export default TowerGamesPage;
