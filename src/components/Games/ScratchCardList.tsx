import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getScratchCards, createGame } from '../../services/api';
import type { ScratchCard } from '../../types';

const ScratchCardList: React.FC = () => {
  const [scratchCards, setScratchCards] = useState<ScratchCard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    getScratchCards()
      .then(response => {
        setScratchCards(response.data.data);
      })
      .catch(() => {
        setError('Não foi possível carregar as raspadinhas.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleBuyCard = async (cardId: string) => {
    try {
      const result = await createGame(cardId);
      const gameId = result.data.data.id;
      // Redireciona para a página do jogo com o ID específico
      navigate(`/games/${gameId}`);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao comprar a raspadinha. Saldo insuficiente?');
    }
  };

  if (loading) {
    return <p className="text-center mt-8 text-lg text-gray-600">Carregando raspadinhas...</p>;
  }

  if (error) {
    return <p className="bg-red-100 text-red-700 p-4 rounded-md text-center mt-8">{error}</p>;
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <h2 className="text-3xl font-bold mb-8 text-gray-800 text-center">Escolha sua Sorte</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {scratchCards.map(card => (
          <div 
            key={card.id} 
            className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 ease-in-out"
          >
            <div className="p-6 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{card.attributes.name}</h3>
              <p className="text-gray-700 text-xl font-semibold mb-6">
                R$ {(card.attributes.price_in_cents / 100).toFixed(2)}
              </p>
              <button
                onClick={() => handleBuyCard(card.id)}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg"
              >
                Comprar e Jogar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScratchCardList;