import React, { useState } from 'react';
import { placeDoubleBet } from '../../services/api';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

interface DoubleControlsProps {
  isBettingPhase: boolean;
}

const DoubleControls: React.FC<DoubleControlsProps> = ({ isBettingPhase }) => {
  const [betAmount, setBetAmount] = useState(1.00);
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);

  const handlePlaceBet = async (color: 'black' | 'red' | 'white') => {
    const betInCents = Math.round(betAmount * 100);
    if (betInCents < 100) {
      toast.warn("A aposta mínima é R$1,00");
      return;
    }
    setIsSubmitting(color);
    try {
      await placeDoubleBet(betInCents, color);
      toast.success(`Aposta de R$${betAmount.toFixed(2)} feita no ${color}!`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Não foi possível fazer a aposta.");
    } finally {
      setIsSubmitting(null);
    }
  };
  
  const handleBetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
        setBetAmount(0);
    } else if (!isNaN(parseFloat(value))) {
        setBetAmount(parseFloat(value));
    }
  };

  const isButtonDisabled = !isBettingPhase || isSubmitting !== null;

  return (
    <div className="bg-black/30 backdrop-blur-md border border-white/10 p-6 rounded-2xl">
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-400 mb-1">Valor da Aposta (R$)</label>
        <div className="relative">
            <input
                type="number"
                step="0.01"
                value={betAmount === 0 ? '' : betAmount}
                onChange={handleBetChange}
                disabled={!isBettingPhase}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2 px-3 text-white transition-colors focus:border-yellow-500 focus:ring-yellow-500 focus:outline-none disabled:opacity-50"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <button onClick={() => setBetAmount(betAmount / 2)} disabled={!isBettingPhase} className="px-2 py-0.5 bg-white/5 rounded text-xs hover:bg-white/10 disabled:opacity-50">½</button>
                <button onClick={() => setBetAmount(betAmount * 2)} disabled={!isBettingPhase} className="px-2 py-0.5 bg-white/5 rounded text-xs hover:bg-white/10 disabled:opacity-50">2x</button>
            </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <motion.button onClick={() => handlePlaceBet('red')} disabled={isButtonDisabled} className="py-3 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold flex flex-col items-center" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <span>Vermelho</span>
            <span className="text-xs">2x</span>
        </motion.button>
        <motion.button onClick={() => handlePlaceBet('white')} disabled={isButtonDisabled} className="py-3 rounded-lg bg-gradient-to-br from-white to-gray-300 hover:opacity-90 disabled:opacity-50 text-black font-bold flex flex-col items-center" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <span>Branco</span>
            <span className="text-xs">14x</span>
        </motion.button>
        <motion.button onClick={() => handlePlaceBet('black')} disabled={isButtonDisabled} className="py-3 rounded-lg bg-zinc-700 hover:bg-zinc-800 disabled:opacity-50 text-white font-bold flex flex-col items-center" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <span>Preto</span>
            <span className="text-xs">2x</span>
        </motion.button>
      </div>
    </div>
  );
};

export default DoubleControls;
