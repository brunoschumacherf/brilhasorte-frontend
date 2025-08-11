import React from 'react';

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
    const value = parseFloat(e.target.value);
    setBetAmount(isNaN(value) ? 0 : value * 100);
  };

  return (
    <div className="w-full md:w-1/3 p-4 bg-black/20 rounded-lg flex flex-col gap-4 text-white">
      <div>
        <label className="block text-sm font-medium text-gray-300">Valor da Aposta (R$)</label>
        <input
          type="text"
          value={betAmount / 100}
          onChange={handleBetChange}
          disabled={isAnimating}
          className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm p-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300">Linhas</label>
        <select
          value={rows}
          onChange={(e) => setRows(parseInt(e.target.value))}
          disabled={isAnimating}
          className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm p-2"
        >
          {rowOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300">Risco</label>
        <div className="flex bg-gray-700 rounded-md p-1 mt-1">
          {riskOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => setRisk(opt.value)}
              disabled={isAnimating}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${
                risk === opt.value ? 'bg-[var(--primary-gold)] text-black' : 'hover:bg-gray-600'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <button 
        onClick={onPlay} 
        disabled={isAnimating} 
        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-md transition-all disabled:bg-gray-500 disabled:cursor-not-allowed"
      >
        {isAnimating ? 'Jogando...' : 'Jogar'}
      </button>
    </div>
  );
};

export default PlinkoControls;