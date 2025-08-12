// src/components/Games/Tower/TowerGameSetup.tsx
import React, { useState } from 'react';
import type { TowerGame } from '../../types';
import type { TowerConfig } from '../../hooks/useTowerGame';

interface TowerGameSetupProps {
  game: TowerGame | null;
  config: TowerConfig | null;
  startGame: (difficulty: string, betInCents: number) => void;
  cashOut: () => void;
  isLoading: boolean;
}

const TowerGameSetup: React.FC<TowerGameSetupProps> = ({ game, config, startGame, cashOut, isLoading }) => {
  const [betAmount, setBetAmount] = useState(1);
  const [difficulty, setDifficulty] = useState('easy');

  const handleStartGame = () => {
    const betInCents = Math.round(betAmount * 100);
    if (betInCents < 100) {
      alert("A aposta mínima é de R$1,00.");
      return;
    }
    startGame(difficulty, betInCents);
  };

  const isGameActive = game && game.status === 'active';

  return (
    <div className="bg-[var(--surface-dark)] border border-[var(--border-color)] p-4 rounded-lg shadow-lg h-full flex flex-col">
      <h2 className="text-xl font-bold text-[var(--primary-gold)] mb-4">Controles do Jogo</h2>
      
      {isGameActive ? (
        <div className="space-y-4 flex-grow flex flex-col">
          <div>
            <p className="text-sm text-[var(--text-secondary)]">Aposta</p>
            <p className="text-lg font-bold text-white">R$ {(game.bet_amount_in_cents / 100).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-[var(--text-secondary)]">Dificuldade</p>
            <p className="text-lg font-bold text-white">{config?.[game.difficulty]?.name}</p>
          </div>
           <div>
            <p className="text-sm text-[var(--text-secondary)]">Ganhos Atuais</p>
            <p className="text-2xl font-bold text-green-400">R$ {(game.current_winnings / 100).toFixed(2)}</p>
          </div>
          {game.next_potential_winnings && (
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Próximo Nível</p>
              <p className="text-lg font-bold text-cyan-400">R$ {(game.next_potential_winnings / 100).toFixed(2)}</p>
            </div>
          )}
          <div className="flex-grow"></div>
          <button
            onClick={cashOut}
            disabled={isLoading || game.current_level === 0}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processando...' : `Retirar Ganhos`}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label htmlFor="betAmount" className="block text-sm font-medium text-[var(--text-secondary)]">Valor da Aposta (R$)</label>
            <input
              type="number"
              id="betAmount"
              value={betAmount}
              onChange={(e) => setBetAmount(parseFloat(e.target.value))}
              className="w-full bg-[#2a2a2a] p-2 border border-[var(--border-color)] rounded-md mt-1"
              min="1"
              step="1"
            />
          </div>
          <div>
            <label htmlFor="difficulty" className="block text-sm font-medium text-[var(--text-secondary)]">Dificuldade</label>
            <select
              id="difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full bg-[#2a2a2a] p-2 border border-[var(--border-color)] rounded-md mt-1"
            >
              {config && Object.entries(config).map(([key, value]) => (
                <option key={key} value={key}>{value.name}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleStartGame}
            disabled={isLoading || !config}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-gray-500"
          >
            {isLoading ? 'Iniciando...' : 'Começar Jogo'}
          </button>
        </div>
      )}
    </div>
  );
};

export default TowerGameSetup;
