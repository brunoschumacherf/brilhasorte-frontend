import React from 'react';
import type { TowerGame } from '../../types';
import type { TowerConfig } from '../../hooks/useTowerGame';
import { motion } from 'framer-motion';
import { Diamond, Bomb } from 'lucide-react';

interface TowerGameBoardProps {
  game: TowerGame | null;
  config: TowerConfig | null;
  makePlay: (choiceIndex: number) => void;
  isLoading: boolean;
}

const TowerGameBoard: React.FC<TowerGameBoardProps> = ({ game, config, makePlay, isLoading }) => {
  if (!config) {
    return (
        <div className="bg-black/30 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex-grow flex items-center justify-center">
            <p className="text-white">A carregar configurações...</p>
        </div>
    );
  }

  const gameConfig = config[game?.difficulty as keyof typeof config || 'easy'];
  const levels = Array.from({ length: gameConfig.total_levels }, (_, i) => i + 1).reverse();

  const renderCell = (level: number, cellIndex: number) => {
    const isCurrentLevel = game?.current_level === level - 1;
    const isClickable = isCurrentLevel && game?.status === 'active' && !isLoading;
    const hasBeenChosen = game?.player_choices[level - 1] === cellIndex;
    const isRevealed = game?.status === 'lost' && isCurrentLevel;
    const revealedItem = isRevealed ? game?.revealed_level?.[cellIndex] : null;

    let cellClass = "relative w-20 h-20 rounded-lg flex items-center justify-center transition-all duration-300 ";
    let content = null;

    if (isRevealed) {
      cellClass += revealedItem === 'bomb' ? 'bg-red-500/20' : 'bg-green-500/20';
      content = revealedItem === 'bomb' ? <Bomb className="w-10 h-10 text-red-500" /> : <Diamond className="w-10 h-10 text-cyan-400" />;
    } else if (hasBeenChosen) {
      cellClass += 'bg-green-500/20';
      content = <Diamond className="w-10 h-10 text-cyan-400" />;
    } else if (isCurrentLevel) {
      cellClass += isClickable ? 'bg-blue-600/50 hover:bg-blue-500/70 cursor-pointer' : 'bg-zinc-700/50';
    } else {
      cellClass += 'bg-zinc-800/50';
    }

    return (
      <motion.div 
        key={cellIndex} 
        className={cellClass} 
        onClick={() => isClickable && makePlay(cellIndex)}
        whileHover={{ scale: isClickable ? 1.05 : 1 }}
        whileTap={{ scale: isClickable ? 0.95 : 1 }}
      >
        {content}
      </motion.div>
    );
  };

  return (
    <div className="relative bg-black/30 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-lg flex-grow">
      <div className="flex flex-col-reverse items-center gap-2">
        {levels.map(level => (
          <div key={level} className="flex gap-2">
            {Array.from({ length: gameConfig.options_per_level }).map((_, cellIndex) => renderCell(level, cellIndex))}
          </div>
        ))}
      </div>
      {!game && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-2xl">
            <p className="text-2xl font-bold text-white text-center">Configure a sua aposta para começar!</p>
        </div>
      )}
    </div>
  );
};

export default TowerGameBoard;
