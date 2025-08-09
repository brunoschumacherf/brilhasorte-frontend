import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getAdminMinesGameList } from '../../services/api';
import MinesGameList from '../../components/Admin/Mines/MinesGameList';
import type { AdminMinesGameListItem } from '../../types';

const MinesGamesPage: React.FC = () => {
  const [games, setGames] = useState<AdminMinesGameListItem[]>([]);
  const [included, setIncluded] = useState<any[]>([]); // Estado para os dados incluídos
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await getAdminMinesGameList();
        setGames(response.data.data);
        setIncluded(response.data.included || []); // Salva os dados incluídos
      } catch (error) {
        toast.error('Falha ao carregar o histórico de jogos do Mines.');
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Histórico de Jogos - Mines</h1>
      {/* Passe os dados incluídos para a lista */}
      <MinesGameList games={games} loading={loading} included={included} />
    </div>
  );
};

export default MinesGamesPage;