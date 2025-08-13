import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import { playGameLimbo, getLimboHistory } from '../services/api';
import type { LimboGame } from '../types';
import { useAuth } from '../contexts/AuthContext';

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
  const { user, updateUserDetails } = useAuth();

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
    if (!user) return;
    
    const originalBalance = user.balance_in_cents;
    updateUserDetails({ balance_in_cents: originalBalance - betInCents });

    setIsLoading(true);
    setLastResult(null);
    try {
      const response = await playGameLimbo(betInCents, targetMultiplier);
      const newResult = parseGameAttributes(response.data.data);
      
      setLastResult(newResult);
      setHistory(prev => [newResult, ...prev.slice(0, 14)]);

      if (user && newResult.winnings_in_cents > 0) {
        updateUserDetails({ balance_in_cents: originalBalance - betInCents + newResult.winnings_in_cents });
      }

    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Não foi possível realizar a aposta.');
      updateUserDetails({ balance_in_cents: originalBalance });
      setIsLoading(false);
    }
  };

  return { history, lastResult, isLoading, setIsLoading, playGame };
};
