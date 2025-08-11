import React, { useState, useEffect } from 'react';
import { getDepositHistory } from '../../services/api';
import type { DepositHistoryItem } from '../../types';
import { motion } from 'framer-motion';
import { ArrowDownCircle, CheckCircle2, XCircle, Clock, Loader, History } from 'lucide-react';

const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <Loader className="animate-spin h-10 w-10 text-[var(--primary-gold)]" />
        <p className="mt-4 text-lg">A carregar o histórico...</p>
    </div>
);

const EmptyState = ({ message }: { message: string }) => (
    <div className="text-center py-16">
        <div className="mx-auto h-16 w-16 text-gray-500 bg-white/5 rounded-full flex items-center justify-center">
            <History size={32} />
        </div>
        <p className="mt-4 text-gray-400">{message}</p>
    </div>
);

const statusConfig = {
    completed: { text: 'Concluído', icon: <CheckCircle2 size={16} />, className: 'text-green-400 bg-green-500/10' },
    pending: { text: 'Pendente', icon: <Clock size={16} />, className: 'text-yellow-400 bg-yellow-500/10' },
    error: { text: 'Erro', icon: <XCircle size={16} />, className: 'text-red-400 bg-red-500/10' },
};

const DepositHistoryList: React.FC = () => {
    const [deposits, setDeposits] = useState<DepositHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        getDepositHistory()
            .then(response => {
                const depositData = response.data.data.map((item: any) => item.attributes);
                setDeposits(depositData);
            })
            .catch(() => setError('Não foi possível carregar o histórico de depósitos.'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <LoadingSpinner />;
    if (error) return <p className="text-center p-4 text-red-400">{error}</p>;
    if (deposits.length === 0) return <EmptyState message="Nenhum depósito encontrado." />;

    return (
        <div className="space-y-3">
            {deposits.map((item, index) => {
                const statusInfo = statusConfig[item.status as keyof typeof statusConfig] || { text: item.status, icon: null, className: 'text-gray-400 bg-gray-500/10' };
                return (
                    <motion.div
                        key={item.id}
                        className="bg-white/5 p-4 rounded-lg flex items-center justify-between gap-4 transition-colors hover:bg-white/10"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <div className="flex items-center gap-4">
                            <ArrowDownCircle size={32} className="text-green-400 flex-shrink-0" />
                            <div>
                                <p className="font-bold text-white text-lg">R$ {(item.amount_in_cents / 100).toFixed(2)}</p>
                                <p className="text-xs text-gray-400">{new Date(item.created_at).toLocaleString('pt-BR')}</p>
                            </div>
                        </div>
                        <div className={`flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full ${statusInfo.className}`}>
                            {statusInfo.icon}
                            <span>{statusInfo.text}</span>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};

export default DepositHistoryList;
