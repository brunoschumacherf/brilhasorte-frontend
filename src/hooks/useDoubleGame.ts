import { useState, useEffect, useRef, useCallback } from 'react';
import consumer from '../services/cable';
import { triggerDoubleDraw, getDoubleHistory } from '../services/api';
import type { DoubleGameRound } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const BETTING_DURATION = 30;

export const useDoubleGame = () => {
  const { user, updateBalance } = useAuth();
  const [round, setRound] = useState<DoubleGameRound | null>(null);
  const [history, setHistory] = useState<DoubleGameRound[]>([]);
  const [timer, setTimer] = useState(BETTING_DURATION);
  const timerIntervalRef = useRef<number | null>(null);
  const subscriptionRef = useRef<any>(null);
  const hasTriggeredDraw = useRef(false);

  const fetchHistory = useCallback(async () => {
    try {
      const response = await getDoubleHistory();
      const historyData = response.data.data.map(item => ({...item.attributes, id: parseInt(item.id)}));
      setHistory(historyData);
    } catch (error) {
      console.error("Falha ao buscar o histórico do Double.", error);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const clearTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  const handleNewRound = useCallback((newRound: DoubleGameRound) => {
    setRound(newRound);
    hasTriggeredDraw.current = false;
    const secondsPassed = (new Date().getTime() - new Date(newRound.created_at).getTime()) / 1000;
    const initialTime = Math.max(0, BETTING_DURATION - secondsPassed);
    setTimer(initialTime);

    clearTimer();
    timerIntervalRef.current = window.setInterval(() => {
      setTimer(prev => prev - 1);
    }, 1000);
  }, [clearTimer]);

  useEffect(() => {
    if (timer <= 0 && round?.status === 'betting' && !hasTriggeredDraw.current) {
      hasTriggeredDraw.current = true;
      clearTimer();
      triggerDoubleDraw().catch(() => {
        hasTriggeredDraw.current = false; 
      });
    }
  }, [timer, round?.status, clearTimer]);

  useEffect(() => {
    if (subscriptionRef.current) return;

    subscriptionRef.current = consumer.subscriptions.create("DoubleGameChannel", {
      connected: () => console.log("Conectado ao DoubleGameChannel!"),
      
      received: (data: any): void => {
        switch (data.type) {
          case 'current_state':
          case 'new_round':
            handleNewRound(data.round);
            break;
          case 'new_bet':
            setRound(prev => prev ? { ...prev, bets: [...prev.bets, data.bet] } : null);
            break;
          case 'spinning':
            clearTimer();
            setRound(prev => prev ? { ...prev, status: 'spinning', winning_color: data.winning_color } : null);
            break;
          case 'completed':
            const completedRound = data.round as DoubleGameRound;
            setRound(prev => prev ? { ...prev, status: 'completed' } : null);
            setHistory(prevHistory => [completedRound, ...prevHistory.slice(0, 14)]);

            if (user && completedRound) {
              const myBetsInRound = completedRound.bets.filter(bet => bet.user.id === user.id);
              if (myBetsInRound.length > 0) {
                const totalBetAmount = myBetsInRound.reduce((sum, bet) => sum + bet.bet_amount_in_cents, 0);
                const myWinningBets = myBetsInRound.filter(bet => bet.color === completedRound.winning_color);
                const totalWinnings = myWinningBets.reduce((sum, bet) => sum + bet.winnings_in_cents, 0);
                if (totalWinnings > 0) {
                  toast.success(`Você ganhou R$ ${(totalWinnings / 100).toFixed(2)}!`);
                }
                const newBalance = user.balance_in_cents - totalBetAmount + totalWinnings;
                updateBalance(newBalance);
              }
            }
            break;
        }
      },
    });

    return () => {
      clearTimer();
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [clearTimer, handleNewRound, user, updateBalance]);

  return { round, timer, history };
};