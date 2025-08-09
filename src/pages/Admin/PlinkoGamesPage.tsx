import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getAdminPlinkoGameList } from '../../services/api';
import PlinkoGameList from '../../components/Admin/Plinko/PlinkoGameList';
import PaginationControls from '../../components/Shared/PaginationControls'; // 1. Importe o componente
import type { AdminPlinkoGameListItem } from '../../types';

const PlinkoGamesPage: React.FC = () => {
  const [games, setGames] = useState<AdminPlinkoGameListItem[]>([]);
  const [included, setIncluded] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 2. Adicione estados para a paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 3. Modifique a função para aceitar e usar a página
  const fetchGames = async (page: number) => {
    setLoading(true);
    try {
      const response = await getAdminPlinkoGameList(page);
      setGames(response.data.data);
      setIncluded(response.data.included || []);
      
      // 4. Extraia os dados de paginação dos cabeçalhos da resposta
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
  }, [currentPage]); // O useEffect agora depende da página atual

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Histórico de Jogos - Plinko</h1>
      <div className="bg-gray-800 shadow sm:rounded-lg">
        <PlinkoGameList games={games} loading={loading} included={included} />
      </div>
      {/* 5. Renderize os controles de paginação */}
      <PaginationControls 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default PlinkoGamesPage;