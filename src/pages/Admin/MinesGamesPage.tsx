import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getAdminMinesGameList } from '../../services/api';
import MinesGameList from '../../components/Admin/Mines/MinesGameList';
import PaginationControls from '../../components/Shared/PaginationControls';
import type { AdminMinesGameListItem } from '../../types';

// Tipo para os dados processados que serão usados no estado do componente
type ProcessedMinesGame = AdminMinesGameListItem & {
  relationships: any;
};

const MinesGamesPage: React.FC = () => {
  const [games, setGames] = useState<ProcessedMinesGame[]>([]);
  const [included, setIncluded] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Busca os dados da página especificada
  const fetchGames = async (page: number) => {
    setLoading(true);
    try {
      const response = await getAdminMinesGameList(page);
      
      // Corrigido: Mapeia a resposta da API para a estrutura de dados correta e "plana"
      const formattedGames: ProcessedMinesGame[] = response.data.data.map(item => ({
        ...item.attributes, // Espalha os atributos como bet_amount, state, etc.
        id: item.id,       // Usa o ID principal do item
        relationships: item.relationships, // Mantém o objeto de relacionamentos
      }));

      setGames(formattedGames);
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
  }, [currentPage]);

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