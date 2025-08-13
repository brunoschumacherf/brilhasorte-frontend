import React from 'react';
import { useLimboGame } from '../hooks/useLimboGame';
import LimboHistory from '../components/Limbo/LimboHistory';
import LimboControls from '../components/Limbo/LimboControls';
import LimboDisplay from '../components/Limbo/LimboDisplay';

const LimboGamePage: React.FC = () => {
  const { history, lastResult, isLoading, setIsLoading, playGame } = useLimboGame();

  return (
    <div className="relative min-h-screen bg-[#101010] p-4 sm:p-6 lg:p-8 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/10 rounded-full filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

        <div className="container mx-auto max-w-6xl relative z-10">
            <h1 className="text-3xl font-bold text-center mb-8 text-white">Limbo</h1>
            <div className="flex flex-col lg:flex-row gap-8 justify-center items-start">
                <div className="w-full lg:w-auto lg:flex-grow">
                    <LimboDisplay lastResult={lastResult} isLoading={isLoading} setIsLoading={setIsLoading} />
                </div>
                <div className="w-full lg:w-96 flex flex-col gap-8">
                    <LimboControls playGame={playGame} isLoading={isLoading} />
                    <LimboHistory history={history} />
                </div>
            </div>
        </div>
    </div>
  );
};

export default LimboGamePage;
