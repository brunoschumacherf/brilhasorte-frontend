import React from 'react';
import { useTowerGame } from '../hooks/useTowerGame';
import TowerGameSetup from '../components/Tower/TowerGameSetup';
import TowerGameBoard from '../components/Tower/TowerGameBoard';
import TowerMultipliers from '../components/Tower/TowerMultipliers';

const TowerGamePage: React.FC = () => {
  const { game, config, isLoading, startGame, makePlay, cashOut } = useTowerGame();

  if (isLoading && !game && !config) {
    return <div className="text-center text-white mt-10">A carregar Jogo...</div>;
  }

  return (
    <div className="relative min-h-screen bg-[#101010] p-4 sm:p-6 lg:p-8 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-green-500/10 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

        <div className="container mx-auto max-w-7xl relative z-10">
            <h1 className="text-3xl font-bold text-center mb-8 text-white">Tower</h1>
            <div className="flex flex-col lg:flex-row gap-8 justify-center items-start">
                <div className="w-full lg:w-1/4">
                    <TowerGameSetup game={game} config={config} startGame={startGame} cashOut={cashOut} isLoading={isLoading} />
                </div>
                <div className="w-full lg:w-1/2">
                    <TowerGameBoard game={game} config={config} makePlay={makePlay} isLoading={isLoading} />
                </div>
                <div className="w-full lg:w-1/4">
                    <TowerMultipliers game={game} config={config} />
                </div>
            </div>
        </div>
    </div>
  );
};

export default TowerGamePage;
