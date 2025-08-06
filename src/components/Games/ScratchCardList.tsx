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
    // Filtra para não mostrar a raspadinha de preço 0 (o jogo grátis)
    getScratchCards()
      .then(response => {
        const paidCards = response.data.data.filter(card => card.attributes.price_in_cents > 0);
        setScratchCards(paidCards);
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
      navigate(`/games/${gameId}`);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao comprar a raspadinha. Saldo insuficiente?');
    }
  };

  if (loading) {
    return <p className="text-center mt-8 text-lg text-[var(--text-secondary)]">Carregando raspadinhas...</p>;
  }

  if (error) {
    return <p className="bg-red-900 bg-opacity-30 text-red-300 p-4 rounded-md text-center mt-8">{error}</p>;
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-center text-[var(--text-primary)]">Raspadinhas</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {scratchCards.map(card => (
          <div 
            key={card.id} 
            className="group bg-[var(--surface-dark)] border border-[var(--border-color)] rounded-xl overflow-hidden transition-all duration-300 ease-in-out hover:border-[var(--primary-gold)] hover:shadow-2xl hover:shadow-yellow-500/10"
          >
            <div className="h-48 bg-black flex items-center justify-center overflow-hidden">
              {card.attributes.image_url ? (
                <img 
                  src={card.attributes.image_url} 
                  alt={card.attributes.name} 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
                />
              ) : (
                <span className="text-[var(--text-secondary)]">Sem Imagem</span>
              )}
            </div>
            
            <div className="p-5 text-center">
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-1 truncate">{card.attributes.name}</h3>
              <p className="text-[var(--primary-gold)] text-2xl font-semibold mb-5">
                R$ {(card.attributes.price_in_cents / 100).toFixed(2)}
              </p>
              <button
                onClick={() => handleBuyCard(card.id)}
                className="w-full bg-[var(--primary-gold)] text-black font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-yellow-500/20 hover:bg-yellow-300"
              >
                Jogar Agora
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScratchCardList;