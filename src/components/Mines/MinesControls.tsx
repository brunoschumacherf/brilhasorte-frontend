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
}

const MinesControls: React.FC<MinesControlsProps> = ({
  betAmount, setBetAmount, minesCount, setMinesCount,
  onStartGame, onCashout, gameState, isLoading, payout
}) => {
  
  const handleBetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      setBetAmount(value * 100); // Converte para centavos
    }
  };

  const isGameActive = gameState === 'active';
  const isIdle = gameState === 'idle' || gameState === 'busted' || gameState === 'cashed_out';
  
  const potentialWinnings = (betAmount / 100 * parseFloat(payout)).toFixed(2);

  return (
    <div className="w-full md:w-1/3 p-4 bg-black/20 rounded-lg flex flex-col gap-4 text-white">
      <div>
        <label className="block text-sm font-medium text-gray-300">Valor da Aposta (R$)</label>
        <input
          type="number"
          value={betAmount / 100}
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

      <div className="text-center">
        <p className="text-gray-400">Multiplicador Atual</p>
        <p className="text-2xl font-bold text-[var(--primary-gold)]">{payout}x</p>
        <p className="text-gray-400 mt-2">Ganhos Potenciais</p>
        <p className="text-xl font-bold text-green-400">R$ {isGameActive ? potentialWinnings : '0.00'}</p>
      </div>

      {isIdle ? (
        <button onClick={onStartGame} disabled={isLoading} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-md transition-all disabled:bg-gray-500">
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