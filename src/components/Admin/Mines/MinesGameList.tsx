import React from 'react';
import type { AdminMinesGameListItem, JsonApiData } from '../../../types';
import { motion } from 'framer-motion';
import { User, Bomb, TrendingUp, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface MinesGameListProps {
  games: JsonApiData<AdminMinesGameListItem>[];
  loading: boolean;
  included: any[];
}

const MinesGameList: React.FC<MinesGameListProps> = ({ games, loading, included }) => {
  const formatCurrency = (balanceInCents: number) => {
    return (balanceInCents / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const findUserEmail = (relationship: { data: { id: string; type: string } } | undefined) => {
    if (!relationship?.data) return 'N/A';
    const user = included.find(item => item.id === relationship.data.id && item.type === 'user');
    return user?.attributes?.email || 'N/A';
  };

  const getStateLabel = (state: string) => {
    switch (state) {
      case 'active':
        return { label: 'Ativo', icon: <Clock size={14} />, className: 'text-yellow-400 bg-yellow-500/10' };
      case 'busted':
        return { label: 'Perdeu', icon: <XCircle size={14} />, className: 'text-red-400 bg-red-500/10' };
      case 'cashed_out':
        return { label: 'Ganhou', icon: <CheckCircle2 size={14} />, className: 'text-green-400 bg-green-500/10' };
      default:
        return { label: state, icon: null, className: 'text-gray-400 bg-gray-500/10' };
    }
  };

  if (loading) return <div className="text-center text-gray-400 py-12">A carregar jogos...</div>;
  if (games.length === 0) return <div className="text-center text-gray-400 py-12">Nenhum jogo Mines encontrado.</div>;

  return (
    <div className="space-y-4">
      {games.map((game, index) => {
        const { attributes, relationships } = game;
        const stateInfo = getStateLabel(attributes.state);
        return (
          <motion.div
            key={game.id}
            className="bg-white/5 p-4 rounded-lg border border-white/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm items-center">
              <div className="lg:col-span-2">
                <p className="text-xs text-gray-400 flex items-center gap-1"><User size={12}/> Utilizador</p>
                <p className="font-medium text-white truncate">{findUserEmail(relationships.user)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Aposta</p>
                <p className="font-semibold text-gray-300">{formatCurrency(attributes.bet_amount)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 flex items-center gap-1"><Bomb size={12}/> Minas</p>
                <p className="font-medium text-white">{attributes.mines_count}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 flex items-center gap-1"><TrendingUp size={12}/> Multiplicador</p>
                <p className="font-medium text-white">{attributes.payout_multiplier}x</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Estado</p>
                <div className={`flex items-center gap-2 text-xs font-semibold px-2 py-1 rounded-full ${stateInfo.className}`}>
                    {stateInfo.icon}
                    <span>{stateInfo.label}</span>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default MinesGameList;
