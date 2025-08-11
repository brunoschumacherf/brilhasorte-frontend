import React, { useState, useEffect, useCallback } from 'react';
import { getRankings, type RankingPeriod } from '../../services/api';
import type { RankingItem } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Award, BarChart3 } from 'lucide-react';

const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
            <Trophy className="h-12 w-12 text-[var(--primary-gold)]" />
        </motion.div>
        <p className="mt-4 text-lg">A carregar o Hall da Fama...</p>
    </div>
);

const EmptyState = () => (
    <div className="text-center py-16 bg-black/20 border border-white/10 rounded-2xl">
        <div className="mx-auto h-16 w-16 text-gray-500 bg-white/5 rounded-full flex items-center justify-center">
            <BarChart3 size={32} />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-white">Nenhum ranking disponível</h3>
        <p className="mt-2 text-sm text-gray-400">Jogue para ter a oportunidade de aparecer aqui!</p>
    </div>
);

// --- COMPONENTE PRINCIPAL DA PÁGINA DE RANKINGS ---
const RankingsPage: React.FC = () => {
    const [period, setPeriod] = useState<RankingPeriod>('weekly');
    const [rankings, setRankings] = useState<RankingItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchRankings = useCallback((currentPeriod: RankingPeriod) => {
        setLoading(true);
        setError('');
        getRankings(currentPeriod)
            .then(response => setRankings(response.data.ranking))
            .catch(() => setError('Não foi possível carregar os rankings.'))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        fetchRankings(period);
    }, [period, fetchRankings]);

    const formatCurrency = (valueInCents: number) => {
        const value = valueInCents / 100;
        return value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        });
    };

    const periodLabels: { key: RankingPeriod; label: string }[] = [
        { key: 'daily', label: 'Diário' },
        { key: 'weekly', label: 'Semanal' },
        { key: 'monthly', label: 'Mensal' },
        { key: 'all_time', label: 'Geral' },
    ];

    const topThree = rankings.slice(0, 3);
    const restOfRankings = rankings.slice(3);

    const podiumConfig = [
        { icon: <Trophy size={24} />, color: 'text-yellow-400', ring: 'ring-yellow-400' },
        { icon: <Medal size={24} />, color: 'text-gray-300', ring: 'ring-gray-300' },
        { icon: <Award size={24} />, color: 'text-yellow-600', ring: 'ring-yellow-600' },
    ];

    return (
        <div className="relative min-h-screen bg-[#101010] p-4 sm:p-6 lg:p-8 overflow-hidden">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full filter blur-3xl opacity-50 animate-blob"></div>
            <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

            <div className="container mx-auto max-w-4xl relative z-10">
                <div className="bg-black/30 backdrop-blur-md border border-white/10 shadow-2xl rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-white/10 text-center">
                        <h1 className="text-3xl font-bold text-white">Hall da Fama</h1>
                        <p className="text-sm text-gray-400 mt-1">Veja os jogadores com os maiores prémios.</p>
                    </div>

                    <div className="p-6">
                        <div className="flex justify-center bg-black/20 p-1 rounded-full border border-white/10 mb-8">
                            {periodLabels.map(({ key, label }) => (
                                <button
                                    key={key}
                                    onClick={() => setPeriod(key)}
                                    className={`w-full px-4 py-2 text-sm font-semibold rounded-full transition-colors relative ${period === key ? 'text-black' : 'text-gray-300 hover:bg-white/5'}`}
                                >
                                    {period === key && (
                                        <motion.div
                                            layoutId="active-ranking-tab"
                                            className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full"
                                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                    <span className="relative z-10">{label}</span>
                                </button>
                            ))}
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={period}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                {loading ? <LoadingSpinner /> :
                                 error ? <p className="text-center text-red-400">{error}</p> :
                                 rankings.length > 0 ? (
                                    <div className="space-y-6">
                                        {/* Pódio */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {topThree.map((player, index) => (
                                                <div key={player.user_id} className={`bg-white/5 p-4 rounded-lg text-center ring-2 ring-opacity-50 ${podiumConfig[index].ring}`}>
                                                    <div className={`mx-auto h-12 w-12 rounded-full flex items-center justify-center mb-3 ${podiumConfig[index].color}`}>
                                                        {podiumConfig[index].icon}
                                                    </div>
                                                    <p className="font-bold text-white truncate">{player.full_name}</p>
                                                    <p className={`font-semibold text-lg ${podiumConfig[index].color}`}>
                                                        {formatCurrency(player.total_winnings)}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>

                                        {restOfRankings.length > 0 && (
                                            <ul className="space-y-2">
                                                {restOfRankings.map((player, index) => (
                                                    <li key={player.user_id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                                                        <div className="flex items-center gap-4">
                                                            <span className="font-bold w-8 text-center text-gray-400">{index + 4}.</span>
                                                            <span className="font-medium text-white">{player.full_name}</span>
                                                        </div>
                                                        <span className="font-semibold text-green-400">
                                                            {formatCurrency(player.total_winnings)}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ) : <EmptyState />}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RankingsPage;
