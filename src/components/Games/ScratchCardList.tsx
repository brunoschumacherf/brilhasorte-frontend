import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getScratchCards, createGame } from '../../services/api';
import type { ScratchCard } from '../../types';
import { toast } from 'react-toastify';

const AlertIcon = () => (
    <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
);
const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <svg className="animate-spin h-10 w-10 mb-4 text-[var(--primary-gold)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <p className="text-lg">Carregando raspadinhas...</p>
    </div>
);

interface CardProps {
  card: ScratchCard;
  onBuyCard: (card: ScratchCard) => void;
}

const Card: React.FC<CardProps> = ({ card, onBuyCard }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const shineRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={cardRef}
      className="relative w-full h-96 rounded-2xl overflow-hidden border border-white/10 transition-shadow duration-300 hover:shadow-2xl hover:shadow-yellow-500/20"
      style={{ perspective: '1000px' }}
      onMouseMove={(e) => {
        const cardEl = cardRef.current;
        const shineEl = shineRef.current;
        if (!cardEl || !shineEl) return;

        const rect = cardEl.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const rotateY = -1 * ((x - rect.width / 2) / (rect.width / 2)) * 8;
        const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * 8;
        cardEl.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg) scale(1.05)`;

        shineEl.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255, 255, 255, 0.2) 0%, transparent 50%)`;
      }}
      onMouseLeave={() => {
        const cardEl = cardRef.current;
        const shineEl = shineRef.current;
        if (!cardEl || !shineEl) return;
        cardEl.style.transform = 'rotateY(0) rotateX(0) scale(1)';
        shineEl.style.background = 'transparent';
      }}
    >
      {card.image_url ? (
        <img src={card.image_url} alt={card.name} className="absolute inset-0 w-full h-full object-cover z-0" />
      ) : (
        <div className="absolute inset-0 w-full h-full bg-gray-900 z-0"></div>
      )}
      
      <div className="absolute inset-0 w-full h-full bg-gradient-to-t from-black/70 via-black/30 to-black/10"></div>
      <div ref={shineRef} className="absolute inset-0 w-full h-full z-10 transition-all duration-200"></div>

      <div className="relative h-full p-6 flex flex-col justify-between z-20">
        <div>
          <h3 className="text-2xl font-bold text-white truncate" style={{ textShadow: '0 2px 4px #000' }}>
            {card.name}
          </h3>
          <p className="text-3xl font-bold text-[var(--primary-gold)]" style={{ textShadow: '0 2px 4px #000' }}>
            R$ {(card.price_in_cents / 100).toFixed(2).replace('.', ',')}
          </p>
        </div>
        
        <button
          onClick={() => onBuyCard(card)}
          className="w-full bg-[var(--primary-gold)] text-black font-bold py-3 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-yellow-400/30"
        >
          Jogar Agora
        </button>
      </div>
    </div>
  );
};


const ScratchCardList: React.FC = () => {
  const [scratchCards, setScratchCards] = useState<ScratchCard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    getScratchCards()
      .then(response => {
        const formattedCards = response.data.data
          .filter(card => card.attributes.price_in_cents > 0)
          .map(card => card.attributes);
        
        setScratchCards(formattedCards);
      })
      .catch(() => {
        setError('Não foi possível carregar as raspadinhas.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleBuyCard = async (card: ScratchCard) => {
    try {
      const result = await createGame(String(card.id));
      const gameId = result.data.data.id;
      navigate(`/games/${gameId}`);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Erro ao comprar. Saldo insuficiente ou jogo indisponível.';
      toast.error(errorMessage);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return (
    <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg flex items-center justify-center m-4">
      <AlertIcon />
      <span>{error}</span>
    </div>
  );

  return (
    <div className="relative overflow-hidden min-h-screen w-full bg-[#101010] py-16">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full filter blur-3xl opacity-50 animate-blob"></div>
      <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

      <div className="container mx-auto px-4 relative z-10">
        
        <h2 className="text-4xl font-bold mb-4 text-center text-white tracking-tight">
          Raspadinhas Premium
        </h2>
        <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
          Escolha sua sorte em nossa coleção de raspadinhas exclusivas.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {scratchCards.map(card => (
            <Card key={card.id} card={card} onBuyCard={handleBuyCard} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScratchCardList;