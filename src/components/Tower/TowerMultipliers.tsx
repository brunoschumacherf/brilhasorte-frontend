import React from 'react';
import type { TowerGame } from '../../types';
import type { TowerConfig } from '../../hooks/useTowerGame';
import { motion } from 'framer-motion';

interface TowerMultipliersProps {
  game: TowerGame | null;
  config: TowerConfig | null;
}

const TowerMultipliers: React.FC<TowerMultipliersProps> = ({ game, config }) => {
  if (!config) return null;

  const difficulty = game?.difficulty || 'easy';
  const multipliers = config[difficulty as keyof typeof config].multipliers;

  return (
    <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-6 h-full">
      <h2 className="text-xl font-bold text-center text-white mb-4">Multiplicadores</h2>
      <div className="space-y-1.5">
        {multipliers.slice().reverse().map((multiplier, index) => {
          const level = multipliers.length - index;
          const isActive = game?.current_level === level;
          const isCompleted = game ? level <= game.current_level : false;

          return (
            <motion.div 
              key={level} 
              className="flex justify-between items-center p-2 rounded-md transition-all duration-300"
              animate={{
                scale: isActive ? 1.05 : 1,
                backgroundColor: isActive ? 'rgba(234, 179, 8, 0.8)' : isCompleted ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                color: isActive ? '#000' : isCompleted ? '#34D399' : '#A1A1AA',
              }}
            >
              <span className="font-bold text-sm">Nível {level}</span>
              <span className="font-mono text-sm">{multiplier.toFixed(2)}x</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default TowerMultipliers;
