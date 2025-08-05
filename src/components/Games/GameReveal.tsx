import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { revealGame } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

// Definindo o tipo para os atributos do prêmio para clareza
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

  const [isRevealed, setIsRevealed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [prize, setPrize] = useState<PrizeAttributes | null>(null);

  const handleReveal = async () => {
    if (!gameId) {
      setError("ID do jogo não encontrado.");
      return;
    }
    setIsLoading(true);
    setError('');
    const response = await revealGame(gameId);
    // Encontra o prêmio nos dados incluídos da resposta da API
    const revealedPrize = response.data.included.find((item: any) => item.type === 'prize')?.attributes;
    
    if (!revealedPrize) {
      throw new Error("Não foi possível carregar os detalhes do prêmio.");
    }

    setPrize(revealedPrize);
    setIsRevealed(true);

    // Atualiza o saldo do usuário no contexto global
    if (user && revealedPrize.value_in_cents > 0) {
      const newBalance = user.balance_in_cents + revealedPrize.value_in_cents;
      updateBalance(newBalance);
    }
  };

  const renderPrize = () => {
    if (!prize) return null;

    const wonPrize = prize.value_in_cents > 0;

    return (
      <div className={`text-center p-8 rounded-lg ${wonPrize ? 'bg-green-100' : 'bg-gray-100'}`}>
        <h2 className="text-3xl font-bold mb-4">
          {wonPrize ? `Parabéns! Você ganhou!` : 'Que pena!'}
        </h2>

        {/* --- LÓGICA DE EXIBIÇÃO DA IMAGEM --- */}
        {prize.image_url ? (
          <div className="my-4 flex justify-center">
            <img 
              src={prize.image_url} 
              alt={prize.name} 
              className="max-w-xs max-h-48 object-contain rounded-lg"
            />
          </div>
        ) : (
          <p className={`text-5xl font-bold my-4 ${wonPrize ? 'text-green-600' : 'text-gray-700'}`}>
            {wonPrize ? `R$ ${(prize.value_in_cents / 100).toFixed(2)}` : 'Não foi desta vez'}
          </p>
        )}
        {/* --- FIM DA LÓGICA --- */}

        <p className="text-lg text-gray-800 font-semibold">{prize.name}</p>
        
        {wonPrize && prize.image_url && (
            <p className="text-3xl font-bold mt-2 text-green-600">
                R$ {(prize.value_in_cents / 100).toFixed(2)}
            </p>
        )}

        <button
          onClick={() => navigate('/games')}
          className="mt-8 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
        >
          Jogar Novamente
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-md bg-white rounded-lg shadow-2xl">
        {isRevealed ? (
          renderPrize()
        ) : (
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold mb-4">Sua Raspadinha</h2>
            <p className="text-gray-600 mb-8">Clique no botão abaixo para revelar seu prêmio. Boa sorte!</p>
            
            {/* Área interativa da raspadinha */}
            <div className="w-full h-40 bg-gray-300 mx-auto rounded-lg flex items-center justify-center mb-8 shadow-inner cursor-pointer" onClick={handleReveal}>
              <span className="text-gray-500 font-bold text-lg">Raspe Aqui!</span>
            </div>
            
            <button
              onClick={handleReveal}
              disabled={isLoading}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-gray-400"
            >
              {isLoading ? 'Revelando...' : 'Revelar Prêmio'}
            </button>
            {error && <p className="text-red-500 mt-4">{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default GameReveal;