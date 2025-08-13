import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getAdminLimboGames } from '../../services/api';
import LimboGameList from '../../components/Admin/Limbo/LimboGameList';
import PaginationControls from '../../components/Shared/PaginationControls';
import type { JsonApiData, AdminGameListItem } from '../../types';
import { Rocket } from 'lucide-react';

const LimboGamesPage: React.FC = () => {
  const [games, setGames] = useState<JsonApiData<AdminGameListItem>[]>([]);
  const [included, setIncluded] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchGames = async (page: number) => {
    setLoading(true);
    try {
      const response = await getAdminLimboGames(page);
      setGames(response.data.data as any);
      setIncluded(response.data.included || []);
      setTotalPages(parseInt(response.headers['total-pages'] || '1'));
      setCurrentPage(parseInt(response.headers['current-page'] || '1'));
    } catch (error) {
      toast.error('Falha ao carregar o histórico de jogos do Limbo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames(currentPage);
  }, [currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-3"><Rocket /> Jogos Limbo</h1>
                <p className="text-sm text-gray-400 mt-1">Gira e monitorize todos os jogos Limbo.</p>
            </div>
        </div>

        <div className="bg-black/30 backdrop-blur-md border border-white/10 shadow-2xl rounded-2xl p-6">
            <LimboGameList games={games} loading={loading} included={included} />
            
            {totalPages > 1 && (
                <div className="mt-6">
                    <PaginationControls
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}
        </div>
    </div>
  );
};

export default LimboGamesPage;
