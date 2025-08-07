import React, { useRef, useEffect, useState } from 'react';

interface CustomScratchCardProps {
  width: number;
  height: number;
  coverImage: string;
  percentToFinish?: number;
  onFinish?: () => void;
  children: React.ReactNode;
}

const CustomScratchCard: React.FC<CustomScratchCardProps> = ({
  width,
  height,
  coverImage,
  onFinish,
  percentToFinish = 70,
  children,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const [isFinished, setIsFinished] = useState(false);

  // ... (funções getPosition, scratch, checkCompletion não mudam) ...
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
    if (isFinished || !onFinish) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { willReadFrequently: true });
    if (!canvas || !ctx) return;

    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;
    const totalPixels = pixels.length / 4;
    let transparentPixels = 0;

    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) {
        transparentPixels++;
      }
    }

    const percent = (transparentPixels / totalPixels) * 100;
    
    if (percent >= percentToFinish) {
      setIsFinished(true);
      onFinish();
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    // Sucesso: A imagem foi carregada, desenhe-a.
    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height);
    };

    // ✨ FALHA: A imagem não foi encontrada.
    img.onerror = () => {
      console.error(`ERRO: A imagem da raspadinha não foi encontrada em '${coverImage}'. Verifique se o arquivo está na pasta /public.`);
      // Desenha um fundo cinza para que não fique transparente.
      ctx.fillStyle = '#888888'; // Cor de fallback
      ctx.fillRect(0, 0, width, height);
    };
    
    img.src = coverImage;
  }, [coverImage, width, height]);
  
  // ... (funções handleStart, handleMove, handleEnd e o JSX de retorno não mudam) ...
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
};

export default CustomScratchCard;