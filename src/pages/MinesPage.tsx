import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import MinesGrid from '../components/Mines/MinesGrid';
import MinesControls from '../components/Mines/MinesControls';
import { getActiveGame, startGame, revealTile, cashout } from '../services/api';
import type { MinesGame, TileValue } from '../types';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const MinesPage: React.FC = () => {
  const [game, setGame] = useState<MinesGame | null>(null);
  const [betAmount, setBetAmount] = useState(100);
  const [minesCount, setMinesCount] = useState(3);
  const [isLoading, setIsLoading] = useState(false);
  const [finalGrid, setFinalGrid] = useState<TileValue[][] | undefined>(undefined);

  // 1. Obter o usuário e a função para atualizar os detalhes do usuário
  const { user, updateUserDetails } = useAuth();

  const gameState = game ? game.state : 'idle';

  useEffect(() => {
    const fetchActiveGame = async () => {
      try {
        setIsLoading(true);
        const response = await getActiveGame();
        if (response.data) {
          setGame(response.data);
          setBetAmount(response.data.bet_amount);
          setMinesCount(response.data.mines_count);
        }
      } catch (error) {
        setGame(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchActiveGame();
  }, []);

  const handleStartGame = async () => {
    if (!user) return; // Impede o jogo se o usuário não estiver carregado
    
    setIsLoading(true);
    setFinalGrid(undefined);

    const originalBalance = user.balance_in_cents;
    
    // 2. Atualização otimista: Debita o saldo na interface ANTES da chamada da API
    updateUserDetails({ balance_in_cents: originalBalance - betAmount });

    try {
      const response = await startGame({ bet_amount: betAmount, mines_count: minesCount });
      setGame(response.data);
      toast.success('Jogo iniciado! Boa sorte!');
    } catch (error) {
      // 3. Em caso de erro, reverte a atualização do saldo para o valor original
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
      const { status, game: updatedGame } = response.data;
      
      if (status === 'game_over') {
        toast.error('Você acertou uma mina!');
        setFinalGrid(updatedGame.grid);
      }
      setGame(updatedGame);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response?.data?.errors?.join(', ') || 'Erro ao revelar');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCashout = async () => {
    if (isLoading || !user) return;
    setIsLoading(true);
    try {
      const response = await cashout();
      const winningsInCents = response.data.winnings;

      // 4. Atualiza o saldo com base no valor atual + ganhos
      updateUserDetails({ balance_in_cents: user.balance_in_cents + winningsInCents });
      
      toast.success(`Você ganhou R$ ${(winningsInCents / 100).toFixed(2)}!`);
      setGame(null);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response?.data?.errors?.join(', ') || 'Erro ao fazer cash out');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto p-4 text-white">
      <h1 className="text-3xl font-bold text-center mb-6 text-[var(--primary-gold)]">Mines</h1>
      <div className="flex flex-col md:flex-row gap-6 justify-center items-start">
        <MinesControls
          betAmount={betAmount}
          setBetAmount={setBetAmount}
          minesCount={minesCount}
          setMinesCount={setMinesCount}
          onStartGame={handleStartGame}
          onCashout={handleCashout}
          gameState={gameState}
          isLoading={isLoading}
          payout={game?.payout_multiplier || '1.0'}
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