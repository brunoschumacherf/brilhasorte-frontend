import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import { createTowerGame, getActiveTowerGame, playTowerGame, cashOutTowerGame, getTowerGameConfig } from '../services/api';
import type { TowerGame } from '../types';

// O tipo para a nossa configuração
export type TowerConfig = Record<string, {
  name: string;
  options_per_level: number;
  total_levels: number;
  multipliers: number[];
}>;

export const useTowerGame = () => {
  const [game, setGame] = useState<TowerGame | null>(null);
  const [config, setConfig] = useState<TowerConfig | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isStarting, setIsStarting] = useState<boolean>(false);

  const handleApiResponse = (response: { data: { data: { attributes: TowerGame, id: string } } }) => {
    const gameData = { ...response.data.data.attributes, id: parseInt(response.data.data.id) };
    setGame(gameData);
    return gameData;
  };

  const handleError = (err: any, defaultMessage: string) => {
    const errorMessage = err.response?.data?.error || defaultMessage;
    toast.error(errorMessage);
    if (err.response?.status === 404) {
      setGame(null);
    }
  };

  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const configPromise = getTowerGameConfig();
      const activeGamePromise = getActiveTowerGame();
      const [configResult, gameResult] = await Promise.allSettled([configPromise, activeGamePromise]);

      if (configResult.status === 'fulfilled') {
        setConfig(configResult.value.data);
      } else {
        toast.error("Não foi possível carregar as configurações do jogo.");
      }

      if (gameResult.status === 'fulfilled') {
        handleApiResponse(gameResult.value);
      } else {
        setGame(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const startGame = async (difficulty: string, betInCents: number) => {
    setIsStarting(true);
    try {
      const response = await createTowerGame(difficulty, betInCents);
      handleApiResponse(response);
    } catch (err) {
      handleError(err, 'Não foi possível iniciar o jogo.');
    } finally {
      setIsStarting(false);
    }
  };

  const makePlay = async (choiceIndex: number) => {
    if (!game || game.status !== 'active') return;
    try {
      const response = await playTowerGame(game.id, choiceIndex);
      const updatedGame = handleApiResponse(response);
      if (updatedGame.status === 'lost') {
        toast.error('Você encontrou uma bomba!');
      }
    } catch (err) {
      handleError(err, 'Não foi possível processar a jogada.');
    }
  };

  const cashOut = async () => {
    if (!game || game.status !== 'active') return;
    try {
      const response = await cashOutTowerGame(game.id);
      handleApiResponse(response);
      toast.success(`Você ganhou R$${(response.data.data.attributes.winnings_in_cents / 100).toFixed(2)}!`);
    } catch (err) {
      handleError(err, 'Não foi possível retirar os ganhos.');
    }
  };

  return { game, config, isLoading: isLoading || isStarting, startGame, makePlay, cashOut };
};
