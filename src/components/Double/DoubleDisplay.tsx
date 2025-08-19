import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Diamond } from 'lucide-react';

interface DoubleDisplayProps {
  status: 'betting' | 'spinning' | 'completed' | 'idle';
  timer: number;
  winningColor?: 'black' | 'red' | 'white';
}

const COLOR_WIDTH = 96; // w-24
const GAP_WIDTH = 8;    // gap-2
const ITEM_WIDTH = COLOR_WIDTH + GAP_WIDTH; // 104px

const DoubleDisplay: React.FC<DoubleDisplayProps> = ({ status, timer, winningColor }) => {
  const [spinnerItems, setSpinnerItems] = useState<string[]>([]);
  const [spinnerStyle, setSpinnerStyle] = useState({});
  const finalPositionRef = useRef(0);

  const generateSpinnerItems = useCallback(() => {
    const basePattern = [
      ...Array(7).fill('red'), 
      ...Array(7).fill('black'), 
      'white'
    ]; // 15 items
    // Repetir o padrão para garantir uma lista longa o suficiente
    const longPattern = Array.from({ length: 15 }, () => basePattern).flat(); // 225 items
    // Embaralhar para não ser previsível (opcional, mas bom para a estética)
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
      // Encontra índices válidos para a cor vencedora perto do final da lista
      const targetIndices = spinnerItems
        .map((color, index) => (color === winningColor ? index : -1))
        // Garantir que o alvo esteja longe o suficiente para uma boa animação
        .filter(index => index > spinnerItems.length - 50 && index < spinnerItems.length - 10);
      
      if (targetIndices.length === 0) {
        console.error(`Não foi possível encontrar um item da cor "${winningColor}" na posição final do carrossel.`);
        // Lógica de fallback, talvez resetar ou usar o primeiro item que encontrar
        return;
      }

      const targetIndex = targetIndices[Math.floor(Math.random() * targetIndices.length)];
      
      // Desvio aleatório para não parar sempre no mesmo ponto exato do item
      // Garante que o ponteiro pare dentro dos 80% centrais do item
      const randomOffset = (Math.random() - 0.5) * (COLOR_WIDTH * 0.8);

      // Calcula a coordenada do centro do item vencedor
      // A fórmula é: (posição do início do item) + (metade da largura do item) + (desvio aleatório)
      const finalPosition = (targetIndex * ITEM_WIDTH) + (COLOR_WIDTH / 2) + randomOffset;
      
      finalPositionRef.current = finalPosition;

      setSpinnerStyle({
        transform: `translateX(-${finalPosition}px)`,
        transition: 'transform 7s cubic-bezier(0.2, 1, 0.3, 1)',
      });
    }

    if (status === 'betting') {
      // Lógica para resetar o carrossel suavemente para a próxima rodada
      const resetTimeout = setTimeout(() => {
        const newSpinnerItems = generateSpinnerItems();
        const patternLengthPixels = 15 * ITEM_WIDTH;
        const resetPosition = finalPositionRef.current % patternLengthPixels;
        
        setSpinnerItems(newSpinnerItems);
        // Move para a posição de reset sem animação
        setSpinnerStyle({
          transform: `translateX(-${resetPosition}px)`,
          transition: 'none',
        });

        // Reativa a transição para futuras animações
        setTimeout(() => {
          setSpinnerStyle(prevStyle => ({
            ...prevStyle,
            transition: 'transform 7s cubic-bezier(0.2, 1, 0.3, 1)',
          }));
        }, 50);
      }, 1500);

      return () => clearTimeout(resetTimeout);
    }
  }, [status, winningColor, spinnerItems.length, generateSpinnerItems]);

  const renderContent = () => {
    if (status === 'betting' && timer > 0) {
      return (
        <div className="text-center z-10">
          <h2 className="text-xl text-white mb-2">A apostar em...</h2>
          <p className="text-6xl font-mono font-bold text-yellow-400">{Math.ceil(timer)}s</p>
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
      {/* Ponteiro central */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[100%] w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-yellow-400 z-20" />
      <div className="absolute left-1/2 flex h-full items-center gap-2" style={spinnerStyle}>
        {spinnerItems.map((color, index) => (
          <div
            key={index}
            className={`w-24 h-24 flex-shrink-0 rounded-lg ${getColorClass(color)} flex items-center justify-center`}
          >
            {color === 'white' && <Diamond className="text-black" />}
          </div>
        ))}
      </div>

      {/* Overlay de gradiente e conteúdo */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-gradient-to-r from-zinc-900/80 via-transparent to-zinc-900/80">
        {renderContent()}
      </div>
    </div>
  );
};

export default DoubleDisplay;