// src/pages/MinesPage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import MinesGrid from '../components/Mines/MinesGrid';
import MinesControls from '../components/Mines/MinesControls';
import { getActiveGame, startGame, revealTile, cashout } from '../services/api';
import type { MinesGameAttributes, TileValue } from '../types';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const MinesPage: React.FC = () => {
  const [game, setGame] = useState<MinesGameAttributes | null>(null);
  const [betAmount, setBetAmount] = useState(10);
  const [minesCount, setMinesCount] = useState(3);
  const [isLoading, setIsLoading] = useState(false);
  const [finalGrid, setFinalGrid] = useState<TileValue[][] | undefined>(undefined);

  const { user, updateUserDetails } = useAuth();
  const gameState = game ? game.state : 'idle';

  const fetchActiveGame = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getActiveGame(); 
      const gameData = response.data?.data?.attributes;

      if (gameData) {
        setGame(gameData);
        setBetAmount(gameData.bet_amount / 100);
        setMinesCount(gameData.mines_count);
      }
    } catch (error) {
      setGame(null);
    } finally {
      setIsLoading(false);
    }
  }, []);


  useEffect(() => {
    fetchActiveGame();
  }, [fetchActiveGame]);

  const handleStartGame = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setFinalGrid(undefined);

    const originalBalance = user.balance_in_cents;
    const betInCents = Math.round(betAmount * 100);
    
    updateUserDetails({ balance_in_cents: originalBalance - betInCents });

    try {
      const response = await startGame({ bet_amount: betInCents, mines_count: minesCount });
      setGame(response.data.data.attributes);
      toast.success('Jogo iniciado! Boa sorte!');
    } catch (error) {
      updateUserDetails({ balance_in_cents: originalBalance });
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response?.data?.errors?.join(', ') || 'Erro ao iniciar o jogo');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTileClick = async (row: number, col: number) => {
      if (isLoading || gameState !== 'active') return;
      setIsLoading(true);
      try {
        const response = await revealTile({ row, col });
        
        const { status, payload } = response.data;
        
        const updatedGameAttributes = payload.data.attributes;
        
        if (status === 'game_over') {
          toast.error('Você acertou uma mina!');
          setFinalGrid(updatedGameAttributes.grid_reveal);
        }
        setGame(updatedGameAttributes);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          toast.error(error.response?.data?.errors?.join(', ') || 'Erro ao revelar');
        }
      } finally {
        setIsLoading(false);
      }
  };

  const handleCashout = async () => {
    if (isLoading || !user || !game) return;
    setIsLoading(true);
    try {
      const response = await cashout();
      const winningsInCents = response.data.winnings;
      setFinalGrid(response.data.payload.data.attributes.grid_reveal)

      updateUserDetails({ balance_in_cents: user.balance_in_cents - game.bet_amount + winningsInCents });
      
      toast.success(`Você ganhou R$ ${(winningsInCents / 100).toFixed(2)}!`);
      setGame(response.data.payload.data.attributes);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response?.data?.errors?.join(', ') || 'Erro ao fazer cash out');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto p-4 text-white max-w-6xl">
      <h1 className="text-3xl font-bold text-center mb-6 text-[var(--primary-gold)]">Mines</h1>
      <div className="flex flex-col lg:flex-row gap-6 justify-center items-start">
        <MinesControls
          betAmount={betAmount}
          setBetAmount={setBetAmount}
          minesCount={minesCount}
          setMinesCount={setMinesCount}
          onStartGame={handleStartGame}
          onCashout={handleCashout}
          gameState={gameState}
          isLoading={isLoading}
          payout={game?.payout_multiplier || '1.00'}
          nextPayout={game?.next_multiplier || game?.payout_multiplier || '1.00'}
        />
        <MinesGrid
          onTileClick={handleTileClick}
          revealedTiles={game?.revealed_tiles || []}
          finalGrid={finalGrid}
          gameState={gameState}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default MinesPage;