// src/components/Games/Tower/TowerMultipliers.tsx
import React from 'react';
import type { TowerGame } from '../../types';
import type { TowerConfig } from '../../hooks/useTowerGame';

interface TowerMultipliersProps {
  game: TowerGame | null;
  config: TowerConfig | null;
}

const TowerMultipliers: React.FC<TowerMultipliersProps> = ({ game, config }) => {
  if (!config) return null; // Não renderiza nada se a config não estiver carregada

  const difficulty = game?.difficulty || 'easy';
  const multipliers = config[difficulty as keyof typeof config].multipliers;

  return (
    <div className="bg-[var(--surface-dark)] border border-[var(--border-color)] p-4 rounded-lg shadow-lg h-full">
      <h2 className="text-xl font-bold text-center text-[var(--primary-gold)] mb-4">Multiplicadores</h2>
      <div className="space-y-1">
        {multipliers.slice().reverse().map((multiplier, index) => {
          const level = multipliers.length - index;
          const isActive = game?.current_level === level;
          const isCompleted = game ? level <= game.current_level : false;

          let itemClass = "flex justify-between items-center p-2 rounded-md transition-all duration-300 ";
          if (isActive) {
            itemClass += "bg-yellow-500 text-black scale-105 shadow-lg";
          } else if (isCompleted) {
            itemClass += "bg-green-800 bg-opacity-50 text-green-300";
          } else {
            itemClass += "bg-[#2a2a2a] text-[var(--text-secondary)]";
          }

          return (
            <div key={level} className={itemClass}>
              <span className="font-bold text-sm">Nível {level}</span>
              <span className="font-mono text-sm">{multiplier.toFixed(2)}x</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TowerMultipliers;
