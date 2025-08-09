import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getAdminPlinkoGameList } from '../../services/api';
import PlinkoGameList from '../../components/Admin/Plinko/PlinkoGameList';
import PaginationControls from '../../components/Shared/PaginationControls';
import type { AdminPlinkoGameListItem } from '../../types';

// Tipo para os dados processados que serão usados no estado do componente
type ProcessedPlinkoGame = AdminPlinkoGameListItem['attributes'] & {
  id: string;
  relationships: any;
};

const PlinkoGamesPage: React.FC = () => {
  const [games, setGames] = useState<ProcessedPlinkoGame[]>([]);
  const [included, setIncluded] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchGames = async (page: number) => {
    setLoading(true);
    try {
      const response = await getAdminPlinkoGameList(page);

      // Corrigido: Mapeia a resposta para a estrutura de dados correta e "plana"
      const formattedGames: ProcessedPlinkoGame[] = response.data.data.map(item => ({
        ...item.attributes, // Espalha os atributos como bet_amount, risk, etc.
        id: item.id,       // Usa o ID principal do item
        relationships: item.relationships, // Mantém o objeto de relacionamentos
      }));
      
      setGames(formattedGames);
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