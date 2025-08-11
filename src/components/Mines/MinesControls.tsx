import React from 'react';
import { motion } from 'framer-motion';

interface MinesControlsProps {
  betAmount: number;
  setBetAmount: (amount: number) => void;
  minesCount: number;
  setMinesCount: (count: number) => void;
  onStartGame: () => void;
  onCashout: () => void;
  gameState: 'active' | 'busted' | 'cashed_out' | 'idle';
  isLoading: boolean;
  payout: string;
  nextPayout: string;
}

const MinesControls: React.FC<MinesControlsProps> = ({
  betAmount, setBetAmount, minesCount, setMinesCount,
  onStartGame, onCashout, gameState, isLoading, payout, nextPayout
}) => {
  
  const handleBetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
        setBetAmount(0);
    } else if (!isNaN(parseFloat(value))) {
        setBetAmount(parseFloat(value));
    }
  };

  const isGameActive = gameState === 'active';
  const isGameIdle = gameState === 'idle' || gameState === 'busted' || gameState === 'cashed_out';
  
  const potentialWinnings = (betAmount * parseFloat(payout)).toFixed(2);

  return (
    <div className="w-full lg:w-96 p-6 bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl flex flex-col gap-6 text-white">
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1">Valor da Aposta (R$)</label>
        <div className="relative">
            <input
                type="number"
                step="0.01"
                value={betAmount === 0 ? '' : betAmount}
                onChange={handleBetChange}
                disabled={isGameActive || isLoading}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2 px-3 text-white transition-colors focus:border-yellow-500 focus:ring-yellow-500 focus:outline-none disabled:opacity-50"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <button onClick={() => setBetAmount(betAmount / 2)} disabled={isGameActive || isLoading} className="px-2 py-0.5 bg-white/5 rounded text-xs hover:bg-white/10 disabled:opacity-50">½</button>
                <button onClick={() => setBetAmount(betAmount * 2)} disabled={isGameActive || isLoading} className="px-2 py-0.5 bg-white/5 rounded text-xs hover:bg-white/10 disabled:opacity-50">2x</button>
            </div>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1">Número de Minas ({minesCount})</label>
        <input
          type="range"
          value={minesCount}
          onChange={(e) => setMinesCount(parseInt(e.target.value))}
          disabled={isGameActive || isLoading}
          min="1"
          max="24"
          className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer range-lg accent-yellow-500 disabled:opacity-50"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 text-center bg-black/20 p-4 rounded-lg">
        <div>
          <p className="text-xs text-gray-400">Próximo Multiplicador</p>
          <p className="text-xl font-bold text-cyan-400">{isGameActive ? `${nextPayout}x` : '-'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Ganhos Atuais</p>
          <p className="text-xl font-bold text-green-400">R$ {isGameActive ? potentialWinnings : '0.00'}</p>
        </div>
      </div>

      {isGameIdle ? (
        <motion.button 
            onClick={onStartGame} 
            disabled={isLoading || betAmount <= 0} 
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
          {isLoading ? 'A iniciar...' : 'Começar Jogo'}
        </motion.button>
      ) : (
        <motion.button 
            onClick={onCashout} 
            disabled={isLoading} 
            className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold py-3 rounded-lg shadow-lg disabled:opacity-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
          {isLoading ? 'A processar...' : `Retirar R$ ${potentialWinnings}`}
        </motion.button>
      )}
    </div>
  );
};

export default MinesControls;
