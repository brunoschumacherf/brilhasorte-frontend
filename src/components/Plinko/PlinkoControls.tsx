import React from 'react';
import { motion } from 'framer-motion';

type RiskLevel = 'low' | 'medium' | 'high';

interface PlinkoControlsProps {
  betAmount: number;
  setBetAmount: (amount: number) => void;
  rows: number;
  setRows: (rows: number) => void;
  risk: RiskLevel;
  setRisk: (risk: RiskLevel) => void;
  onPlay: () => void;
  isAnimating: boolean;
}

const riskOptions: { value: RiskLevel, label: string }[] = [
  { value: 'low', label: 'Baixo' },
  { value: 'medium', label: 'Médio' },
  { value: 'high', label: 'Alto' },
];

const rowOptions = [8, 9, 10, 11, 12, 13, 14, 15, 16];

const PlinkoControls: React.FC<PlinkoControlsProps> = ({
  betAmount, setBetAmount, rows, setRows, risk, setRisk, onPlay, isAnimating
}) => {
  
  const handleBetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
        setBetAmount(0);
    } else if (!isNaN(parseFloat(value))) {
        setBetAmount(parseFloat(value));
    }
  };

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
                disabled={isAnimating}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2 px-3 text-white transition-colors focus:border-yellow-500 focus:ring-yellow-500 focus:outline-none disabled:opacity-50"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <button onClick={() => setBetAmount(betAmount / 2)} disabled={isAnimating} className="px-2 py-0.5 bg-white/5 rounded text-xs hover:bg-white/10 disabled:opacity-50">½</button>
                <button onClick={() => setBetAmount(betAmount * 2)} disabled={isAnimating} className="px-2 py-0.5 bg-white/5 rounded text-xs hover:bg-white/10 disabled:opacity-50">2x</button>
            </div>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1">Linhas</label>
        <select
          value={rows}
          onChange={(e) => setRows(parseInt(e.target.value))}
          disabled={isAnimating}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2 px-3 text-white transition-colors focus:border-yellow-500 focus:ring-yellow-500 focus:outline-none disabled:opacity-50"
        >
          {rowOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1">Risco</label>
        <div className="flex bg-black/20 p-1 rounded-full border border-white/10">
          {riskOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => setRisk(opt.value)}
              disabled={isAnimating}
              className={`w-full px-4 py-2 text-sm font-semibold rounded-full transition-colors relative disabled:opacity-50 ${risk === opt.value ? 'text-black' : 'text-gray-300 hover:bg-white/5'}`}
            >
              {risk === opt.value && (
                <motion.div
                  layoutId="active-plinko-risk"
                  className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
      <motion.button 
        onClick={onPlay} 
        disabled={isAnimating || betAmount <= 0} 
        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isAnimating ? 'Aguarde...' : 'Jogar'}
      </motion.button>
    </div>
  );
};

export default PlinkoControls;
