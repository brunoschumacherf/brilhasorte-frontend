import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

interface LimboControlsProps {
  playGame: (betInCents: number, targetMultiplier: number) => void;
  isLoading: boolean;
}

const LimboControls: React.FC<LimboControlsProps> = ({ playGame, isLoading }) => {
  const [betAmount, setBetAmount] = useState(1.00);
  const [targetMultiplier, setTargetMultiplier] = useState(2.00);

  const handlePlay = () => {
    const betInCents = Math.round(betAmount * 100);
    if (betInCents < 100) {
      toast.error("A aposta mínima é R$1,00");
      return;
    }
    if (targetMultiplier < 1.01) {
      toast.error("O multiplicador mínimo é 1.01x");
      return;
    }
    playGame(betInCents, targetMultiplier);
  };

  const handleBetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
        setBetAmount(0);
    } else if (!isNaN(parseFloat(value))) {
        setBetAmount(parseFloat(value));
    }
  };
  
  const handleMultiplierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
        setTargetMultiplier(0);
    } else if (!isNaN(parseFloat(value))) {
        setTargetMultiplier(parseFloat(value));
    }
  };

  return (
    <div className="w-full lg:w-96 p-6 bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl flex flex-col gap-6 text-white">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Valor da Aposta (R$)</label>
          <div className="relative">
              <input
                  type="number"
                  step="0.01"
                  value={betAmount === 0 ? '' : betAmount}
                  onChange={handleBetChange}
                  disabled={isLoading}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2 px-3 text-white transition-colors focus:border-yellow-500 focus:ring-yellow-500 focus:outline-none disabled:opacity-50"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                  <button onClick={() => setBetAmount(betAmount / 2)} disabled={isLoading} className="px-2 py-0.5 bg-white/5 rounded text-xs hover:bg-white/10 disabled:opacity-50">½</button>
                  <button onClick={() => setBetAmount(betAmount * 2)} disabled={isLoading} className="px-2 py-0.5 bg-white/5 rounded text-xs hover:bg-white/10 disabled:opacity-50">2x</button>
              </div>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Multiplicador Alvo</label>
          <div className="relative">
            <input
              type="number"
              value={targetMultiplier === 0 ? '' : targetMultiplier}
              onChange={handleMultiplierChange}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2 px-3 text-white transition-colors focus:border-yellow-500 focus:ring-yellow-500 focus:outline-none disabled:opacity-50"
              min="1.01"
              step="0.01"
              disabled={isLoading}
            />
          </div>
        </div>
      </div>
      <motion.button 
        onClick={handlePlay} 
        disabled={isLoading} 
        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isLoading ? 'Aguarde...' : 'Jogar'}
      </motion.button>
    </div>
  );
};

export default LimboControls;
