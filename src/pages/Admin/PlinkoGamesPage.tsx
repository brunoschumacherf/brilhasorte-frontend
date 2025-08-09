import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getAdminPlinkoGameList } from '../../services/api';
import PlinkoGameList from '../../components/Admin/Plinko/PlinkoGameList';
import type { AdminPlinkoGameListItem } from '../../types';

const PlinkoGamesPage: React.FC = () => {
  const [games, setGames] = useState<AdminPlinkoGameListItem[]>([]);
  const [included, setIncluded] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await getAdminPlinkoGameList();
        setGames(response.data.data);
        setIncluded(response.data.included || []);
      } catch (error) {
        toast.error('Falha ao carregar o histórico de jogos do Plinko.');
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Histórico de Jogos - Plinko</h1>
      <PlinkoGameList games={games} loading={loading} included={included} />
    </div>
  );
};

export default PlinkoGamesPage;