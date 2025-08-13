import React from 'react';
import type { TowerGame } from '../../../types';
import { motion } from 'framer-motion';
import { User, CheckCircle2, XCircle } from 'lucide-react';

interface TowerGameListProps {
  games: TowerGame[];
  loading: boolean;
}

const TowerGameList: React.FC<TowerGameListProps> = ({ games, loading }) => {
  const formatCurrency = (balanceInCents: number) => {
    return (balanceInCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'cashed_out':
        return { label: 'Ganhou', icon: <CheckCircle2 size={14} />, className: 'text-green-400 bg-green-500/10' };
      case 'lost':
        return { label: 'Perdeu', icon: <XCircle size={14} />, className: 'text-red-400 bg-red-500/10' };
      default:
        return { label: status, icon: null, className: 'text-gray-400 bg-gray-500/10' };
    }
  };

  if (loading) return <div className="text-center text-gray-400 py-12">A carregar jogos...</div>;
  if (games.length === 0) return <div className="text-center text-gray-400 py-12">Nenhum jogo Tower encontrado.</div>;

  return (
    <div className="space-y-4">
      {games.map((game, index) => {
        const statusInfo = getStatusLabel(game.status);
        const hasWon = game.winnings_in_cents > 0;
        return (
          <motion.div
            key={game.id}
            className="bg-white/5 p-4 rounded-lg border border-white/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 text-sm items-center">
              <div className="lg:col-span-2">
                <p className="text-xs text-gray-400 flex items-center gap-1"><User size={12}/> Utilizador</p>
                <p className="font-medium text-white truncate">{game.user?.full_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Aposta</p>
                <p className="font-semibold text-gray-300">{formatCurrency(game.bet_amount_in_cents)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Ganhos</p>
                <p className={`font-semibold ${hasWon ? 'text-green-400' : 'text-gray-400'}`}>{formatCurrency(game.winnings_in_cents)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Status</p>
                <div className={`flex items-center gap-2 text-xs font-semibold px-2 py-1 rounded-full ${statusInfo.className}`}>
                    {statusInfo.icon}
                    <span>{statusInfo.label}</span>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default TowerGameList;
