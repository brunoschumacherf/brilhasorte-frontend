import React, { useMemo } from 'react';
import type { DoubleGameBet } from '../../types';

interface DoubleBetsListProps {
  bets: DoubleGameBet[];
  color: 'black' | 'red' | 'white';
  title: string;
}

const BetRow: React.FC<{ bet: DoubleGameBet }> = ({ bet }) => (
  <div className="flex justify-between items-center text-sm py-1">
    <span className="text-gray-300 truncate">{bet.user.full_name}</span>
    <span className="font-mono text-white font-semibold">R$ {(bet.bet_amount_in_cents / 100).toFixed(2)}</span>
  </div>
);

const DoubleBetsList: React.FC<DoubleBetsListProps> = ({ bets, color, title }) => {
  const filteredBets = useMemo(() => {
    return bets
      .filter(bet => bet.color === color)
      .sort((a, b) => b.bet_amount_in_cents - a.bet_amount_in_cents);
  }, [bets, color]);

  const totalAmount = useMemo(() => {
    return filteredBets.reduce((sum, bet) => sum + bet.bet_amount_in_cents, 0);
  }, [filteredBets]);

  const colorClasses = {
    red: 'border-red-500',
    black: 'border-zinc-600',
    white: 'border-gray-200',
  };

  return (
    <div className={`bg-black/30 backdrop-blur-md border-t-4 ${colorClasses[color]} p-4 rounded-2xl shadow-lg`}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-white">{title} ({filteredBets.length})</h3>
        <span className="text-sm font-mono text-yellow-400">
          R$ {(totalAmount / 100).toFixed(2)}
        </span>
      </div>
      <div className="space-y-1 max-h-48 overflow-y-auto pr-2">
        {filteredBets.length > 0 ? (
          filteredBets.map(bet => <BetRow key={bet.id} bet={bet} />)
        ) : (
          <p className="text-xs text-center text-gray-500 pt-10">Nenhuma aposta ainda.</p>
        )}
      </div>
    </div>
  );
};

export default DoubleBetsList;
