// src/hooks/useLimboGame.ts
import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import { playGameLimbo, getLimboHistory } from '../services/api';
import type { LimboGame } from '../types';

// Função auxiliar para converter os atributos da API para o tipo correto
const parseGameAttributes = (item: { attributes: any, id: string }): LimboGame => {
  const attributes = item.attributes;
  return {
    ...attributes,
    id: parseInt(item.id, 10),
    bet_amount_in_cents: parseInt(attributes.bet_amount_in_cents, 10),
    winnings_in_cents: parseInt(attributes.winnings_in_cents, 10),
    target_multiplier: parseFloat(attributes.target_multiplier),
    result_multiplier: parseFloat(attributes.result_multiplier),
  };
};

export const useLimboGame = () => {
  const [history, setHistory] = useState<LimboGame[]>([]);
  const [lastResult, setLastResult] = useState<LimboGame | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchHistory = useCallback(async () => {
    try {
      const response = await getLimboHistory();
      const gameData = response.data.data.map(parseGameAttributes);
      setHistory(gameData);
    } catch (err) {
      toast.error('Não foi possível carregar o histórico de jogos.');
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const playGame = async (betInCents: number, targetMultiplier: number) => {
    setIsLoading(true);
    setLastResult(null); // Limpa o resultado anterior para iniciar a nova animação
    try {
      const response = await playGameLimbo(betInCents, targetMultiplier);
      const newResult = parseGameAttributes(response.data.data);
      
      // Define o resultado imediatamente. A animação será controlada pelo LimboDisplay.
      setLastResult(newResult);
      setHistory(prev => [newResult, ...prev.slice(0, 9)]);

    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Não foi possível realizar a aposta.');
      setIsLoading(false); // Libera o botão em caso de erro
    }
    // O isLoading será setado para false pelo LimboDisplay após a animação.
  };

  return { history, lastResult, isLoading, setIsLoading, playGame };
};
