import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Diamond } from 'lucide-react';

interface DoubleDisplayProps {
  status: 'betting' | 'spinning' | 'completed' | 'idle';
  timer: number;
  winningColor?: 'black' | 'red' | 'white';
}

const COLOR_WIDTH = 96;
const SEPARATOR_WIDTH = 48;
const ITEM_WIDTH = COLOR_WIDTH + SEPARATOR_WIDTH;

const DoubleDisplay: React.FC<DoubleDisplayProps> = ({ status, timer, winningColor }) => {
  const [spinnerItems, setSpinnerItems] = useState<string[]>([]);
  const [spinnerStyle, setSpinnerStyle] = useState({});
  const finalPositionRef = useRef(0);

  const generateSpinnerItems = useCallback(() => {
    const basePattern = [
      ...Array(7).fill('red'), 
      ...Array(7).fill('black'), 
      'white'
    ];
    const longPattern = Array.from({ length: 15 }, () => basePattern).flat();
    for (let i = longPattern.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [longPattern[i], longPattern[j]] = [longPattern[j], longPattern[i]];
    }
    return longPattern;
  }, []);

  useEffect(() => {
    setSpinnerItems(generateSpinnerItems());
  }, [generateSpinnerItems]);

  useEffect(() => {
    if (status === 'spinning' && winningColor && spinnerItems.length > 0) {
      const targetIndices = spinnerItems
        .map((color, index) => (color === winningColor ? index : -1))
        .filter(index => index > spinnerItems.length - 40 && index < spinnerItems.length - 5);
      
      const targetIndex = targetIndices[Math.floor(Math.random() * targetIndices.length)];
      // ✨ CORRIGIDO: O desvio aleatório agora é menor para garantir que o ponteiro pare sobre a cor
      const randomOffset = (Math.random() - 0.5) * (COLOR_WIDTH * 0.6);
      // ✨ CORRIGIDO: O cálculo da posição final agora centra-se no meio da cor, não no início
      const finalPosition = (targetIndex * ITEM_WIDTH) + (COLOR_WIDTH / 2) + randomOffset;
      
      finalPositionRef.current = finalPosition;

      setSpinnerStyle({
        transform: `translateX(-${finalPosition}px)`,
        transition: 'transform 6s cubic-bezier(0.25, 1, 0.5, 1)',
      });
    }

    if (status === 'betting') {
      const newSpinnerItems = generateSpinnerItems();
      const patternLengthPixels = 15 * ITEM_WIDTH;
      const resetPosition = finalPositionRef.current % patternLengthPixels;
      
      setSpinnerItems(newSpinnerItems);
      setSpinnerStyle({
        transform: `translateX(-${resetPosition}px)`,
        transition: 'none',
      });

      setTimeout(() => {
        setSpinnerStyle(prevStyle => ({
          ...prevStyle,
          transition: 'transform 6s cubic-bezier(0.25, 1, 0.5, 1)',
        }));
      }, 50);
    }
  }, [status, winningColor, spinnerItems.length, generateSpinnerItems]);

  const renderContent = () => {
    if (status === 'betting') {
      return (
        <div className="text-center z-10">
          <h2 className="text-xl text-white mb-2">A apostar em...</h2>
          <p className="text-6xl font-mono font-bold text-yellow-400">{Math.max(0, timer).toFixed(1)}s</p>
        </div>
      );
    }
    return null;
  };
  
  const getColorClass = (color: string) => {
    if (color === 'red') return 'bg-red-600';
    if (color === 'black') return 'bg-zinc-800';
    return 'bg-gradient-to-br from-white to-gray-300';
  };

  return (
    <div className="bg-black/30 backdrop-blur-md border-y-2 border-white/10 h-40 flex items-center overflow-hidden relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[100%] w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-yellow-400 z-20" />
      
      <div className="absolute left-0 flex h-full items-center" style={spinnerStyle}>
        {spinnerItems.map((color, index) => (
          <React.Fragment key={index}>
            <div className={`w-24 h-24 flex-shrink-0 ${getColorClass(color)} flex items-center justify-center`}>
              {color === 'white' && <Diamond className="text-black" />}
            </div>
            <div className="w-12 h-24 flex-shrink-0 flex items-center justify-center">
              <img src="/logo.png" alt="separator" className="h-6 w-6 opacity-20" />
            </div>
          </React.Fragment>
        ))}
      </div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-gradient-to-r from-zinc-900/80 via-transparent to-zinc-900/80">
        {renderContent()}
      </div>
    </div>
  );
};

export default DoubleDisplay;
