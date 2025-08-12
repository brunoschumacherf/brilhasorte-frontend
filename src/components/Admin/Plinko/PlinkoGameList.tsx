import React from 'react';
import type { AdminPlinkoGameListItem, JsonApiData } from '../../../types';
import { motion } from 'framer-motion';
import { User, BarChart, TrendingUp, Calendar } from 'lucide-react';

interface PlinkoGameListProps {
  games: JsonApiData<AdminPlinkoGameListItem>[];
  loading: boolean;
  included: any[];
}

const PlinkoGameList: React.FC<PlinkoGameListProps> = ({ games, loading, included }) => {
  const formatCurrency = (valueInCents: number) => {
    return (valueInCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const findUserEmail = (relationship: { data: { id: string; type: string } } | undefined) => {
    if (!relationship?.data) return 'N/A';
    const user = included?.find(item => item.type === 'user' && item.id === relationship.data.id);
    return user?.attributes?.email || 'N/A';
  };

  const getRiskLabel = (risk: string) => {
    const riskMap: { [key: string]: { label: string, className: string } } = {
      low: { label: 'Baixo', className: 'text-blue-400 bg-blue-500/10' },
      medium: { label: 'Médio', className: 'text-yellow-400 bg-yellow-500/10' },
      high: { label: 'Alto', className: 'text-red-400 bg-red-500/10' },
    };
    return riskMap[risk] || { label: risk, className: 'text-gray-400 bg-gray-500/10' };
  };

  if (loading) return <div className="text-center text-gray-400 py-12">A carregar jogos...</div>;
  if (games.length === 0) return <div className="text-center text-gray-400 py-12">Nenhum jogo Plinko encontrado.</div>;

  return (
    <div className="space-y-4">
      {games.map((game, index) => {
        const { attributes, relationships } = game;
        const riskInfo = getRiskLabel(attributes.risk);
        const hasWon = attributes.winnings > 0;
        return (
          <motion.div
            key={game.id}
            className="bg-white/5 p-4 rounded-lg border border-white/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm items-center">
              <div>
                <p className="text-xs text-gray-400 flex items-center gap-1"><User size={12}/> Utilizador</p>
                <p className="font-medium text-white truncate">{findUserEmail(relationships.user)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Aposta</p>
                <p className="font-semibold text-gray-300">{formatCurrency(attributes.bet_amount)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Prémio</p>
                <p className={`font-semibold ${hasWon ? 'text-green-400' : 'text-gray-400'}`}>{formatCurrency(attributes.winnings)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 flex items-center gap-1"><BarChart size={12}/> Linhas / Risco</p>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white">{attributes.rows}</span>
                  <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${riskInfo.className}`}>{riskInfo.label}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 flex items-center gap-1"><TrendingUp size={12}/> Multiplicador</p>
                <p className="font-medium text-white">{attributes.multiplier}x</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 flex items-center gap-1"><Calendar size={12}/> Data</p>
                <p className="text-gray-300">{new Date(attributes.created_at).toLocaleString('pt-BR')}</p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default PlinkoGameList;
