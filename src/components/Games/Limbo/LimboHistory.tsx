import React from 'react';
import type { LimboGame } from '../../../types';

interface LimboHistoryProps {
  history: LimboGame[];
}

const LimboHistory: React.FC<LimboHistoryProps> = ({ history }) => {
  return (
    <div className="bg-[var(--surface-dark)] border border-[var(--border-color)] p-4 rounded-lg shadow-lg">
      <h3 className="text-lg font-bold text-[var(--primary-gold)] mb-2">Últimas Jogadas</h3>
      <div className="flex flex-wrap gap-2">
        {history.length > 0 ? history.map(game => (
          <span
            key={game.id}
            className={`px-2 py-1 rounded-md text-sm font-mono ${
              game.status === 'won' ? 'bg-green-800 text-green-300' : 'bg-red-800 text-red-300'
            }`}
          >
            {game.result_multiplier.toFixed(2)}x
          </span>
        )) : <p className="text-sm text-[var(--text-secondary)]">Nenhuma jogada recente.</p>}
      </div>
    </div>
  );
};

export default LimboHistory;
