import React from 'react';
import { useLimboGame } from '../hooks/useLimboGame';
import LimboHistory from '../components/Games/Limbo/LimboHistory';
import LimboControls from '../components/Games/Limbo/LimboControls';
import LimboDisplay from '../components/Games/Limbo/LimboDisplay';

const LimboGamePage: React.FC = () => {
  const { history, lastResult, isLoading, setIsLoading, playGame } = useLimboGame();

  return (
    <div className="container mx-auto p-4 flex flex-col gap-4">
      <div className="w-full">
        <LimboDisplay lastResult={lastResult} isLoading={isLoading} setIsLoading={setIsLoading} />
      </div>
      <div className="w-full">
        <LimboControls playGame={playGame} isLoading={isLoading} />
      </div>
      <div className="w-full">
        <LimboHistory history={history} />
      </div>
    </div>
  );
};

export default LimboGamePage;
