import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { PlinkoGame } from '../../types';

interface BallState {
  x: number;
  y: number;
  vy: number;
  path: ('L' | 'R')[];
  pathIndex: number;
  gameId: number;
}

interface PlinkoBoardProps {
  rows: number;
  balls: PlinkoGame[];
  onAnimationComplete: (gameId: number) => void;
  setBoardDimensions: (dims: { rowHeight: number, topPadding: number, width: number, pegSpacingX: number }) => void;
}

const LERP_FACTOR = 0.035;
const GRAVITY = 0.09;

const PlinkoBoard: React.FC<PlinkoBoardProps> = ({ rows, balls, onAnimationComplete, setBoardDimensions }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationStates = useRef(new Map<number, BallState>());
  const [dimensions, setDimensions] = useState({ width: 600, height: 550 });

  const updateCanvasDimensions = useCallback(() => {
    if (containerRef.current) {
      const width = containerRef.current.offsetWidth;
      setDimensions({ width, height: width * 0.95 });
    }
  }, []);

  useEffect(() => {
    updateCanvasDimensions();
    window.addEventListener('resize', updateCanvasDimensions);
    return () => window.removeEventListener('resize', updateCanvasDimensions);
  }, [updateCanvasDimensions]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    const { width, height } = dimensions;
    const pinSize = Math.max(3, width / 110);
    const ballSize = Math.max(4.5, width / 85);
    const rowHeight = (height * 0.8) / rows;
    
    const horizontalSpacingFactor = rows > 12 ? 1.05 : 1.0;
    const pegSpacingX = rowHeight * horizontalSpacingFactor;
    
    const topPadding = height * 0.1;

    setBoardDimensions({ rowHeight, topPadding, width, pegSpacingX });

    let frameId: number;

    const drawPegs = () => {
      ctx.fillStyle = '#9CA3AF';
      for (let row = 0; row < rows; row++) {
        const numPegs = row + 1;
        const y = topPadding + row * rowHeight;
        const pegRowWidth = row * pegSpacingX;
        for (let col = 0; col < numPegs; col++) {
          const x = (width / 2) - (pegRowWidth / 2) + col * pegSpacingX;
          ctx.beginPath();
          ctx.arc(x, y, pinSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const drawBall = (ballState: BallState) => {
      ctx.fillStyle = '#FBBF24';
      ctx.beginPath();
      ctx.arc(ballState.x, ballState.y, ballSize, 0, Math.PI * 2);
      ctx.fill();
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      drawPegs();

      for (const [gameId, ball] of animationStates.current.entries()) {
        ball.vy += GRAVITY;
        ball.y += ball.vy;

        let targetX: number;

        if (ball.pathIndex < ball.path.length) {
            const targetRow = ball.pathIndex;
            const numRightMoves = ball.path.slice(0, targetRow + 1).filter(d => d === 'R').length;
            const pegRowWidth = targetRow * pegSpacingX;
            targetX = (width / 2) - (pegRowWidth / 2) + (numRightMoves - (ball.path[targetRow] === 'L' ? 1 : 0)) * pegSpacingX;
            
            const targetY = topPadding + targetRow * rowHeight;
            if(ball.y < targetY){
                ball.x += (targetX - ball.x) * LERP_FACTOR;
            }
            if (ball.y >= targetY) {
                ball.pathIndex++;
            }
        } else {
            const finalNumRightMoves = ball.path.filter(d => d === 'R').length;
            const lastRowPegWidth = (rows) * pegSpacingX;
            targetX = (width / 2) - (lastRowPegWidth / 2) + finalNumRightMoves * pegSpacingX;
            
            ball.x += (targetX - ball.x) * LERP_FACTOR;
            
            if (ball.y > height + ballSize) {
                onAnimationComplete(gameId);
                animationStates.current.delete(gameId);
            }
        }
        drawBall(ball);
      }
      frameId = requestAnimationFrame(animate);
    };

    balls.forEach(game => {
      if (!animationStates.current.has(game.id)) {
        animationStates.current.set(game.id, {
          x: width / 2,
          y: 0,
          vy: 0,
          path: game.path,
          pathIndex: 0,
          gameId: game.id,
        });
      }
    });

    animate();
    return () => cancelAnimationFrame(frameId);
  }, [rows, balls, onAnimationComplete, dimensions, setBoardDimensions]);

  return (
    <div ref={containerRef} className="w-full max-w-2xl">
      <canvas ref={canvasRef} />
    </div>
  );
};

export default PlinkoBoard;