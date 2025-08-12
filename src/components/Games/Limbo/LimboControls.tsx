// src/components/Games/Limbo/LimboControls.tsx
import React, { useState } from 'react';

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
      alert("A aposta mínima é R$1,00");
      return;
    }
    if (targetMultiplier < 1.01) {
      alert("O multiplicador mínimo é 1.01x");
      return;
    }
    playGame(betInCents, targetMultiplier);
  };

  return (
    <div className="bg-[var(--surface-dark)] border border-[var(--border-color)] p-4 rounded-lg shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)]">Valor da Aposta (R$)</label>
          <input
            type="number"
            value={betAmount}
            onChange={(e) => setBetAmount(parseFloat(e.target.value))}
            className="w-full bg-[#2a2a2a] p-2 border border-[var(--border-color)] rounded-md mt-1"
            min="1"
            step="1"
            disabled={isLoading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)]">Multiplicador Alvo</label>
          <input
            type="number"
            value={targetMultiplier}
            onChange={(e) => setTargetMultiplier(parseFloat(e.target.value))}
            className="w-full bg-[#2a2a2a] p-2 border border-[var(--border-color)] rounded-md mt-1"
            min="1.01"
            step="0.01"
            disabled={isLoading}
          />
        </div>
        <div className="md:mt-6">
          <button
            onClick={handlePlay}
            disabled={isLoading}
            className="w-full h-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-gray-500"
          >
            {isLoading ? 'Aguarde...' : 'Jogar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LimboControls;
