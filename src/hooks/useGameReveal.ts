// src/hooks/useGameReveal.ts

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGameDetails, revealGame } from '../services/api'; // Ajuste o caminho se necessário
import { useAuth } from '../contexts/AuthContext'; // Ajuste o caminho se necessário
import { toast } from 'react-toastify';

// --- Tipos ---

type GameStatus = 'loading' | 'pending' | 'revealed' | 'error';

interface PrizeAttributes {
  id: number;
  name: string;
  value_in_cents: number;
  image_url: string | null;
}

// --- Funções Auxiliares ---

/**
 * Analisa a resposta da API de forma segura, extraindo os dados do jogo e do prêmio.
 * Lança um erro se a estrutura da resposta for inesperada ou incompleta.
 * @param response A resposta completa da API.
 * @returns Um objeto com o status do jogo e os atributos do prêmio.
 */
const parseGameResponse = (response: any) => {
  // 1. NORMALIZAÇÃO: Encontra o objeto do jogo e o array 'included', independentemente da estrutura (aninhada ou não).
  const gameData = response?.data?.data || response?.data || response;
  const includedData = response?.data?.included || response?.included || [];

  // 2. VERIFICAÇÃO DE INTEGRIDADE: Garante que o objeto do jogo é válido.
  if (!gameData?.attributes || !gameData?.relationships) {
    const errorMessage = response?.errors?.[0]?.detail || "A estrutura do jogo na resposta da API é inválida.";
    throw new Error(errorMessage);
  }

  const gameAttributes = gameData.attributes;
  const prizeRelationship = gameData.relationships?.prize?.data;

  if (!prizeRelationship) {
    throw new Error("A resposta da API não contém uma relação de prêmio ('prize').");
  }
  
  // 3. BUSCA PELO PRÊMIO: Procura os detalhes do prêmio no array 'included'.
  const prize = includedData.find(
    (item: any) => item.type === 'prize' && item.id === prizeRelationship.id
  )?.attributes as PrizeAttributes | undefined;

  // 4. VERIFICAÇÃO CRÍTICA: Se o prêmio não foi encontrado, os dados estão incompletos.
  if (!prize) {
    throw new Error("Dados do prêmio não encontrados no bloco 'included' da API. A resposta está incompleta.");
  }

  return { gameStatus: gameAttributes.status, prize };
};


// --- O Hook Principal ---

export const useGameReveal = (gameId: string | undefined) => {
  const navigate = useNavigate();
  const { user, updateBalance } = useAuth();

  const [status, setStatus] = useState<GameStatus>('loading');
  const [prize, setPrize] = useState<PrizeAttributes | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!gameId) {
      setStatus('error');
      setError("ID do jogo não encontrado.");
      return;
    }

    const fetchGameData = async () => {
      setStatus('loading');
      try {
        // A função 'parseGameResponse' agora é robusta o suficiente para lidar com a resposta bruta.
        const response = await getGameDetails(gameId);
        const { gameStatus, prize } = parseGameResponse(response.data);
        
        setPrize(prize);
        setStatus(gameStatus === 'finished' ? 'revealed' : 'pending');
      } catch (err: any) {
        setStatus('error');
        setError(err.message || "Não foi possível carregar o jogo.");
      }
    };

    fetchGameData();
  }, [gameId]);

  const onScratchComplete = useCallback(async () => {
    if (status !== 'pending' || isRevealing || !gameId) return;

    setIsRevealing(true);
    try {
      const response = await revealGame(gameId);
      const revealedPrize = response.data.included?.find(
        (item: any) => item.type === 'prize'
      )?.attributes;

      if (user && revealedPrize && revealedPrize.value_in_cents > 0) {
        updateBalance(user.balance_in_cents + revealedPrize.value_in_cents);
        toast.success(`Você ganhou R$ ${(revealedPrize.value_in_cents / 100).toFixed(2)}!`);
      }
      
      setTimeout(() => {
        setStatus('revealed');
        setIsRevealing(false);
      }, 500);

    } catch (err: any) {
      toast.error(err.response?.data?.error || "Ocorreu um erro ao revelar o prêmio.");
      setIsRevealing(false);
    }
  }, [status, isRevealing, gameId, user, updateBalance]);

  const playAgain = () => navigate('/games');

  return { status, prize, error, isRevealing, onScratchComplete, playAgain };
};