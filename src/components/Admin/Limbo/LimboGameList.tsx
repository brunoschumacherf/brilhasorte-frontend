import React from 'react';
import type { AdminGameListItem, JsonApiData } from '../../../types';
import { motion } from 'framer-motion';
import { User, Target, CheckCircle2, XCircle, Calendar } from 'lucide-react';

interface LimboGameListProps {
  games: JsonApiData<AdminGameListItem>[];
  loading: boolean;
  included: any[];
}

const LimboGameList: React.FC<LimboGameListProps> = ({ games, loading, included }) => {
  const formatCurrency = (balanceInCents: number) => {
    return (balanceInCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const findUserEmail = (relationship: { data: { id: string; type: string } } | undefined) => {
    if (!relationship?.data) return 'N/A';
    const user = included?.find(item => item.type === 'user' && item.id === relationship.data.id);
    return user?.attributes?.email || 'N/A';
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'won':
        return { label: 'Ganhou', icon: <CheckCircle2 size={14} />, className: 'text-green-400 bg-green-500/10' };
      case 'lost':
        return { label: 'Perdeu', icon: <XCircle size={14} />, className: 'text-red-400 bg-red-500/10' };
      default:
        return { label: status, icon: null, className: 'text-gray-400 bg-gray-500/10' };
    }
  };

  if (loading) return <div className="text-center text-gray-400 py-12">A carregar jogos...</div>;
  if (games.length === 0) return <div className="text-center text-gray-400 py-12">Nenhum jogo Limbo encontrado.</div>;

  return (
    <div className="space-y-4">
      {games.map((game, index) => {
        const { attributes, relationships } = game;
        const statusInfo = getStatusLabel(attributes.status);
        const hasWon = attributes.winnings_in_cents > 0;
        return (
          <motion.div
            key={game.id}
            className="bg-white/5 p-4 rounded-lg border border-white/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 text-sm items-center">
              <div className="lg:col-span-2">
                <p className="text-xs text-gray-400 flex items-center gap-1"><User size={12}/> Utilizador</p>
                <p className="font-medium text-white truncate">{findUserEmail(relationships.user)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Aposta</p>
                <p className="font-semibold text-gray-300">{formatCurrency(attributes.bet_amount_in_cents)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Ganhos</p>
                <p className={`font-semibold ${hasWon ? 'text-green-400' : 'text-gray-400'}`}>{formatCurrency(attributes.winnings_in_cents)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 flex items-center gap-1"><Target size={12}/> Alvo / Resultado</p>
                <p className="font-medium text-white">{attributes.target_multiplier}x / <span className={hasWon ? 'text-green-400' : 'text-red-400'}>{attributes.result_multiplier}x</span></p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Status</p>
                <div className={`flex items-center gap-2 text-xs font-semibold px-2 py-1 rounded-full ${statusInfo.className}`}>
                    {statusInfo.icon}
                    <span>{statusInfo.label}</span>
                </div>
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

export default LimboGameList;
