import React from 'react';
import type { DoubleGameRound } from '../../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, TrendingUp, TrendingDown } from 'lucide-react';

interface DoubleGameListProps {
  rounds: DoubleGameRound[];
  loading: boolean;
  expandedRound: number | null;
  setExpandedRound: (id: number | null) => void;
}

const DoubleGameList: React.FC<DoubleGameListProps> = ({ rounds, loading, expandedRound, setExpandedRound }) => {

  const formatCurrency = (balanceInCents: number) => {
    return (balanceInCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const getColorClass = (color: string) => {
    if (color === 'red') return 'bg-red-500';
    if (color === 'black') return 'bg-zinc-600';
    if (color === 'white') return 'bg-white';
    return 'bg-gray-500';
  }

  if (loading) return <div className="text-center text-gray-400 py-12">A carregar rodadas...</div>;
  if (rounds.length === 0) return <div className="text-center text-gray-400 py-12">Nenhuma rodada do Double encontrada.</div>;

  return (
    <div className="space-y-4">
      {rounds.map((round, index) => {
        const isExpanded = expandedRound === round.id;
        return (
          <motion.div
            key={round.id}
            className="bg-white/5 rounded-lg border border-white/10 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <button 
              onClick={() => setExpandedRound(isExpanded ? null : round.id)}
              className="w-full p-4 text-left flex justify-between items-center hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-4">
                    {/* ✨ CORRIGIDO: Adicionado um valor padrão para evitar o erro de tipo */}
                    <div className={`w-4 h-4 rounded-full ${getColorClass(round.winning_color || '')}`}></div>
                    <div>
                        <p className="font-bold text-white">Rodada #{round.id}</p>
                        <p className="text-xs text-gray-400">{new Date(round.created_at).toLocaleString('pt-BR')}</p>
                    </div>
                </div>
                <ChevronDown className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
            
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 border-t border-white/10">
                    {round.bets.length > 0 ? (
                      <ul className="space-y-2">
                        {round.bets.map(bet => (
                          <li key={bet.id} className="text-sm flex justify-between items-center">
                            <span className="text-gray-300">{bet.user.full_name || 'Utilizador sem nome'} apostou {formatCurrency(bet.bet_amount_in_cents)} no <span className={`font-bold ${bet.color === 'white' ? 'text-white' : `text-${bet.color}-400`}`}>{bet.color}</span></span>
                            {bet.status === 'won' ? (
                                <span className="font-semibold text-green-400 flex items-center gap-1"><TrendingUp size={14}/> +{formatCurrency(bet.winnings_in_cents)}</span>
                            ) : (
                                <span className="font-semibold text-red-400 flex items-center gap-1"><TrendingDown size={14}/> -{formatCurrency(bet.bet_amount_in_cents)}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500 text-center">Nenhuma aposta nesta rodada.</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
};

export default DoubleGameList;
