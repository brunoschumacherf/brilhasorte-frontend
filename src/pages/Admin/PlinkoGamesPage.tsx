import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getAdminPlinkoGameList } from '../../services/api';
import PlinkoGameList from '../../components/Admin/Plinko/PlinkoGameList';
import PaginationControls from '../../components/Shared/PaginationControls';
import type { JsonApiData, AdminPlinkoGameListItem } from '../../types';

const PlinkoGamesPage: React.FC = () => {
  // O estado agora armazena a estrutura de dados completa da API
  const [games, setGames] = useState<JsonApiData<AdminPlinkoGameListItem>[]>([]);
  const [included, setIncluded] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchGames = async (page: number) => {
    setLoading(true);
    try {
      const response = await getAdminPlinkoGameList(page);
      // Define o estado diretamente com os dados da API, sem mapeamento
      setGames(response.data.data);
      setIncluded(response.data.included || []);
      setTotalPages(parseInt(response.headers['total-pages'] || '1'));
      setCurrentPage(parseInt(response.headers['current-page'] || '1'));
    } catch (error) {
      toast.error('Falha ao carregar o histórico de jogos do Plinko.');
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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Histórico de Jogos - Plinko</h1>
      <div className="bg-gray-800 shadow sm:rounded-lg">
        <PlinkoGameList games={games} loading={loading} included={included} />
      </div>
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default PlinkoGamesPage;