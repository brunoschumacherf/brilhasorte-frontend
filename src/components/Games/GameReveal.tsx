import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getGameDetails, revealGame } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import type { PrizeAttributes } from '../../types';
import ScratchCardComponent from 'react-scratchcard-v2';

const GameReveal: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { updateBalance, user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState('');
  
  const [wonPrize, setWonPrize] = useState<PrizeAttributes | null>(null);
  const [possiblePrizes, setPossiblePrizes] = useState<PrizeAttributes[]>([]);

  useEffect(() => {
    const fetchGameData = async () => {
      if (!gameId) {
        setError("ID do jogo não encontrado.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError('');
      try {
        const response = await getGameDetails(gameId);
        const game = response.data.data.attributes;
        const includedData = response.data.included || [];
        
        const wonPrizeData = includedData.find((item: any) => item.type === 'prize' && item.id === response.data.data.relationships.prize.data.id)?.attributes;
        if (!wonPrizeData) throw new Error("Prêmio do jogo não encontrado.");
        setWonPrize(wonPrizeData);
        
        if (game.scratch_card_prize && Array.isArray(game.scratch_card_prize)) {
          const allPrizes = [...game.scratch_card_prize].sort((a, b) => b.value_in_cents - a.value_in_cents);
          setPossiblePrizes(allPrizes);
        }

        if (game.status === 'finished') {
          setIsRevealed(true);
        } else {
          setIsPending(true);
        }
      } catch (err: any) {
        setError(err.response?.data?.error || "Não foi possível carregar o jogo.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGameData();
  }, [gameId]);

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

  const renderPrizeResult = () => {
    if (!wonPrize) return null;
    const hasWon = wonPrize.value_in_cents > 0;

    return (
      <div className={`w-full h-full flex flex-col items-center justify-center rounded-lg text-center p-4 ${hasWon ? 'bg-yellow-500 bg-opacity-10' : 'bg-gray-500 bg-opacity-10'}`}>
        {wonPrize.image_url ? (
          <img src={wonPrize.image_url} alt={wonPrize.name} className="max-h-24 object-contain mb-2" />
        ) : (
          <p className={`text-4xl font-bold ${hasWon ? 'text-[var(--primary-gold)]' : 'text-[var(--text-secondary)]'}`}>
            {hasWon ? `R$ ${(wonPrize.value_in_cents / 100).toFixed(2)}` : 'Tente Novamente'}
          </p>
        )}
        <p className="text-md font-semibold text-[var(--text-primary)] mt-2">{wonPrize.name}</p>
      </div>
    );
  };

  const renderContent = () => {
    if (isLoading) return <p className="text-center text-[var(--text-secondary)]">Carregando Jogo...</p>;
    if (error) return <p className="text-center text-red-400">{error}</p>;

    if (isRevealed) {
      return (
        <>
          <h2 className="text-3xl font-bold mb-4 text-[var(--primary-gold)]">
            {wonPrize && wonPrize.value_in_cents > 0 ? `Você ganhou!` : 'Não foi desta vez!'}
          </h2>
          {renderPrizeResult()}
          <button onClick={() => navigate('/games')} className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">
            Jogar Novamente
          </button>
        </>
      );
    }
    
    if (isPending && wonPrize) {
      return (
        <>
          <h2 className="text-2xl font-bold mb-2 text-white">Sua Raspadinha</h2>
          <p className="text-[var(--text-secondary)] mb-6">Raspe para revelar seu prêmio!</p>
          <div className="scratchcard-container w-full aspect-video mx-auto rounded-lg shadow-inner overflow-hidden cursor-pointer border-2 border-dashed border-[var(--border-color)]">
            <ScratchCardComponent
              width={320}
              height={180}
              cover_image="/scratch-overlay-dark.png"
              percent_to_finish={70}
              on_finish={onScratchComplete}
            >
              {renderPrizeResult()}
            </ScratchCardComponent>
          </div>
          
          <div className="w-full mt-6">
            <h3 className="text-lg font-semibold text-white mb-3">Prêmios Possíveis</h3>
            <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
              {possiblePrizes.map(prize => (
                <div key={prize.id} className="flex justify-between items-center bg-black bg-opacity-20 p-2 rounded-md text-left">
                  <div className="flex items-center">
                    {prize.image_url && <img src={prize.image_url} alt={prize.name} className="h-8 w-8 object-contain mr-3 rounded-sm" />}
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">{prize.name}</p>
                      <p className="text-xs text-green-400 font-semibold">R$ {(prize.value_in_cents / 100).toFixed(2)}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono px-2 py-1 rounded bg-gray-700 text-gray-300">{(prize.probability * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </>
      );
    }

    return null;
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="w-full max-w-sm bg-[var(--surface-dark)] border border-[var(--border-color)] rounded-lg shadow-2xl p-6 text-center">
        {renderContent()}
      </div>
    </div>
  );
};

export default GameReveal;
