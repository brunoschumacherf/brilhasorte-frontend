import React from 'react';
import { Diamond, Bomb } from 'lucide-react';
import type { RevealedTile, TileValue } from '../../types';

interface MinesGridProps {
  onTileClick: (row: number, col: number) => void;
  revealedTiles: RevealedTile[];
  finalGrid?: TileValue[][];
  gameState: 'active' | 'busted' | 'cashed_out' | 'idle';
  isLoading: boolean;
}

const MinesGrid: React.FC<MinesGridProps> = ({ onTileClick, revealedTiles, finalGrid, gameState, isLoading }) => {
  const isGameOver = gameState === 'busted' || gameState === 'cashed_out';

  return (
    <div className="grid grid-cols-5 gap-1 sm:gap-2 p-2 sm:p-4 bg-black/20 rounded-lg w-full max-w-md mx-auto">
      {Array.from({ length: 25 }).map((_, index) => {
        const row = Math.floor(index / 5);
        const col = index % 5;

        let content = null;
        let tileClass = 'bg-gray-700 hover:bg-gray-600';
        if (isGameOver && finalGrid) {
          if (finalGrid[row][col] === 'diamond') {
            tileClass = 'bg-green-500/20';
            content = <Diamond className="w-1/2 h-1/2 text-cyan-400" />;
          } else {
            tileClass = 'bg-red-500/20';
            content = <Bomb className="w-1/2 h-1/2 text-red-500" />;
          }
        } else if (revealedTiles.some(tile => tile.row === row && tile.col === col)) {
          tileClass = 'bg-green-500/20';
          content = <Diamond className="w-1/2 h-1/2 text-cyan-400" />;
        }

        const revealed = revealedTiles.some(tile => tile.row === row && tile.col === col);
        const isDisabled = isGameOver || revealed || isLoading || gameState === 'idle';

        return (
          <button
            key={index}
            onClick={() => onTileClick(row, col)}
            disabled={isDisabled}
            className={`aspect-square rounded-md flex items-center justify-center transition-all duration-300 transform-gpu ${tileClass} disabled:cursor-not-allowed`}
          >
            {content}
          </button>
        );
      })}
    </div>
  );
};

export default MinesGrid;