import React from 'react';
import type { DoubleGameRound } from '../../types';
import { Diamond } from 'lucide-react';

interface DoubleHistoryProps {
  history: DoubleGameRound[];
}

const DoubleHistory: React.FC<DoubleHistoryProps> = ({ history }) => {
  const getColorClass = (color?: string) => {
    if (color === 'red') return 'bg-red-500';
    if (color === 'black') return 'bg-zinc-800';
    if (color === 'white') return 'bg-gray-200';
    return 'bg-gray-600';
  };

  return (
    <div className="mb-4">
      <h3 className="text-sm font-bold text-gray-400 mb-2">Últimos Resultados</h3>
      <div className="flex items-center gap-1.5">
        {history.slice(0, 20).map((round, index) => (
          <React.Fragment key={`${round.id}-${index}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${getColorClass(round.winning_color)}`}>
              {round.winning_color === 'white' && <Diamond size={12} className="text-black" />}
            </div>
            {index < history.slice(0, 20).length - 1 && (
              <div className="w-px h-3 bg-yellow-500/30" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default DoubleHistory;
