// src/components/Games/Limbo/LimboDisplay.tsx
import React, { useEffect, useState, useRef } from 'react';
import type { LimboGame } from '../../../types';
import { toast } from 'react-toastify';

interface LimboDisplayProps {
  lastResult: LimboGame | null;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const LimboDisplay: React.FC<LimboDisplayProps> = ({ lastResult, isLoading, setIsLoading }) => {
  const [animationState, setAnimationState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [displayedMultiplier, setDisplayedMultiplier] = useState(1.00);
  const [showRules, setShowRules] = useState(false);
  const animationInterval = useRef<number | null>(null);

  useEffect(() => {
    // Inicia a animação de subida
    if (isLoading && !lastResult) {
      setAnimationState('playing');
      animationInterval.current = window.setInterval(() => {
        setDisplayedMultiplier(prev => parseFloat((prev + 0.05).toFixed(2)));
      }, 50);
    }

    // O resultado chegou, agora animamos até o valor final
    if (lastResult) {
      if (animationInterval.current) {
        clearInterval(animationInterval.current);
      }

      const finalMultiplier = lastResult.result_multiplier;
      const startMultiplier = displayedMultiplier;
      const duration = 500; // 0.5 segundos para a animação final
      const startTime = Date.now();

      const animateToFinal = () => {
        const elapsedTime = Date.now() - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        const currentVal = startMultiplier + (finalMultiplier - startMultiplier) * progress;
        
        setDisplayedMultiplier(parseFloat(currentVal.toFixed(2)));

        if (progress < 1) {
          requestAnimationFrame(animateToFinal);
        } else {
          setDisplayedMultiplier(finalMultiplier);
          setAnimationState('finished');
          setIsLoading(false);
           if (lastResult.status === 'won') {
            toast.success(`Você ganhou R$${(lastResult.winnings_in_cents / 100).toFixed(2)}!`);
          }
        }
      };
      
      requestAnimationFrame(animateToFinal);
    }

    return () => {
      if (animationInterval.current) {
        clearInterval(animationInterval.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, lastResult]);

  const renderContent = () => {
    if (animationState === 'finished' && lastResult) {
      const isWin = lastResult.status === 'won';
      return (
        <div className={`text-center transition-opacity duration-500 ${isWin ? 'text-green-400' : 'text-red-400'}`}>
          <div className={`text-7xl mb-2 ${isWin ? '' : 'animate-ping'}`}>{isWin ? '🚀' : '💥'}</div>
          <p className="text-5xl font-bold font-mono">{lastResult.result_multiplier.toFixed(2)}x</p>
          <p className="text-lg">{isWin ? 'Você Venceu!' : 'Você Perdeu!'}</p>
        </div>
      );
    }

    if (animationState === 'playing') {
      return (
        <div className="text-center text-cyan-300">
          <div className="text-7xl mb-2 animate-bounce">🚀</div>
          <p className="text-5xl font-bold font-mono">{displayedMultiplier.toFixed(2)}x</p>
        </div>
      );
    }

    return (
      <div className="text-center text-gray-400">
        <div className="text-7xl mb-2">🚀</div>
        <p className="text-2xl">Aguardando aposta...</p>
      </div>
    );
  };

  return (
    <div className="relative bg-[var(--surface-dark)] border border-[var(--border-color)] p-8 rounded-lg shadow-lg h-80 flex items-center justify-center">
      <button onClick={() => setShowRules(!showRules)} className="absolute top-3 right-3 text-gray-400 hover:text-white">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      {showRules && (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 rounded-lg">
          <div className="text-center text-white">
            <h3 className="text-xl font-bold mb-2">Como Jogar Limbo?</h3>
            <p className="text-sm">1. Defina o valor da sua aposta e um 'Multiplicador Alvo'.</p>
            <p className="text-sm">2. Clique em 'Jogar' para lançar o foguete.</p>
            <p className="text-sm">3. Se o multiplicador final for igual ou maior que o seu alvo, você ganha!</p>
            <button onClick={() => setShowRules(false)} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg">Entendi</button>
          </div>
        </div>
      )}
      
      {renderContent()}
    </div>
  );
};

export default LimboDisplay;
