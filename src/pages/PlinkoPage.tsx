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
  const [betAmount, setBetAmount] = useState(100);
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
    if (!user || user.balance_in_cents < betAmount) {
      toast.error('Saldo insuficiente para esta aposta.');
      return;
    }
    if (isWaitingForAPI) return;

    setIsWaitingForAPI(true);
    const originalBalance = user.balance_in_cents;
    updateUserDetails({ balance_in_cents: originalBalance - betAmount });

    try {
      const response = await playPlinko({ bet_amount: betAmount, rows, risk });
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
      toast.success(`Você ganhou R$ ${(completedGame.winnings / 100).toFixed(2)}! (x${completedGame.multiplier})`);
    }
    
    setActiveBalls(prev => prev.filter(ball => ball.id !== completedGameId));
  }, [user, updateUserDetails]);

  return (
    <div className="container mx-auto p-2 sm:p-4 text-white">
      <h1 className="text-3xl font-bold text-center mb-4 text-[var(--primary-gold)]">Plinko</h1>
      <div className="flex flex-col-reverse lg:flex-row gap-6 justify-center items-center lg:items-start">
        <PlinkoControls
          betAmount={betAmount}
          setBetAmount={setBetAmount}
          rows={rows}
          setRows={setRows}
          risk={risk}
          setRisk={setRisk}
          onPlay={handlePlay}
          isAnimating={isWaitingForAPI} 
        />
        <div className="relative w-full lg:w-auto bg-black/20 rounded-lg p-2">
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
  );
};

export default PlinkoPage;