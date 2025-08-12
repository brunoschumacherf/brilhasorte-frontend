import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGameHistory } from '../services/api';
import type { GameHistoryItem } from '../types'; 
import { motion } from 'framer-motion';
import { Ticket, Gamepad2, History, Trophy, Award } from 'lucide-react';

const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
            <Gamepad2 className="h-12 w-12 text-[var(--primary-gold)]" />
        </motion.div>
        <p className="mt-4 text-lg">A carregar os seus jogos...</p>
    </div>
);

const EmptyState = ({ icon, title, message, actionText, actionTo }: { icon: React.ReactNode, title: string, message: string, actionText?: string, actionTo?: string }) => {
    const navigate = useNavigate();
    return (
        <div className="text-center py-16 bg-black/20 border border-white/10 rounded-2xl">
            <div className="mx-auto h-16 w-16 text-gray-500 bg-white/5 rounded-full flex items-center justify-center">
                {icon}
            </div>
            <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
            <p className="mt-2 text-sm text-gray-400">{message}</p>
            {actionText && actionTo && (
                <motion.button
                    onClick={() => navigate(actionTo)}
                    className="mt-6 px-6 py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 text-black"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    {actionText}
                </motion.button>
            )}
        </div>
    );
};

const PendingGameCard = ({ game }: { game: ProcessedGame }) => {
    const navigate = useNavigate();
    const cardRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const cardEl = cardRef.current;
        if (!cardEl) return;
        const rect = cardEl.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const rotateY = -1 * ((x - rect.width / 2) / (rect.width / 2)) * 10;
        const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * 10;
        cardEl.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg) scale(1.05)`;
    };

    const handleMouseLeave = () => {
        const cardEl = cardRef.current;
        if (!cardEl) return;
        cardEl.style.transform = 'rotateY(0) rotateX(0) scale(1)';
    };
    console.log(game)

    return (
        <div style={{ perspective: '1000px' }}>
            <div
                ref={cardRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{ transformStyle: 'preserve-3d' }}
                className="bg-zinc-900/50 border border-white/10 rounded-xl p-5 flex flex-col justify-between h-48 transition-transform duration-300 ease-out"
            >
                <div>
                    <h3 className="text-lg font-bold text-white">{game.scratch_card.name}</h3>
                    <p className="text-xs text-gray-400 mt-1">Comprada em: {new Date(game.created_at).toLocaleDateString('pt-BR')}</p>
                </div>
                <motion.button 
                    onClick={() => navigate(`/games/${game.id}`)}
                    className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold py-2 px-4 rounded-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Raspar Agora
                </motion.button>
            </div>
        </div>
    );
};

const FinishedGameCard = ({ game }: { game: ProcessedGame }) => {
    const hasWon = game.winnings_in_cents > 0;
    return (
        <div className={`bg-white/5 p-4 rounded-lg flex items-center justify-between gap-4 border-l-4 ${hasWon ? 'border-green-500' : 'border-gray-600'}`}>
            <div className="flex items-center gap-4">
                <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${hasWon ? 'bg-green-500/10 text-green-400' : 'bg-gray-500/10 text-gray-400'}`}>
                    {hasWon ? <Trophy size={20} /> : <History size={20} />}
                </div>
                <div>
                    <p className="font-semibold text-white">{game.scratch_card.name}</p>
                    <p className="text-xs text-gray-400">{new Date(game.created_at).toLocaleString('pt-BR')}</p>
                </div>
            </div>
            <div className="text-right">
                <p className={`font-bold text-lg ${hasWon ? 'text-green-400' : 'text-white'}`}>
                    R$ {(game.winnings_in_cents / 100).toFixed(2)}
                </p>
                <p className="text-xs text-gray-400 flex items-center justify-end gap-1">
                    <Award size={12} /> {game.prize.name}
                </p>
            </div>
        </div>
    );
};

type ProcessedGame = GameHistoryItem & {
  status: 'pending' | 'finished';
  prize: { name: string };
  scratch_card: { name: string };
};

const MyGamesPage: React.FC = () => {
  const [pendingGames, setPendingGames] = useState<ProcessedGame[]>([]);
  const [finishedGames, setFinishedGames] = useState<ProcessedGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getGameHistory()
      .then(response => {
        const allGames: ProcessedGame[] = response.data.data.map((item: any) => {
          return {
            ...item.attributes,
            id: parseInt(item.id, 10),
            status: item.attributes.status,
            prize: { name: item.attributes?.prize.name },
            scratch_card: { name: item.attributes?.scratch_card.name },
          };
        });
        setPendingGames(allGames.filter(game => game.status === 'pending'));
        setFinishedGames(allGames.filter(game => game.status === 'finished'));
      })
      .catch(() => setError('Não foi possível carregar as suas raspadinhas.'))
      .finally(() => setLoading(false));
  }, []);

  const renderPendingGames = () => {
    if (loading) return <LoadingSpinner />;
    if (error) return <p className="text-red-400 text-center">{error}</p>;
    if (pendingGames.length === 0) {
        return <EmptyState 
            icon={<Ticket size={32} />}
            title="Nenhuma raspadinha pendente"
            message="As suas raspadinhas por abrir aparecerão aqui."
            actionText="Ver Raspadinhas"
            actionTo="/games"
        />;
    }
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingGames.map(game => <PendingGameCard key={game.id} game={game} />)}
        </div>
    );
  };

  const renderFinishedGames = () => {
    if (loading) return null;
    if (error) return null;
    if (finishedGames.length === 0) {
        return <EmptyState 
            icon={<History size={32} />}
            title="Nenhum jogo finalizado"
            message="O seu histórico de jogos finalizados aparecerá aqui."
        />;
    }
    return (
        <div className="space-y-3">
            {finishedGames.slice(0, 10).map(game => <FinishedGameCard key={game.id} game={game} />)}
        </div>
    );
  };

  return (
    <div className="relative min-h-screen bg-[#101010] p-4 sm:p-6 lg:p-8 overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full filter blur-3xl opacity-50 animate-blob"></div>
      <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

      <div className="container mx-auto max-w-6xl relative z-10 space-y-12">
        <div>
          <h2 className="text-3xl font-bold mb-6 text-white">Raspadinhas Pendentes</h2>
          {renderPendingGames()}
        </div>
        <div>
          <h2 className="text-3xl font-bold mb-6 text-white">Últimos Jogos Finalizados</h2>
          {renderFinishedGames()}
        </div>
      </div>
    </div>
  );
};

export default MyGamesPage;
