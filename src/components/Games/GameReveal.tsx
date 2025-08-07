import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getGameDetails, revealGame } from '../../services/api'; // Ajuste o caminho se necessário
import { useAuth } from '../../contexts/AuthContext'; // Ajuste o caminho se necessário
import { toast } from 'react-toastify';
import type { PrizeAttributes } from '../../types'; // Ajuste o caminho se necessário
import CustomScratchCard from '../../components/CustomScratchCard'; // Ajuste o caminho se necessário

// Função auxiliar para embaralhar um array
const shuffleArray = (array: any[]) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Prêmios "dummy" para preencher a grade quando necessário
const DUMMY_PRIZES: PrizeAttributes[] = [
    { id: 'dummy1', name: 'Tente de Novo', value_in_cents: 0, image_url: null, probability: 0, stock: 0, scratch_card_id: 0, created_at: '', updated_at: '' },
    { id: 'dummy2', name: 'Que Pena', value_in_cents: 0, image_url: null, probability: 0, stock: 0, scratch_card_id: 0, created_at: '', updated_at: '' },
    { id: 'dummy3', name: 'Não Foi Desta Vez', value_in_cents: 0, image_url: null, probability: 0, stock: 0, scratch_card_id: 0, created_at: '', updated_at: '' }
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
  
  const [wonPrize, setWonPrize] = useState<PrizeAttributes | null>(null);
  const [possiblePrizes, setPossiblePrizes] = useState<PrizeAttributes[]>([]);
  const [gridPrizes, setGridPrizes] = useState<PrizeAttributes[]>([]);

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

        const prizeId = response.data.data.relationships.prize.data.id;
        const wonPrizeData = includedData.find((item: any) => item.type === 'prize' && item.id === prizeId)?.attributes;
        if (!wonPrizeData) throw new Error("Prêmio do jogo não encontrado.");
        setWonPrize(wonPrizeData);
        
        const allPossiblePrizes = game.scratch_card_prize || [];
        setPossiblePrizes(allPossiblePrizes);

        // ========================================================================
        // ✨ NOVA LÓGICA DE MONTAGEM DA GRADE - CORRIGIDA CONFORME AS REGRAS ✨
        // ========================================================================
        const gridSize = 9;
        const itemsToWin = 3;
        
        // 1. Inicia a grade com 3x o prêmio vencedor, garantindo a vitória.
        let grid = Array(itemsToWin).fill(wonPrizeData);

        // 2. Pega os outros prêmios (distratores), garantindo que cada um apareça no máximo uma vez.
        const distractors = allPossiblePrizes.filter(p => p.id !== wonPrizeData.id);
        for (const distractor of distractors) {
            if (grid.length < gridSize) {
                grid.push(distractor);
            }
        }
        
        // 3. Se a grade ainda não estiver cheia, completa com os prêmios "dummy".
        let dummyIndex = 0;
        while (grid.length < gridSize) {
            grid.push(DUMMY_PRIZES[dummyIndex % DUMMY_PRIZES.length]);
            dummyIndex++;
        }
        
        setGridPrizes(shuffleArray(grid));
        // ========================================================================

        // CORREÇÃO: Garante que o estado `isRevealed` seja false para jogos pendentes.
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

  const handleRevealApiCall = async () => {
    // ... (esta função não precisa de alteração)
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
    // ... (esta função não precisa de alteração)
    if (isPending && !isRevealing) {
      await handleRevealApiCall();
      setTimeout(() => {
        setIsRevealed(true);
        setIsPending(false);
      }, 500);
    }
  };
  
  const renderPrizeResult = () => {
    // ... (esta função não precisa de alteração)
    if (!wonPrize) return null;
    const hasWon = wonPrize.value_in_cents > 0;

    return (
      <div className="w-full text-center p-4">
         <h2 className={`text-3xl font-bold mb-4 ${hasWon ? 'text-[var(--primary-gold)]' : 'text-gray-400'}`}>
             {hasWon ? `Você ganhou!` : 'Não foi desta vez!'}
         </h2>
         <div className={`flex flex-col items-center justify-center rounded-lg p-4 ${hasWon ? 'bg-yellow-500 bg-opacity-10' : 'bg-gray-500 bg-opacity-10'}`}>
            {wonPrize.image_url && <img src={wonPrize.image_url} alt={wonPrize.name} className="max-h-24 object-contain mb-2" />}
            <p className="text-lg font-semibold text-[var(--text-primary)] mt-2">{wonPrize.name}</p>
            {hasWon && (
              <p className="text-2xl font-bold text-[var(--primary-gold)]">
                R$ {(wonPrize.value_in_cents / 100).toFixed(2)}
              </p>
            )}
         </div>
      </div>
    );
  };
  
  const renderScratchableGrid = () => {
    // ... (esta função não precisa de alteração)
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
      return (
        <>
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
          <h2 className="text-2xl font-bold mb-2 text-white">Encontre 3 iguais!</h2>
          <p className="text-[var(--text-secondary)] mb-6">Raspe a grade para revelar seu prêmio!</p>
          <div className="w-full max-w-[320px] aspect-square mx-auto rounded-lg shadow-inner overflow-hidden border-2 border-dashed border-[var(--border-color)]">
            <CustomScratchCard
              width={320}
              height={320}
              coverImage="/scratch-overlay-dark.png"
              percentToFinish={40}
              onFinish={onScratchComplete}
            >
              {renderScratchableGrid()}
            </CustomScratchCard>
          </div>
          
          {/* CORREÇÃO: Adicionando a lista de prêmios possíveis de volta */}
          {possiblePrizes.length > 0 && (
            <div className="w-full mt-6">
                <h3 className="text-lg font-semibold text-white mb-3">Prêmios da Rodada</h3>
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