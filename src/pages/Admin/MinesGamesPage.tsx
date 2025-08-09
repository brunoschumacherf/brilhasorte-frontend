import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getAdminMinesGameList } from '../../services/api';
import MinesGameList from '../../components/Admin/Mines/MinesGameList';
import PaginationControls from '../../components/Shared/PaginationControls';
import type { AdminMinesGameListItem } from '../../types';

const MinesGamesPage: React.FC = () => {
  const [games, setGames] = useState<AdminMinesGameListItem[]>([]);
  const [included, setIncluded] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetches data for the specified page
  const fetchGames = async (page: number) => {
    setLoading(true);
    try {
      const response = await getAdminMinesGameList(page);
      setGames(response.data.data);
      setIncluded(response.data.included || []);
      setTotalPages(parseInt(response.headers['total-pages'] || '1'));
      setCurrentPage(parseInt(response.headers['current-page'] || '1'));
    } catch (error) {
      toast.error('Falha ao carregar o histórico de jogos do Mines.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames(currentPage);
  }, [currentPage]); // Re-fetches when currentPage changes

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Histórico de Jogos - Mines</h1>
      <div className="bg-gray-800 shadow sm:rounded-lg">
        <MinesGameList games={games} loading={loading} included={included} />
      </div>
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default MinesGamesPage;