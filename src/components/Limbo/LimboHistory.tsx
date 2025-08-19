import React from 'react';
import type { LimboGame } from '../../types';

interface LimboHistoryProps {
  history: LimboGame[];
}

const LimboHistory: React.FC<LimboHistoryProps> = ({ history = [] }) => {
  return (
    <div className="bg-black/30 backdrop-blur-md border border-white/10 p-4 rounded-2xl">
      <h3 className="text-sm font-bold text-white mb-3">Últimas Jogadas</h3>
      <div className="flex flex-wrap gap-2">
        {history.length > 0 ? history.slice(0, 15).map(game => (
          <span
            key={game.id}
            className={`px-3 py-1 rounded-md text-xs font-mono font-semibold ${
              game.status === 'won' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
            }`}
          >
            {game.result_multiplier.toFixed(2)}x
          </span>
        )) : <p className="text-sm text-gray-400">Nenhuma jogada recente.</p>}
      </div>
    </div>
  );
};

export default LimboHistory;
