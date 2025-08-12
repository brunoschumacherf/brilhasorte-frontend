import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAdminTicketDetails, createAdminTicketReply } from '../../../services/api';
import type { Ticket, TicketReply, User } from '../../../types';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, Lock } from 'lucide-react';

const TicketDetail: React.FC = () => {
  const { ticketNumber } = useParams<{ ticketNumber: string }>();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [ticketUser, setTicketUser] = useState<User | null>(null);
  const [replies, setReplies] = useState<TicketReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [closeOnReply, setCloseOnReply] = useState(false);
  const [isReplying, setIsReplying] = useState(false);

  const fetchTicket = useCallback(() => {
    if (!ticketNumber) return;
    setLoading(true);
    getAdminTicketDetails(ticketNumber)
      .then(response => {
        const { id, ...attributes } = response.data.data.attributes;
        const ticketData = { id: parseInt(response.data.data.id), ...attributes };
        setTicket(ticketData);

        type IncludedItem = { id: string; type: string; attributes: any; relationships?: any; };
        const included: IncludedItem[] = response.data.included || [];
        const userMap = new Map(included.filter(i => i.type === 'user').map(u => [u.id, u.attributes]));
        
        const ticketOwnerId = response.data.data.relationships.user.data.id;
        setTicketUser(userMap.get(ticketOwnerId));

        const ticketReplies = included
          .filter(i => i.type === 'ticket_reply')
          .map(reply => ({
            ...reply.attributes,
            id: parseInt(reply.id),
            user: userMap.get(reply.relationships.user.data.id)
          }));
        setReplies(ticketReplies.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()));
      })
      .catch(() => setError('Ticket não encontrado.'))
      .finally(() => setLoading(false));
  }, [ticketNumber]);

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketNumber || replyMessage.trim().length < 5) {
      toast.warn('A resposta deve ter pelo menos 5 caracteres.');
      return;
    }
    setIsReplying(true);
    try {
      await createAdminTicketReply(ticketNumber, replyMessage, closeOnReply);
      setReplyMessage('');
      setCloseOnReply(false);
      toast.success('Resposta enviada!');
      fetchTicket();
    } catch (err) {
      toast.error('Não foi possível enviar a resposta.');
    } finally {
      setIsReplying(false);
    }
  };
  
  if (loading) return <p className="text-center mt-10 text-gray-400">A carregar ticket...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;
  if (!ticket || !ticketUser) return null;

  return (
    <div className="bg-black/30 backdrop-blur-md border border-white/10 shadow-2xl rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/10">
            <Link to="/admin/support" className="text-sm text-yellow-400 hover:underline flex items-center gap-2 mb-4">
                <ArrowLeft size={16} /> Voltar para Tickets
            </Link>
            <h1 className="text-2xl font-bold text-white">{ticket.subject}</h1>
            <p className="text-sm text-gray-400">
                Ticket #{ticket.ticket_number} | Cliente: {ticketUser.full_name || ticketUser.email}
            </p>
        </div>

        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
            {replies.map(reply => (
                <div key={reply.id} className={`flex gap-3 ${reply.user.admin ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xl p-4 rounded-xl ${reply.user.admin ? 'bg-blue-500/10 text-blue-200 rounded-br-none' : 'bg-white/5 text-gray-300 rounded-bl-none'}`}>
                        <div className="flex justify-between items-center mb-1">
                            <p className="text-xs font-bold text-white">{reply.user.full_name || 'Utilizador'}</p>
                            <p className="text-xs text-gray-500">{new Date(reply.created_at).toLocaleString('pt-BR')}</p>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{reply.message}</p>
                    </div>
                </div>
            ))}
        </div>

        {ticket.status !== 'closed' ? (
            <form onSubmit={handleReplySubmit} className="p-6 border-t border-white/10 bg-black/20">
                <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    rows={4}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2 px-3 text-white transition-colors focus:border-yellow-500 focus:ring-yellow-500 focus:outline-none"
                    placeholder="Digite a sua resposta aqui..."
                />
                <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                        <input
                            id="close_ticket"
                            type="checkbox"
                            checked={closeOnReply}
                            onChange={(e) => setCloseOnReply(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-600 bg-zinc-800 text-yellow-500 focus:ring-yellow-500"
                        />
                        <label htmlFor="close_ticket" className="block text-sm text-gray-300">
                            Fechar ticket após responder
                        </label>
                    </div>
                    <motion.button 
                        type="submit" 
                        disabled={isReplying} 
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 text-black disabled:opacity-50"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {isReplying ? 'A enviar...' : 'Enviar Resposta'} <Send size={16} />
                    </motion.button>
                </div>
            </form>
        ) : (
            <div className="text-center p-6 bg-black/20 border-t border-white/10">
                <p className="font-bold text-gray-400 flex items-center justify-center gap-2"><Lock size={16} /> Este ticket está fechado.</p>
            </div>
        )}
    </div>
  );
};

export default TicketDetail;
