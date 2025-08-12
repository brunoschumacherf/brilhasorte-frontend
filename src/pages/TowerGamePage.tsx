// src/pages/TowerGamePage.tsx
import React from 'react';
import { useTowerGame } from '../hooks/useTowerGame';
import TowerGameSetup from '../components/Tower/TowerGameSetup';
import TowerGameBoard from '../components/Tower/TowerGameBoard';
import TowerMultipliers from '../components/Tower/TowerMultipliers';

const TowerGamePage: React.FC = () => {
  const { game, config, isLoading, startGame, makePlay, cashOut } = useTowerGame();

  if (isLoading && !game) {
    return <div className="text-center text-white mt-10">Carregando Jogo...</div>;
  }

  return (
    <div className="container mx-auto p-4 flex flex-col lg:flex-row gap-4">
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
  );
};

export default TowerGamePage;
