import React from 'react';
import { Diamond, Bomb } from 'lucide-react';
import type { RevealedTile, TileValue } from '../../types';

interface MinesGridProps {
  onTileClick: (row: number, col: number) => void;
  revealedTiles: RevealedTile[];
  finalGrid?: TileValue[][]; // Grid final após o jogo acabar
  gameState: 'active' | 'busted' | 'cashed_out' | 'idle';
  isLoading: boolean;
}

const MinesGrid: React.FC<MinesGridProps> = ({ onTileClick, revealedTiles, finalGrid, gameState, isLoading }) => {
  const isRevealed = (row: number, col: number) => {
    return revealedTiles.some(tile => tile.row === row && tile.col === col);
  };

  return (
    <div className="grid grid-cols-5 gap-2 p-4 bg-black/20 rounded-lg">
      {Array.from({ length: 25 }).map((_, index) => {
        const row = Math.floor(index / 5);
        const col = index % 5;
        const revealed = isRevealed(row, col);
        const isBusted = gameState === 'busted';

        let content = null;
        let tileClass = 'bg-gray-700 hover:bg-gray-600';
        
        if ((revealed && !isBusted) || (isBusted && finalGrid && finalGrid[row][col] === 'diamond')) {
          tileClass = 'bg-green-500/20';
          content = <Diamond className="w-8 h-8 text-cyan-400" />;
        } else if (isBusted && finalGrid && finalGrid[row][col] === 'mine') {
           tileClass = 'bg-red-500/20';
           content = <Bomb className="w-8 h-8 text-red-500" />;
        }

        return (
          <button
            key={index}
            onClick={() => onTileClick(row, col)}
            disabled={revealed || isBusted || isLoading || gameState === 'idle'}
            className={`w-20 h-20 rounded-md flex items-center justify-center transition-all duration-300 transform-gpu ${tileClass} disabled:cursor-not-allowed`}
          >
            {content}
          </button>
        );
      })}
    </div>
  );
};

export default MinesGrid;