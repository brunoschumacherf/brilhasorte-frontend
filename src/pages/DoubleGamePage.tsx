import React from 'react';
import { useDoubleGame } from '../hooks/useDoubleGame';
import DoubleDisplay from '../components/Double/DoubleDisplay';
import DoubleControls from '../components/Double/DoubleControls';
import DoubleBetsList from '../components/Double/DoubleBetsList';
import DoubleHistory from '../components/Double/DoubleHistory';

const DoubleGamePage: React.FC = () => {
  const { round, timer, history } = useDoubleGame();

  return (
    <div className="relative min-h-screen bg-[#101010] p-4 sm:p-6 lg:p-8 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500/10 rounded-full filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-gray-500/10 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

        <div className="container mx-auto max-w-7xl relative z-10 space-y-6">
            <DoubleHistory history={history} />
            <DoubleDisplay status={round?.status || 'idle'} timer={timer} winningColor={round?.winning_color} />
            <DoubleControls isBettingPhase={round?.status === 'betting'} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <DoubleBetsList bets={round?.bets || []} color="red" title="Apostas no Vermelho" />
                <DoubleBetsList bets={round?.bets || []} color="white" title="Apostas no Branco" />
                <DoubleBetsList bets={round?.bets || []} color="black" title="Apostas no Preto" />
            </div>
        </div>
    </div>
  );
};

export default DoubleGamePage;
