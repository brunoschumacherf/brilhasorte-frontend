import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import { getGameDetails, revealGame } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import type { PrizeAttributes, JsonApiData } from '../../types';
import CustomScratchCard from '../../components/CustomScratchCard';

const shuffleArray = (array: any[]) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const DUMMY_PRIZES: PrizeAttributes[] = [
  { id: 999997, name: 'Tente de Novo', value_in_cents: 0, image_url: null, probability: 0 },
  { id: 999998, name: 'Que Pena', value_in_cents: 0, image_url: null, probability: 0 },
  { id: 999999, name: 'Não Foi Desta Vez', value_in_cents: 0, image_url: null, probability: 0 }
];

const GameReveal: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { updateBalance, user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState('');
  
  const [isGridReady, setIsGridReady] = useState(false);
  
  const [wonPrize, setWonPrize] = useState<PrizeAttributes | null>(null);
  const [possiblePrizes, setPossiblePrizes] = useState<PrizeAttributes[]>([]);
 const [gridPrizes, setGridPrizes] = useState<PrizeAttributes[]>([]);
  const [scratchCardTitle, setScratchCardTitle] = useState('');
  const [gameRules, setGameRules] = useState('');
  
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const fetchGameData = async () => {
      if (!gameId) {
        setError("ID do jogo não encontrado.");
        setIsLoading(false);
        return;
      }


      setIsGridReady(false);
      setIsLoading(true);
      setError('');
      try {
        const response = await getGameDetails(gameId);
        const game = response.data.data.attributes;
        const includedData: JsonApiData<any>[] = response.data.included || [];

        setScratchCardTitle(game.scratch_card_title || 'Encontre 3 Iguais!');
        setGameRules(game.scratch_card_rules || 'Encontre 3 símbolos iguais para ganhar o prêmio correspondente.');

        const prizeId = response.data.data.relationships.prize.data.id;
        const wonPrizeData = includedData.find(item => item.type === 'prize' && item.id === prizeId)?.attributes;
        
        if (!wonPrizeData) throw new Error("Prêmio do jogo não encontrado.");
        setWonPrize(wonPrizeData);
        
        const allPossiblePrizes = Array.isArray(game.scratch_card_prize) ? game.scratch_card_prize : [];
        setPossiblePrizes(allPossiblePrizes);

        const gridSize = 9;
        const itemsToWin = 3;
        
        let grid = Array(itemsToWin).fill(wonPrizeData);
        const distractors = allPossiblePrizes.filter(p => p.id !== wonPrizeData.id);
        
        for (const distractor of distractors) {
          if (grid.length < gridSize) {
            grid.push(distractor);
          }
        }
        
        let dummyIndex = 0;
        while (grid.length < gridSize) {
          grid.push(DUMMY_PRIZES[dummyIndex % DUMMY_PRIZES.length]);
          dummyIndex++;
        }
        
        setGridPrizes(shuffleArray(grid));

        if (game.status === 'finished') {
          setIsRevealed(true);
          setIsPending(false);
        } else {
          setIsPending(true);
          setIsRevealed(false);
        }
      } catch (err: any) {
        setError(err.response?.data?.error || "Não foi possível carregar o jogo.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGameData();
  }, [gameId]);

  useEffect(() => {
    if (isPending && !isGridReady) {
      const timer = setTimeout(() => {
        setIsGridReady(true);
      }, 50); // Delay de 50ms
      return () => clearTimeout(timer);
    }
  }, [isPending, isGridReady]);

  useEffect(() => {
    if (isRevealed && wonPrize && wonPrize.value_in_cents > 0) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 6000);
      return () => clearTimeout(timer);
    }
  }, [isRevealed, wonPrize]);

  const handleRevealApiCall = async () => {
    if (!gameId || isRevealing) return;
    setIsRevealing(true);
    try {
      const response = await revealGame(gameId);
      const revealedPrize = response.data.included?.find((item: any) => item.type === 'prize')?.attributes;
      
      if (user && revealedPrize && revealedPrize.value_in_cents > 0) {
        const newBalance = user.balance_in_cents + revealedPrize.value_in_cents;
        updateBalance(newBalance);
        toast.success(`Você ganhou R$ ${(revealedPrize.value_in_cents / 100).toFixed(2)}!`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Ocorreu um erro ao revelar o prêmio.");
    } finally {
      setIsRevealing(false);
    }
  };
  
  const onScratchComplete = async () => {
    if (isPending && !isRevealing) {
      await handleRevealApiCall();
      setTimeout(() => {
        setIsRevealed(true);
        setIsPending(false);
      }, 500);
    }
  };
  
  const renderScratchableGrid = () => {
    return (
        <div className="grid grid-cols-3 gap-2 w-full h-full p-2 bg-black bg-opacity-20">
            {gridPrizes.map((prize, index) => (
                <div key={index} className="flex flex-col items-center justify-center bg-gray-800 rounded-md aspect-square p-1 overflow-hidden">
                    {prize.image_url ? (
                        <img src={prize.image_url} alt={prize.name} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-xs text-center text-white font-bold break-words">{prize.name}</span>
                    )}
                </div>
            ))}
        </div>
    );
  };

  const renderContent = () => {
    if (isLoading) return <p className="text-center text-[var(--text-secondary)]">Carregando Jogo...</p>;
    if (error) return <p className="text-center text-red-400">{error}</p>;

    if (isRevealed) {
      const hasWon = wonPrize && wonPrize.value_in_cents > 0;

      return (
        <motion.div
          className="w-full flex flex-col items-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {hasWon && showConfetti && <Confetti recycle={false} numberOfPieces={250} gravity={0.1} />}

          <div className={`w-full rounded-2xl p-6 flex flex-col items-center shadow-2xl ${hasWon ? 'bg-gradient-to-br from-yellow-800 via-gray-900 to-black border-yellow-500' : 'bg-gradient-to-br from-blue-900 via-gray-800 to-gray-900 border-blue-700'} border-2`}>
            <div className="text-6xl mb-4">{hasWon ? '🏆' : '😕'}</div>
            <h2 className={`text-4xl font-black mb-2 tracking-tight ${hasWon ? 'text-white' : 'text-gray-300'}`}>
              {hasWon ? `VOCÊ GANHOU!` : 'Não foi desta vez'}
            </h2>
            <p className={`text-xl font-light mb-6 ${hasWon ? 'text-yellow-300' : 'text-blue-300'}`}>
              {hasWon && wonPrize ? wonPrize.name : 'Não desanime, tente novamente!'}
            </p>

            {hasWon && wonPrize && (
                <div className="flex flex-col items-center bg-black bg-opacity-30 rounded-xl p-4 w-full mb-6">
                    {wonPrize.image_url && <img src={wonPrize.image_url} alt={wonPrize.name} className="max-h-32 object-contain mb-3" />}
                    <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500">
                        R$ {(wonPrize.value_in_cents / 100).toFixed(2)}
                    </p>
                </div>
            )}
          </div>
          
          <motion.button
            onClick={() => navigate('/games')}
            className="mt-8 w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-4 px-6 rounded-lg shadow-lg text-lg"
            whileHover={{ scale: 1.05, boxShadow: "0px 0px 15px rgba(59, 130, 246, 0.5)" }}
            whileTap={{ scale: 0.95 }}
          >
            Jogar Novamente
          </motion.button>
        </motion.div>
      );
    }
    
    if (isPending && wonPrize) {
      return (
        <>
          <h2 className="text-2xl font-bold mb-2 text-white">{scratchCardTitle}</h2>
          <p className="text-[var(--text-secondary)] mb-6">Raspe a grade para revelar seu prêmio!</p>

          <div className="w-full max-w-[320px] aspect-square mx-auto rounded-lg shadow-inner overflow-hidden border-2 border-dashed border-[var(--border-color)]">
            <CustomScratchCard
              width={320}
              height={320}
              coverImage="/scratch-overlay-dark.png"
              percentToFinish={40}
              onFinish={onScratchComplete}
            >
              {/* MUDANÇA: Renderização condicional do grid */}
              {isGridReady && renderScratchableGrid()}
            </CustomScratchCard>
          </div>
          
          {possiblePrizes.length > 0 && (
            <div className="w-full bg-gray-900 bg-opacity-50 border border-gray-700 p-4 rounded-lg mt-6">
                <h3 className="text-center text-xl font-bold text-[var(--primary-gold)] mb-4">Prêmios da Rodada</h3>
                <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2">
                {possiblePrizes
                    .filter(prize => prize.value_in_cents > 0)
                    .map(prize => (
                    <div key={prize.id} className="flex flex-col items-center justify-center bg-gray-800 p-3 rounded-lg text-center transition-transform transform hover:scale-105">
                        {prize.image_url && <img src={prize.image_url} alt={prize.name} className="h-12 w-12 object-contain mb-2" />}
                        <p className="text-sm font-semibold text-white break-words w-full">{prize.name}</p>
                        <p className="text-lg font-bold text-[var(--primary-gold)] mt-1">
                            R$ {(prize.value_in_cents / 100).toFixed(2)}
                        </p>
                    </div>
                ))}
                </div>
            </div>
          )}

          {gameRules && (
            <div className="w-full mt-6">
              <h3 className="text-lg font-semibold text-white mb-3">Regras do Jogo</h3>
              <div className="bg-black bg-opacity-20 p-3 rounded-md text-left">
                <p className="text-sm text-[var(--text-secondary)]">{gameRules}</p>
              </div>
            </div>
          )}
        </>
      );
    }

    return null;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-sm bg-[var(--surface-dark)] border border-[var(--border-color)] rounded-lg shadow-2xl p-6 text-center">
            {renderContent()}
        </div>
    </div>
  );
};

export default GameReveal;