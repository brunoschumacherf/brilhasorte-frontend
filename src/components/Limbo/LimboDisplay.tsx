import React, { useEffect, useState, useRef } from 'react';
import type { LimboGame } from '../../types';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { Info } from 'lucide-react';

interface LimboDisplayProps {
  lastResult: LimboGame | null;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const LimboDisplay: React.FC<LimboDisplayProps> = ({ lastResult, isLoading, setIsLoading }) => {
  const [animationState, setAnimationState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [displayedMultiplier, setDisplayedMultiplier] = useState(1.00);
  const [showRules, setShowRules] = useState(false);
  const animationFrameRef = useRef<number | null>(null);
  const [finalRocketY, setFinalRocketY] = useState(0);

  // Converte o multiplicador para uma posição Y (quanto maior, mais alto)
  const multiplierToY = (multiplier: number) => {
    const logMultiplier = Math.log(Math.max(1, multiplier));
    const logMax = Math.log(100); // Ponto de referência para a altura máxima
    const progress = Math.min(logMultiplier / logMax, 1);
    return -progress * 200; // Sobe até 200px
  };

  useEffect(() => {
    let startTime: number;
    if (isLoading && !lastResult) {
      setAnimationState('playing');
      startTime = Date.now();
      const animatePlaying = () => {
        const elapsedTime = (Date.now() - startTime) / 1000;
        const currentVal = 1 + elapsedTime * elapsedTime * 0.2;
        setDisplayedMultiplier(parseFloat(currentVal.toFixed(2)));
        animationFrameRef.current = requestAnimationFrame(animatePlaying);
      };
      animatePlaying();
    }

    if (lastResult) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      
      const finalMultiplier = lastResult.result_multiplier;
      const startMultiplier = displayedMultiplier;
      const duration = Math.min(800, Math.abs(finalMultiplier - startMultiplier) * 80);
      startTime = Date.now();

      const animateToFinal = () => {
        const elapsedTime = Date.now() - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        const currentVal = startMultiplier + (finalMultiplier - startMultiplier) * progress;
        setDisplayedMultiplier(parseFloat(currentVal.toFixed(2)));

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animateToFinal);
        } else {
          setDisplayedMultiplier(finalMultiplier);
          setFinalRocketY(multiplierToY(finalMultiplier));
          setAnimationState('finished');
          setIsLoading(false);
          if (lastResult.status === 'won') {
            toast.success(`Você ganhou R$${(lastResult.winnings_in_cents / 100).toFixed(2)}!`);
          }
        }
      };
      animateToFinal();
    }

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isLoading, lastResult, setIsLoading]);

  useEffect(() => {
    if (!isLoading && animationState === 'finished') {
      const timer = setTimeout(() => {
        setAnimationState('idle');
        setDisplayedMultiplier(1.00);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, animationState]);
  
  const renderContent = () => (
    <div className="flex flex-col items-center justify-center h-full">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center">
            <AnimatePresence>
                <motion.p
                    key={displayedMultiplier}
                    className={`font-mono font-bold text-7xl z-10 
                        ${animationState === 'idle' && 'text-gray-500'}
                        ${animationState === 'playing' && 'text-cyan-300'}
                        ${animationState === 'finished' && lastResult?.status === 'won' && 'text-green-400'}
                        ${animationState === 'finished' && lastResult?.status === 'lost' && 'text-red-500'}
                    `}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, position: 'absolute' }}
                    transition={{ duration: 0.1 }}
                >
                    {displayedMultiplier.toFixed(2)}x
                </motion.p>
            </AnimatePresence>
        </div>
        
        <div className="absolute bottom-1/2 text-7xl translate-y-[80px]">
            <AnimatePresence>
                {animationState !== 'finished' || (lastResult?.status === 'won') ? (
                    <motion.div
                        key="rocket"
                        initial={{ y: 0, opacity: 1 }}
                        animate={{ 
                            y: animationState === 'playing' ? multiplierToY(displayedMultiplier) : (animationState === 'finished' && lastResult?.status === 'won') ? -250 : finalRocketY,
                            opacity: (animationState === 'finished' && lastResult?.status === 'won') ? 0 : 1,
                        }}
                        transition={{ y: { duration: 0.2, ease: 'linear' }, opacity: { duration: 0.5 } }}
                        exit={{ opacity: 0 }}
                    >
                        🚀
                    </motion.div>
                ) : null}

                {animationState === 'finished' && lastResult?.status === 'lost' && (
                    <motion.div 
                        key="explosion" 
                        initial={{ scale: 0.5 }} 
                        animate={{ scale: 1.2, y: finalRocketY }} 
                        transition={{ duration: 0.3 }}
                    >
                        💥
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        {animationState === 'idle' && (
            <p className="absolute bottom-8 text-gray-400">Aguardando aposta...</p>
        )}
    </div>
  );

  return (
    <div className="relative bg-black/30 backdrop-blur-md border border-white/10 p-8 rounded-2xl h-96 flex items-center justify-center overflow-hidden">
      <button onClick={() => setShowRules(!showRules)} className="absolute top-4 right-4 text-gray-400 hover:text-white z-20">
        <Info size={20} />
      </button>

      <AnimatePresence>
        {showRules && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 flex items-center justify-center p-4 rounded-2xl z-10">
            <div className="text-center text-white max-w-sm">
              <h3 className="text-xl font-bold mb-2">Como Jogar Limbo?</h3>
              <p className="text-sm">1. Defina o valor da sua aposta e um 'Multiplicador Alvo'.</p>
              <p className="text-sm">2. Clique em 'Jogar' para lançar o foguete.</p>
              <p className="text-sm">3. Se o multiplicador final for igual ou maior que o seu alvo, você ganha!</p>
              <button onClick={() => setShowRules(false)} className="mt-4 bg-yellow-500 text-black px-4 py-2 rounded-lg font-bold text-sm">Entendi</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {renderContent()}
    </div>
  );
};

export default LimboDisplay;
