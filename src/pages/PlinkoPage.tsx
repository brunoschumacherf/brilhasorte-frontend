import React, { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import { playPlinko, getPlinkoMultipliers } from '../services/api';
import type { PlinkoGame } from '../types';
import { useAuth } from '../contexts/AuthContext';
import PlinkoBoard from '../components/Plinko/PlinkoBoard';
import PlinkoControls from '../components/Plinko/PlinkoControls';
import PlinkoMultipliers from '../components/Plinko/PlinkoMultipliers';
import axios from 'axios';

type BoardDimensions = { rowHeight: number, topPadding: number, width: number, pegSpacingX: number };

const PlinkoPage: React.FC = () => {
  const [betAmount, setBetAmount] = useState(1.00); // Em reais
  const [rows, setRows] = useState(8);
  const [risk, setRisk] = useState<'low' | 'medium' | 'high'>('medium');
  const [isWaitingForAPI, setIsWaitingForAPI] = useState(false);
  const [activeBalls, setActiveBalls] = useState<PlinkoGame[]>([]);
  const [multipliers, setMultipliers] = useState<number[]>([]);
  const [boardDimensions, setBoardDimensions] = useState<BoardDimensions | null>(null);

  const { user, updateUserDetails } = useAuth();
  const activeBallsRef = useRef(activeBalls);

  useEffect(() => {
    activeBallsRef.current = activeBalls;
  }, [activeBalls]);

  useEffect(() => {
    const fetchMultipliers = async () => {
      try {
        const response = await getPlinkoMultipliers();
        const allMultipliers = response.data;
        if (allMultipliers[rows] && allMultipliers[rows][risk]) {
          setMultipliers(allMultipliers[rows][risk]);
        }
      } catch {
        toast.error("Não foi possível carregar os multiplicadores.");
      }
    };
    fetchMultipliers();
  }, [rows, risk]);

  const handlePlay = async () => {
    const betInCents = Math.round(betAmount * 100);
    if (!user || user.balance_in_cents < betInCents) {
      toast.error('Saldo insuficiente para esta aposta.');
      return;
    }
    if (isWaitingForAPI) return;

    setIsWaitingForAPI(true);
    const originalBalance = user.balance_in_cents;
    updateUserDetails({ balance_in_cents: originalBalance - betInCents });

    try {
      const response = await playPlinko({ bet_amount: betInCents, rows, risk });
      setActiveBalls(prev => [...prev, response.data]);
    } catch (error: any) {
      updateUserDetails({ balance_in_cents: originalBalance });
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response?.data?.errors?.join(', ') || 'Erro ao jogar');
      }
    } finally {
      setIsWaitingForAPI(false);
    }
  };

  const handleBallAnimationComplete = useCallback((completedGameId: number) => {
    const completedGame = activeBallsRef.current.find(ball => ball.id === completedGameId);
    
    if (completedGame && user) {
      updateUserDetails({ balance_in_cents: user.balance_in_cents + completedGame.winnings });
      if (completedGame.winnings > 0) {
        toast.success(`Você ganhou R$ ${(completedGame.winnings / 100).toFixed(2)}! (x${completedGame.multiplier})`);
      }
    }
    
    setActiveBalls(prev => prev.filter(ball => ball.id !== completedGameId));
  }, [user, updateUserDetails]);

  return (
    <div className="relative min-h-screen bg-[#101010] p-4 sm:p-6 lg:p-8 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-pink-500/10 rounded-full filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

        <div className="container mx-auto max-w-6xl relative z-10">
            <h1 className="text-3xl font-bold text-center mb-8 text-white">Plinko</h1>
            <div className="flex flex-col-reverse lg:flex-row gap-8 justify-center items-center lg:items-start">
                <PlinkoControls
                    betAmount={betAmount}
                    setBetAmount={setBetAmount}
                    rows={rows}
                    setRows={setRows}
                    risk={risk}
                    setRisk={setRisk}
                    onPlay={handlePlay}
                    // ✨ ALTERADO: Permite jogar mesmo com bolas a cair
                    isAnimating={isWaitingForAPI} 
                />
                <div className="relative w-full lg:w-auto">
                    <PlinkoBoard
                        rows={rows}
                        balls={activeBalls}
                        onAnimationComplete={handleBallAnimationComplete}
                        setBoardDimensions={setBoardDimensions}
                    />
                    <PlinkoMultipliers 
                        multipliers={multipliers} 
                        boardDimensions={boardDimensions}
                        rows={rows}
                    />
                </div>
            </div>
        </div>
    </div>
  );
};

export default PlinkoPage;
