import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getGameDetails, revealGame } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

interface PrizeAttributes {
  id: number;
  name: string;
  value_in_cents: number;
  image_url: string | null;
}

const GameReveal: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { updateBalance, user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [error, setError] = useState('');
  const [prize, setPrize] = useState<PrizeAttributes | null>(null);

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
        const prizeData = includedData.find((item: any) => item.type === 'prize')?.attributes;
        
        if (!prizeData) {
          throw new Error("Detalhes do prêmio não foram encontrados na resposta da API.");
        }

        setPrize(prizeData);

        if (game.status === 'finished') {
          setIsRevealed(true);
        }
      } catch (err: any) {
        setError(err.response?.data?.error || "Não foi possível carregar o jogo.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGameData();
  }, [gameId]);

  const handleReveal = async () => {
    if (!gameId) return;

    setIsRevealing(true);
    try {
      const response = await revealGame(gameId);
      const revealedPrize = response.data.included?.find((item: any) => item.type === 'prize')?.attributes;
      
      if (user && revealedPrize && revealedPrize.value_in_cents > 0) {
        const newBalance = user.balance_in_cents + revealedPrize.value_in_cents;
        updateBalance(newBalance);
        toast.success(`Você ganhou R$ ${(revealedPrize.value_in_cents / 100).toFixed(2)}!`);
      }
      setIsRevealed(true); // Mostra o resultado
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Ocorreu um erro ao revelar o prêmio.");
    } finally {
      setIsRevealing(false);
    }
  };

  const renderPrizeContent = () => {
    if (!prize) return null;
    const wonPrize = prize.value_in_cents > 0;

    return (
      <div className={`w-full h-full flex flex-col items-center justify-center rounded-lg text-center ${wonPrize ? 'bg-yellow-500 bg-opacity-10' : 'bg-gray-500 bg-opacity-10'}`}>
        {prize.image_url ? (
          <img src={prize.image_url} alt={prize.name} className="max-h-24 object-contain mb-2" />
        ) : (
          <p className={`text-4xl font-bold ${wonPrize ? 'text-[var(--primary-gold)]' : 'text-[var(--text-secondary)]'}`}>
            {wonPrize ? `R$ ${(prize.value_in_cents / 100).toFixed(2)}` : 'Tente Novamente'}
          </p>
        )}
        <p className="text-md font-semibold text-[var(--text-primary)] mt-2">{prize.name}</p>
      </div>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return <p className="text-center text-[var(--text-secondary)]">Carregando Jogo...</p>;
    }

    if (error) {
      return <p className="text-center text-red-400">{error}</p>;
    }

    if (isRevealed) {
      return (
        <>
          <h2 className="text-3xl font-bold mb-4 text-[var(--primary-gold)]">
            {prize && prize.value_in_cents > 0 ? `Você ganhou!` : 'Não foi desta vez!'}
          </h2>
          {renderPrizeContent()}
          <button
            onClick={() => navigate('/games')}
            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
          >
            Jogar Novamente
          </button>
        </>
      );
    }
    
    return (
      <>
        <h2 className="text-2xl font-bold mb-2 text-white">Sua Raspadinha</h2>
        <p className="text-[var(--text-secondary)] mb-6">Clique no botão abaixo para revelar seu prêmio!</p>
        <div className="w-full aspect-video mx-auto rounded-lg shadow-inner bg-black bg-opacity-20 flex items-center justify-center mb-6 border-2 border-dashed border-[var(--border-color)]">
            <span className="text-gray-500 font-bold text-lg">Prêmio Oculto</span>
        </div>
        <button
          onClick={handleReveal}
          disabled={isRevealing}
          className="w-full bg-[var(--primary-gold)] text-black font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-yellow-500/20 hover:bg-yellow-300 disabled:bg-gray-500"
        >
          {isRevealing ? 'Revelando...' : 'Revelar Prêmio'}
        </button>
      </>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="w-full max-w-sm bg-[var(--surface-dark)] border border-[var(--border-color)] rounded-lg shadow-2xl p-8 text-center min-h-[420px]">
        {renderContent()}
      </div>
    </div>
  );
};

export default GameReveal;
