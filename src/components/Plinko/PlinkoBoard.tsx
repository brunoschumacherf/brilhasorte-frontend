import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { PlinkoGame } from '../../types';

interface BallState {
  x: number; y: number; vy: number;
  path: ('L' | 'R')[];
  pathIndex: number;
  gameId: number;
  color: string;
}

interface PlinkoBoardProps {
  rows: number;
  balls: PlinkoGame[];
  onAnimationComplete: (gameId: number) => void;
  setBoardDimensions: (dims: { rowHeight: number, topPadding: number, width: number, pegSpacingX: number }) => void;
}

const LERP_FACTOR = 0.035;
const GRAVITY = 0.09;
const BALL_COLORS = ['#FBBF24', '#34D399', '#60A5FA', '#F472B6'];

const PlinkoBoard: React.FC<PlinkoBoardProps> = ({ rows, balls, onAnimationComplete, setBoardDimensions }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationStates = useRef(new Map<number, BallState>());
  const [dimensions, setDimensions] = useState({ width: 600, height: 550 });
  const plinkAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    plinkAudioRef.current = new Audio('/sounds/plink.mp3');
    plinkAudioRef.current.preload = 'auto';
  }, []);

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
    
    const totalPyramidWidth = width * 0.9;
    const pegSpacingX = totalPyramidWidth / (rows + 1);
    
    const topPadding = height * 0.1;

    setBoardDimensions({ rowHeight, topPadding, width, pegSpacingX });

    let frameId: number;

    const drawPegs = () => {
      for (let row = 0; row < rows; row++) {
        const numPegs = row + 2;
        const y = topPadding + row * rowHeight;
        const pegRowWidth = (numPegs - 1) * pegSpacingX;
        for (let col = 0; col < numPegs; col++) {
          const x = (width / 2) - (pegRowWidth / 2) + col * pegSpacingX;
          const gradient = ctx.createRadialGradient(x - pinSize * 0.2, y - pinSize * 0.2, 0, x, y, pinSize);
          gradient.addColorStop(0, '#E5E7EB');
          gradient.addColorStop(1, '#9CA3AF');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(x, y, pinSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const drawBall = (ballState: BallState) => {
      const gradient = ctx.createRadialGradient(ballState.x - ballSize * 0.3, ballState.y - ballSize * 0.3, ballSize * 0.1, ballState.x, ballState.y, ballSize);
      gradient.addColorStop(0, 'white');
      gradient.addColorStop(0.4, ballState.color);
      ctx.fillStyle = gradient;
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
          const numRightMoves = ball.path.slice(0, ball.pathIndex + 1).filter(d => d === 'R').length;
          const numLeftMoves = (ball.pathIndex + 1) - numRightMoves;
          const xOffset = (numRightMoves - numLeftMoves) * (pegSpacingX / 2);
          targetX = width / 2 + xOffset;
          
          const targetY = topPadding + ball.pathIndex * rowHeight;
          if (ball.y < targetY) {
            ball.x += (targetX - ball.x) * LERP_FACTOR * 2;
          }
          if (ball.y >= targetY) {
            ball.pathIndex++;
            if (plinkAudioRef.current) {
                plinkAudioRef.current.currentTime = 0;
                plinkAudioRef.current.play().catch(e => {});
            }
          }
        } else {
          const finalNumRightMoves = ball.path.filter(d => d === 'R').length;
          const totalSlotsWidth = (rows + 1) * pegSpacingX;
          targetX = (width / 2) - (totalSlotsWidth / 2) + (finalNumRightMoves * pegSpacingX) + (pegSpacingX / 2);
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

    balls.forEach((game, index) => {
      if (!animationStates.current.has(game.id)) {
        animationStates.current.set(game.id, {
          x: width / 2 + (Math.random() - 0.5) * 10,
          y: 0, vy: 0,
          path: game.path, pathIndex: 0, gameId: game.id,
          color: BALL_COLORS[index % BALL_COLORS.length],
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
