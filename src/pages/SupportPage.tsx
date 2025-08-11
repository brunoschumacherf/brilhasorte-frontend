import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getTickets } from '../services/api'; 
import type { Ticket } from '../types'; 
import NewTicketModal from '../components/Support/NewTicketModal';
import { LifeBuoy, MessageSquare, PlusCircle, Clock, CheckCircle2, CircleDot } from 'lucide-react';

const SupportPage: React.FC = () => {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    const fetchTickets = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getTickets();
            const ticketData = response.data.data.map((item: any) => {
                const { id, ...attributes } = item.attributes;
                return { id: parseInt(item.id), ...attributes };
            });
            setTickets(ticketData);
        } catch {
            setError('Não foi possível carregar os seus tickets de suporte.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    const statusConfig = {
        open: { text: 'Aberto', icon: <Clock size={16} />, className: 'text-yellow-400 bg-yellow-500/10' },
        admin_reply: { text: 'Respondido', icon: <MessageSquare size={16} />, className: 'text-blue-400 bg-blue-500/10' },
        client_reply: { text: 'Sua Resposta', icon: <CircleDot size={16} />, className: 'text-purple-400 bg-purple-500/10' },
        closed: { text: 'Fechado', icon: <CheckCircle2 size={16} />, className: 'text-green-400 bg-green-500/10' },
    };

    const renderTicketList = () => {
        if (loading) return <p className="text-center text-gray-400 py-12">A carregar tickets...</p>;
        if (error) return <p className="text-center text-red-400 py-12">{error}</p>;
        if (tickets.length === 0) {
            return (
                <div className="text-center py-12">
                    <MessageSquare size={48} className="mx-auto text-gray-500" />
                    <h3 className="mt-4 text-lg font-semibold text-white">Nenhum ticket encontrado</h3>
                    <p className="mt-2 text-sm text-gray-400">Clique em "Abrir Novo Ticket" para obter ajuda.</p>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {tickets.map((ticket, index) => {
                    const statusInfo = statusConfig[ticket.status as keyof typeof statusConfig] || { text: ticket.status, icon: null, className: 'bg-gray-700 text-gray-300' };
                    return (
                        <motion.div
                            key={ticket.id}
                            className="bg-white/5 p-4 rounded-lg border border-white/10 cursor-pointer transition-colors hover:bg-white/10"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => navigate(`/support/${ticket.ticket_number}`)}
                        >
                            <div className="flex justify-between items-start gap-4">
                                <div>
                                    <p className="font-bold text-white break-words">{ticket.subject}</p>
                                    <p className="text-xs text-gray-400 mt-1 font-mono">#{ticket.ticket_number}</p>
                                </div>
                                <div className={`flex-shrink-0 flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full ${statusInfo.className}`}>
                                    {statusInfo.icon}
                                    <span>{statusInfo.text}</span>
                                </div>
                            </div>
                            <p className="text-sm text-gray-400 mt-3 pt-3 border-t border-white/10">
                                Aberto em: {new Date(ticket.created_at).toLocaleString('pt-BR')}
                            </p>
                        </motion.div>
                    );
                })}
            </div>
        );
    };

    return (
        <>
            <div className="relative min-h-screen bg-[#101010] p-4 sm:p-6 lg:p-8 overflow-hidden">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full filter blur-3xl opacity-50 animate-blob"></div>
                <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

                <div className="container mx-auto max-w-4xl relative z-10">
                    <div className="bg-black/30 backdrop-blur-md border border-white/10 shadow-2xl rounded-2xl overflow-hidden">
                        <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-white flex items-center gap-3"><LifeBuoy /> Central de Suporte</h1>
                                <p className="text-sm text-gray-400 mt-1">Consulte os seus tickets ou abra um novo pedido de ajuda.</p>
                            </div>
                            <motion.button
                                onClick={() => setIsModalOpen(true)}
                                className="w-full sm:w-auto flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 text-black"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <PlusCircle size={16} />
                                Abrir Novo Ticket
                            </motion.button>
                        </div>

                        <div className="p-6">
                            {renderTicketList()}
                        </div>
                    </div>
                </div>
            </div>
            <NewTicketModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onTicketCreated={fetchTickets} 
            />
        </>
    );
};

export default SupportPage;
