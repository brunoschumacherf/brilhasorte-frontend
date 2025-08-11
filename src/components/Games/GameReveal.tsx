import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { getGameDetails, revealGame } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import type { PrizeAttributes, JsonApiData } from '../../types';
const TrophyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;
const CloverIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M15.55 5.55a5 5 0 01.35 3.52l-1.3-1.3a2.5 2.5 0 10-3.54 3.54l1.3 1.3a5 5 0 01-3.52-.35m.35 8.09a5 5 0 01-3.52-.35l1.3-1.3a2.5 2.5 0 10-3.54-3.54l-1.3 1.3a5 5 0 01.35 3.52m8.09.35a5 5 0 01-.35-3.52l1.3 1.3a2.5 2.5 0 103.54-3.54l-1.3-1.3a5 5 0 013.52.35m-.35-8.09a5 5 0 013.52.35l-1.3 1.3a2.5 2.5 0 103.54 3.54l1.3-1.3a5 5 0 01-.35-3.52M12 21a9 9 0 110-18 9 9 0 010 18z" /></svg>;
const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <svg className="animate-spin h-10 w-10 text-[var(--primary-gold)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <p className="mt-4 text-lg">A carregar o seu jogo...</p>
    </div>
);

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

const buttonVariants = {
  hover: { scale: 1.05, boxShadow: "0px 0px 20px rgba(96, 165, 250, 0.5)" },
  tap: { scale: 0.95 }
};

interface CustomScratchCardProps {
  width: number;
  height: number;
  coverImage: string;
  percentToFinish?: number;
  onFinish?: () => void;
  children: React.ReactNode;
}

export interface ScratchCardRef {
  reveal: () => void;
}

