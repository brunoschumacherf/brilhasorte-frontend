import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getAdminDoubleGames } from '../../services/api';
import DoubleGameList from '../../components/Admin/Double/DoubleGameList';
import PaginationControls from '../../components/Shared/PaginationControls';
import type { DoubleGameRound, DoubleGameBet, User } from '../../types';
import { Layers } from 'lucide-react';

// --- Tipos e Função de Deserialização ---
interface JsonApiResourceIdentifier { id: string; type: string; }
interface JsonApiRelationship { data: JsonApiResourceIdentifier | JsonApiResourceIdentifier[] | null; }
interface JsonApiResource { id: string; type: string; attributes: any; relationships?: { [key: string]: JsonApiRelationship; }; }

const deserializeRounds = (response: any): DoubleGameRound[] => {
  const data = response?.data?.data;
  const included = response?.data?.included;
  if (!data || !Array.isArray(data)) return [];

  const includedMap = new Map<string, JsonApiResource>(included?.map((item: JsonApiResource) => [`${item.type}-${item.id}`, item]) || []);

  return data.map((roundRef: JsonApiResource): DoubleGameRound => {
    const betsData = roundRef.relationships?.bets?.data;
    const betsArray = Array.isArray(betsData) ? betsData : (betsData ? [betsData] : []);

    const bets = betsArray.map((betRef: JsonApiResourceIdentifier): DoubleGameBet | null => {
      const betObject = includedMap.get(`${betRef.type}-${betRef.id}`);
      if (!betObject) return null;

      const userRef = betObject.relationships?.user?.data as JsonApiResourceIdentifier | null;
      let user: Partial<User> = { full_name: 'Desconhecido' };

      if (userRef) {
        const userObject = includedMap.get(`${userRef.type}-${userRef.id}`);
        if (userObject) user = userObject.attributes;
      }
      
      return {
        ...betObject.attributes,
        id: parseInt(betObject.id, 10),
        winnings_in_cents: betObject.attributes.winnings_in_cents || 0,
        user: user,
      };
    }).filter((bet): bet is DoubleGameBet => bet !== null);

    return {
      ...roundRef.attributes,
      id: parseInt(roundRef.id, 10),
      bets,
    };
  });
};

const DoubleGamesPage: React.FC = () => {
  const [rounds, setRounds] = useState<DoubleGameRound[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedRound, setExpandedRound] = useState<number | null>(null);

  const fetchGames = async (page: number) => {
    setLoading(true);
    try {
      const response = await getAdminDoubleGames(page);
      setRounds(deserializeRounds(response));
      setTotalPages(parseInt(response.headers['total-pages'] || '1'));
      setCurrentPage(parseInt(response.headers['current-page'] || '1'));
    } catch (error) {
      toast.error('Falha ao carregar o histórico de jogos do Double.');
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
      setExpandedRound(null); // Fecha todos os acordeões ao mudar de página
    }
  };

  return (
    <div className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-3"><Layers /> Jogos Double</h1>
                <p className="text-sm text-gray-400 mt-1">Gira e monitorize todas as rodadas do Double.</p>
            </div>
        </div>

        <div className="bg-black/30 backdrop-blur-md border border-white/10 shadow-2xl rounded-2xl p-6">
            <DoubleGameList 
                rounds={rounds} 
                loading={loading} 
                expandedRound={expandedRound}
                setExpandedRound={setExpandedRound}
            />
            
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

export default DoubleGamesPage;
