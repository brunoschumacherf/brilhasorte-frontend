// src/components/Games/Tower/TowerGameBoard.tsx
import React from 'react';
import type { TowerGame } from '../../types';
import type { TowerConfig } from '../../hooks/useTowerGame';

interface TowerGameBoardProps {
  game: TowerGame | null;
  config: TowerConfig | null;
  makePlay: (choiceIndex: number) => void;
  isLoading: boolean;
}

const TowerGameBoard: React.FC<TowerGameBoardProps> = ({ game, config, makePlay, isLoading }) => {
  if (!config) {
    return (
        <div className="bg-[var(--surface-dark)] border border-[var(--border-color)] p-4 rounded-lg shadow-lg flex-grow flex items-center justify-center">
            <p className="text-white">Carregando configurações...</p>
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
    let content = '❔';

    if (isRevealed) {
      cellClass += revealedItem === 'bomb' ? 'bg-red-500 animate-pulse' : 'bg-green-500';
      content = revealedItem === 'bomb' ? '💣' : '💎';
    } else if (hasBeenChosen) {
      cellClass += 'bg-green-700';
      content = '💎';
    } else if (isCurrentLevel) {
      cellClass += isClickable ? 'bg-blue-600 hover:bg-blue-500 cursor-pointer' : 'bg-gray-600';
    } else {
      cellClass += 'bg-[#2a2a2a]';
    }

    return (
      <div key={cellIndex} className={cellClass} onClick={() => isClickable && makePlay(cellIndex)}>
        <span className="text-4xl">{content}</span>
      </div>
    );
  };

  return (
    <div className="relative bg-[var(--surface-dark)] border border-[var(--border-color)] p-4 rounded-lg shadow-lg flex-grow">
      <div className="flex flex-col-reverse items-center gap-2">
        {levels.map(level => (
          <div key={level} className="flex gap-2">
            {Array.from({ length: gameConfig.options_per_level }).map((_, cellIndex) => renderCell(level, cellIndex))}
          </div>
        ))}
      </div>
      {!game && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
            <p className="text-2xl font-bold text-white text-center">Configure sua aposta para começar!</p>
        </div>
      )}
    </div>
  );
};

export default TowerGameBoard;
