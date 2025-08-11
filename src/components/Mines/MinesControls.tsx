// src/components/Mines/MinesControls.tsx

import React from 'react';

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
    if (value === '' || !isNaN(parseFloat(value))) {
      setBetAmount(parseFloat(value) || 0);
    }
  };

  const isGameActive = gameState === 'active';
  const isIdle = !isGameActive;
  
  const potentialWinnings = (betAmount * parseFloat(payout)).toFixed(2);

  return (
    <div className="w-full lg:w-96 p-4 bg-black/20 rounded-lg flex flex-col gap-4 text-white">
      <div>
        <label className="block text-sm font-medium text-gray-300">Valor da Aposta (R$)</label>
        <input
          type="number"
          step="0.01"
          value={betAmount}
          onChange={handleBetChange}
          disabled={isGameActive || isLoading}
          className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm p-2 focus:ring-[var(--primary-gold)] focus:border-[var(--primary-gold)]"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300">Número de Minas</label>
        <input
          type="number"
          value={minesCount}
          onChange={(e) => setMinesCount(parseInt(e.target.value))}
          disabled={isGameActive || isLoading}
          min="1"
          max="24"
          className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm p-2 focus:ring-[var(--primary-gold)] focus:border-[var(--primary-gold)]"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 text-center bg-gray-800/50 p-3 rounded-lg">
        <div>
          <p className="text-xs text-gray-400">Próximo Multiplicador</p>
          <p className="text-xl font-bold text-cyan-400">{isGameActive ? `${nextPayout}x` : '-'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Ganhos Potenciais</p>
          <p className="text-xl font-bold text-green-400">R$ {isGameActive ? potentialWinnings : '0.00'}</p>
        </div>
      </div>

      {isIdle ? (
        <button onClick={onStartGame} disabled={isLoading || betAmount <= 0} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-md transition-all disabled:bg-gray-500 disabled:cursor-not-allowed">
          {isLoading ? 'Iniciando...' : 'Começar Jogo'}
        </button>
      ) : (
        <button onClick={onCashout} disabled={isLoading} className="w-full bg-[var(--primary-gold)] hover:opacity-90 text-black font-bold py-3 rounded-md transition-all disabled:bg-gray-500">
          {isLoading ? 'Processando...' : `Retirar R$ ${potentialWinnings}`}
        </button>
      )}
    </div>
  );
};

export default MinesControls;