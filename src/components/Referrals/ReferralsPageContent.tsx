import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getReferrals } from '../../services/api';
import type { Referee } from '../../types';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Users, Copy, Check, Clock, Gift, CheckCircle2 } from 'lucide-react';

const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
            <Users className="h-12 w-12 text-[var(--primary-gold)]" />
        </motion.div>
        <p className="mt-4 text-lg">A carregar a sua lista de afiliados...</p>
    </div>
);

const EmptyState = () => (
    <div className="text-center py-12 bg-black/20 border border-white/10 rounded-2xl">
        <div className="mx-auto h-16 w-16 text-gray-500 bg-white/5 rounded-full flex items-center justify-center">
            <Users size={32} />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-white">Nenhum indicado ainda</h3>
        <p className="mt-2 text-sm text-gray-400">Partilhe o seu código para começar a ganhar bónus!</p>
    </div>
);

const ReferralsPage: React.FC = () => {
    const { user } = useAuth();
    const [referrals, setReferrals] = useState<Referee[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        getReferrals()
            .then(response => {
                const referralData = response.data.data.map((item: any) => item.attributes);
                setReferrals(referralData);
            })
            .catch(() => setError('Não foi possível carregar a sua lista de afiliados.'))
            .finally(() => setLoading(false));
    }, []);

    const handleCopyCode = () => {
        if (user?.referral_code) {
            navigator.clipboard.writeText(user.referral_code);
            toast.success('Código de referência copiado!');
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

    const renderReferralsList = () => {
        if (loading) return <LoadingSpinner />;
        if (error) return <p className="text-center text-red-400">{error}</p>;
        if (referrals.length === 0) return <EmptyState />;

        return (
            <div className="space-y-3">
                {referrals.map((referee, index) => (
                    <motion.div
                        key={referee.id}
                        className="bg-white/5 p-4 rounded-lg flex items-center justify-between gap-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <div>
                            <p className="font-medium text-white">{referee.full_name || 'Utilizador Anónimo'}</p>
                            <p className="text-xs text-gray-400">Registado em: {new Date(referee.created_at).toLocaleDateString('pt-BR')}</p>
                        </div>
                        {referee.has_deposited ? (
                            <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full text-green-400 bg-green-500/10">
                                <CheckCircle2 size={16} />
                                <span>Bónus Ativo</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full text-yellow-400 bg-yellow-500/10">
                                <Clock size={16} />
                                <span>Aguardando Depósito</span>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
        );
    };

    return (
        <div className="relative min-h-screen bg-[#101010] p-4 sm:p-6 lg:p-8 overflow-hidden">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full filter blur-3xl opacity-50 animate-blob"></div>
            <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

            <div className="container mx-auto max-w-6xl relative z-10">
                <div className="bg-black/30 backdrop-blur-md border border-white/10 shadow-2xl rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-white/10 text-center">
                        <h1 className="text-3xl font-bold text-white">Programa de Afiliados</h1>
                        <p className="text-sm text-gray-400 mt-1 max-w-2xl mx-auto">
                            Partilhe o seu código com amigos. Quando eles se registarem e fizerem o primeiro depósito, você ganha um bónus!
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-px bg-white/10">
                        <div className="bg-[#1a1a1a] p-8 flex flex-col items-center justify-center">
                            <Gift size={48} className="text-yellow-400 mb-4" />
                            <h2 className="text-xl font-semibold text-white mb-2">O seu Código de Referência</h2>
                            <div className="flex items-center gap-2 bg-black/30 p-3 rounded-lg border border-white/10">
                                <span className="text-2xl font-mono font-bold text-yellow-300 tracking-widest">
                                    {user?.referral_code || '...'}
                                </span>
                                <button onClick={handleCopyCode} className="p-2 rounded-md bg-white/10 text-gray-300 hover:bg-white/20 transition-colors">
                                    {isCopied ? <Check size={20} className="text-green-400" /> : <Copy size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="bg-[#1a1a1a] p-6">
                            <h3 className="text-xl font-semibold text-white mb-4">Os seus Indicados</h3>
                            {renderReferralsList()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReferralsPage;