const CustomScratchCard = forwardRef<ScratchCardRef, CustomScratchCardProps>(
  ({ width, height, coverImage, onFinish, percentToFinish = 70, children }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawingRef = useRef(false);
    const [isFinished, setIsFinished] = useState(false);

    useImperativeHandle(ref, () => ({
      reveal: () => {
        if (isFinished || !canvasRef.current) return;
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.style.transition = 'opacity 300ms ease-out';
          canvas.style.opacity = '0';
        }

        setTimeout(() => {
          setIsFinished(true);
          if (onFinish) {
            onFinish();
          }
        }, 300);
      },
    }));

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => ctx.drawImage(img, 0, 0, width, height);
        img.onerror = () => {
            console.error(`ERRO: A imagem da raspadinha não foi encontrada em '${coverImage}'.`);
            ctx.fillStyle = '#888888';
            ctx.fillRect(0, 0, width, height);
        };
        img.src = coverImage;
    }, [coverImage, width, height]);

    const getPosition = (event: MouseEvent | TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        const rect = canvas.getBoundingClientRect();
        if (event instanceof MouseEvent) {
            return { x: event.clientX - rect.left, y: event.clientY - rect.top };
        }
        if (event.touches?.[0]) {
            return { x: event.touches[0].clientX - rect.left, y: event.touches[0].clientY - rect.top };
        }
        return null;
    };

    const scratch = (ctx: CanvasRenderingContext2D, pos: { x: number; y: number }) => {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 25, 0, 2 * Math.PI);
        ctx.fill();
    };

    const checkCompletion = () => {
        if (isFinished || !onFinish || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        const imageData = ctx.getImageData(0, 0, width, height);
        const pixels = imageData.data;
        let transparentPixels = 0;
        for (let i = 3; i < pixels.length; i += 4) {
            if (pixels[i] === 0) transparentPixels++;
        }
        const percent = (transparentPixels / (pixels.length / 4)) * 100;
        if (percent >= percentToFinish) {
            setIsFinished(true);
            onFinish();
        }
    };

    const handleStart = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        isDrawingRef.current = true;
        const pos = getPosition(event.nativeEvent);
        const ctx = canvasRef.current?.getContext('2d');
        if (pos && ctx) scratch(ctx, pos);
    };

    const handleMove = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDrawingRef.current) return;
        const pos = getPosition(event.nativeEvent);
        const ctx = canvasRef.current?.getContext('2d');
        if (pos && ctx) scratch(ctx, pos);
    };

    const handleEnd = () => {
        if (isDrawingRef.current) {
            isDrawingRef.current = false;
            checkCompletion();
        }
    };

    return (
      <div style={{ position: 'relative', width, height, cursor: 'pointer' }}>
        {children}
        {!isFinished && (
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            style={{ position: 'absolute', top: 0, left: 0, zIndex: 1, touchAction: 'none' }}
            onMouseDown={handleStart}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
          />
        )}
      </div>
    );
  }
);


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

  const scratchCardRef = useRef<ScratchCardRef>(null);

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
        setGameRules(game.scratch_card_rules || 'Encontre 3 símbolos iguais para ganhar o prémio correspondente.');

        const prizeId = response.data.data.relationships.prize.data.id;
        const wonPrizeData = includedData.find(item => item.type === 'prize' && item.id === prizeId)?.attributes;
        
        if (!wonPrizeData) throw new Error("Prémio do jogo não encontrado.");
        setWonPrize(wonPrizeData);
        
        const allPossiblePrizes = Array.isArray(game.scratch_card_prize) ? game.scratch_card_prize : [];
        setPossiblePrizes(allPossiblePrizes);

        const gridSize = 9;
        const itemsToWin = 3;
        let grid = Array(itemsToWin).fill(wonPrizeData);
        const distractors = allPossiblePrizes.filter(p => p.id !== wonPrizeData.id);
        
        for (const distractor of distractors) {
          if (grid.length < gridSize) grid.push(distractor);
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
      const timer = setTimeout(() => setIsGridReady(true), 50);
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

  // --- Funções de Manipulação de Eventos ---
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
      toast.error(err.response?.data?.error || "Ocorreu um erro ao revelar o prémio.");
    } finally {
      setIsRevealing(false);
    }
  };
  
  const onFinish = async () => {
    if (isPending && !isRevealing) {
      await handleRevealApiCall();
      setTimeout(() => {
        setIsRevealed(true);
        setIsPending(false);
      }, 500);
    }
  };

  const handleRevealAllClick = () => {
    if (scratchCardRef.current) {
      scratchCardRef.current.reveal();
    }
  };

  const renderScratchableGrid = () => (
    <div className="grid grid-cols-3 gap-2 w-full h-full p-2 bg-black/20 rounded-md">
      {gridPrizes.map((prize, index) => (
        <motion.div
          key={index}
          className="flex flex-col items-center justify-center bg-white/5 rounded-md aspect-square p-1 overflow-hidden"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
        >
          {prize.image_url ? (
            <img src={prize.image_url} alt={prize.name} className="w-full h-full object-contain p-1" />
          ) : (
            <span className="text-xs text-center text-white/80 font-bold break-words">{prize.name}</span>
          )}
        </motion.div>
      ))}
    </div>
  );

  const renderContent = () => {
    if (isLoading) return <LoadingSpinner />;
    if (error) return <p className="text-center text-red-400 p-4 bg-red-900/50 rounded-lg">{error}</p>;

    return (
      <AnimatePresence mode="wait">
        {isPending && wonPrize && (
          <motion.div
            key="pending"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div className="flex flex-col items-center">
                <h2 className="text-3xl font-bold mb-4 text-white text-center">{scratchCardTitle}</h2>
                <div className="w-full max-w-[350px] aspect-square mx-auto rounded-lg shadow-2xl overflow-hidden border-2 border-dashed border-white/20">
                  <CustomScratchCard
                    ref={scratchCardRef}
                    width={350}
                    height={350}
                    coverImage="/scratch-overlay-dark.png"
                    percentToFinish={40}
                    onFinish={onFinish}
                  >
                    {isGridReady && renderScratchableGrid()}
                  </CustomScratchCard>
                </div>
                <motion.button
                  onClick={handleRevealAllClick}
                  disabled={isRevealing}
                  className="mt-6 w-full max-w-[350px] bg-white/10 border border-white/20 text-white font-bold py-3 px-6 rounded-lg shadow-lg text-base backdrop-blur-sm disabled:opacity-50"
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isRevealing ? 'A revelar...' : 'Revelar Tudo'}
                </motion.button>
              </div>

              <div className="flex flex-col gap-8">
                {possiblePrizes.length > 0 && (
                  <div className="bg-black/20 border border-white/10 p-6 rounded-2xl">
                    <h3 className="text-center text-2xl font-bold text-[var(--primary-gold)] mb-4">Painel de Prémios</h3>
                    <div className="grid grid-cols-2 gap-4 max-h-[250px] overflow-y-auto pr-2">
                      {possiblePrizes
                        .filter(prize => prize.value_in_cents > 0)
                        .map(prize => (
                          <div key={prize.id} className="flex flex-col items-center bg-white/5 p-4 rounded-xl text-center transition-transform transform hover:scale-105">
                            {prize.image_url && <img src={prize.image_url} alt={prize.name} className="h-16 w-16 object-contain mb-2" />}
                            <p className="text-sm font-semibold text-white break-words w-full">{prize.name}</p>
                            <p className="text-xl font-bold text-[var(--primary-gold)] mt-1">
                              R$ {(prize.value_in_cents / 100).toFixed(2)}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
                {gameRules && (
                  <div className="bg-black/20 border border-white/10 p-6 rounded-2xl">
                    <h3 className="text-center text-xl font-bold text-white mb-3">Regras do Jogo</h3>
                    <p className="text-sm text-gray-400 text-center">{gameRules}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {isRevealed && (
          <motion.div
            key="revealed"
            className="w-full flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5, type: 'spring' }}
          >
            {wonPrize && wonPrize.value_in_cents > 0 ? (
              <div className="w-full max-w-md text-center rounded-2xl p-8 flex flex-col items-center shadow-2xl bg-gradient-to-br from-yellow-900/50 via-black/30 to-black/30 border-2 border-yellow-500 backdrop-blur-sm">
                {showConfetti && <Confetti recycle={false} numberOfPieces={300} gravity={0.1} />}
                <TrophyIcon />
                <h2 className="text-5xl font-black my-4 tracking-tight text-white uppercase">Você Ganhou!</h2>
                {wonPrize.image_url && (
                  <motion.img 
                    src={wonPrize.image_url} 
                    alt={wonPrize.name} 
                    className="max-h-32 object-contain my-4"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                  />
                )}
                <p className="text-2xl font-light mb-6 text-yellow-300">{wonPrize.name}</p>
                <div className="bg-black/30 rounded-xl p-6 w-full">
                  <p className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500">
                    R$ {(wonPrize.value_in_cents / 100).toFixed(2)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-md text-center rounded-2xl p-8 flex flex-col items-center shadow-2xl bg-gradient-to-br from-blue-900/50 via-black/30 to-black/30 border-2 border-blue-700 backdrop-blur-sm">
                <CloverIcon />
                <h2 className="text-5xl font-black my-4 tracking-tight text-white/90">A Sorte Continua</h2>
                <p className="text-2xl font-light text-blue-300">Não desanime, a sua próxima oportunidade pode ser a premiada!</p>
              </div>
            )}
            
            <motion.button
              onClick={() => navigate('/games')}
              className="mt-8 w-full max-w-md bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-4 px-6 rounded-lg shadow-lg text-lg"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              Jogar Novamente
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };
  
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 md:p-8 bg-[#101010] overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full z-0">
          <div className="absolute -top-1/4 left-0 w-96 h-96 bg-yellow-500/10 rounded-full filter blur-3xl opacity-50 animate-blob"></div>
          <div className="absolute -bottom-1/4 right-0 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
      </div>
      <div className="w-full max-w-4xl relative z-10">
        {renderContent()}
      </div>
    </div>
  );
};

export default GameReveal;
