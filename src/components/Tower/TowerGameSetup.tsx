import React, { useState } from 'react';
import type { TowerGame } from '../../types';
import type { TowerConfig } from '../../hooks/useTowerGame';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

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
      toast.error("A aposta mínima é de R$1,00.");
      return;
    }
    startGame(difficulty, betInCents);
  };

  const isGameActive = game && game.status === 'active';

  return (
    <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-6 h-full flex flex-col">
      <h2 className="text-xl font-bold text-white mb-6">Controles do Jogo</h2>
      
      {isGameActive ? (
        <div className="space-y-4 flex-grow flex flex-col">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400">Aposta</p>
              <p className="text-lg font-bold text-white">R$ {(game.bet_amount_in_cents / 100).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Dificuldade</p>
              <p className="text-lg font-bold text-white">{config?.[game.difficulty]?.name}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-400">Ganhos Atuais</p>
            <p className="text-3xl font-bold text-green-400">R$ {(game.current_winnings / 100).toFixed(2)}</p>
          </div>
          {game.next_potential_winnings && (
            <div>
              <p className="text-sm text-gray-400">Próximo Nível</p>
              <p className="text-xl font-bold text-cyan-400">R$ {(game.next_potential_winnings / 100).toFixed(2)}</p>
            </div>
          )}
          <div className="flex-grow"></div>
          <motion.button
            onClick={cashOut}
            disabled={isLoading || game.current_level === 0}
            className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isLoading ? 'A processar...' : `Retirar Ganhos`}
          </motion.button>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <label htmlFor="betAmount" className="block text-xs font-medium text-gray-400 mb-1">Valor da Aposta (R$)</label>
            <input
              type="number"
              id="betAmount"
              value={betAmount}
              onChange={(e) => setBetAmount(parseFloat(e.target.value))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2 px-3 text-white transition-colors focus:border-yellow-500 focus:ring-yellow-500 focus:outline-none"
              min="1"
              step="1"
            />
          </div>
          <div>
            <label htmlFor="difficulty" className="block text-xs font-medium text-gray-400 mb-1">Dificuldade</label>
            <select
              id="difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2 px-3 text-white transition-colors focus:border-yellow-500 focus:ring-yellow-500 focus:outline-none"
            >
              {config && Object.entries(config).map(([key, value]) => (
                <option key={key} value={key}>{value.name}</option>
              ))}
            </select>
          </div>
          <motion.button
            onClick={handleStartGame}
            disabled={isLoading || !config}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isLoading ? 'A iniciar...' : 'Começar Jogo'}
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default TowerGameSetup;
