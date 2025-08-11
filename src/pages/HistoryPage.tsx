import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DepositHistoryList from '../components/History/DepositHistoryList';
import WithdrawalHistoryList from '../components/History/WithdrawalHistoryList';

const HistoryPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'deposits' | 'withdrawals'>('deposits');

    return (
        <div className="relative min-h-screen bg-[#101010] p-4 sm:p-6 lg:p-8 overflow-hidden">
            {/* Fundo Aurora */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full filter blur-3xl opacity-50 animate-blob"></div>
            <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

            <div className="container mx-auto max-w-4xl relative z-10">
                <div className="bg-black/30 backdrop-blur-md border border-white/10 shadow-2xl rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-white/10">
                        <h2 className="text-2xl font-bold text-white">Histórico de Transações</h2>
                        <p className="text-sm text-gray-400">Consulte os seus depósitos e saques.</p>
                    </div>

                    <div className="p-6">
                        <div className="flex border-b border-white/10 mb-6">
                            <button
                                onClick={() => setActiveTab('deposits')}
                                className={`px-4 py-3 text-sm font-semibold transition-colors ${activeTab === 'deposits' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-400 hover:text-white'}`}
                            >
                                Depósitos
                            </button>
                            <button
                                onClick={() => setActiveTab('withdrawals')}
                                className={`px-4 py-3 text-sm font-semibold transition-colors ${activeTab === 'withdrawals' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-400 hover:text-white'}`}
                            >
                                Saques
                            </button>
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {activeTab === 'deposits' ? <DepositHistoryList /> : <WithdrawalHistoryList />}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HistoryPage;
