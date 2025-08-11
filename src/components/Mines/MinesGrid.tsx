import React, { useEffect, useRef } from 'react';
import { Diamond, Bomb } from 'lucide-react';
import type { RevealedTile, TileValue } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';

interface MinesGridProps {
  onTileClick: (row: number, col: number) => void;
  revealedTiles: RevealedTile[];
  finalGrid?: TileValue[][];
  gameState: 'active' | 'busted' | 'cashed_out' | 'idle';
  isLoading: boolean;
}

const MinesGrid: React.FC<MinesGridProps> = ({ onTileClick, revealedTiles, finalGrid, gameState, isLoading }) => {
  const isGameOver = gameState === 'busted' || gameState === 'cashed_out';
  
  const explosionAudioRef = useRef<HTMLAudioElement | null>(null);

  const tileVariants = {
    hidden: { scale: 0.5, opacity: 0 },
    visible: { scale: 1, opacity: 1 },
  };

  useEffect(() => {
    explosionAudioRef.current = new Audio('/sounds/explosion.mp3');
    explosionAudioRef.current.preload = 'auto';
  }, []);

  useEffect(() => {
    if (gameState === 'busted') {
      explosionAudioRef.current?.play().catch(e => console.error("Erro ao tocar o som:", e));
    }
  }, [gameState]);

  return (
    <div className="grid grid-cols-5 gap-2 p-4 bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl w-full max-w-lg mx-auto">
      {Array.from({ length: 25 }).map((_, index) => {
        const row = Math.floor(index / 5);
        const col = index % 5;

        const revealed = revealedTiles.some(tile => tile.row === row && tile.col === col);
        const isDisabled = isGameOver || revealed || isLoading || gameState === 'idle';

        let content = null;
        let tileClass = 'bg-zinc-800/50 hover:bg-zinc-700/70';

        if (isGameOver && finalGrid) {
          if (finalGrid[row][col] === 'diamond') {
            tileClass = 'bg-cyan-500/10';
            content = <Diamond className="w-2/3 h-2/3 text-cyan-400" />;
          } else {
            tileClass = 'bg-red-500/10';
            content = <Bomb className="w-2/3 h-2/3 text-red-500" />;
          }
        } else if (revealed) {
          tileClass = 'bg-cyan-500/10';
          content = <Diamond className="w-2/3 h-2/3 text-cyan-400" />;
        }

        return (
          <motion.button
            key={index}
            onClick={() => onTileClick(row, col)}
            disabled={isDisabled}
            className={`aspect-square rounded-lg flex items-center justify-center transition-colors duration-200 disabled:cursor-not-allowed ${tileClass}`}
            whileHover={{ scale: isDisabled ? 1 : 1.05 }}
            whileTap={{ scale: isDisabled ? 1 : 0.95 }}
          >
            <AnimatePresence>
              {content && (
                <motion.div
                  variants={tileVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                >
                  {content}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        );
      })}
    </div>
  );
};

export default MinesGrid;
