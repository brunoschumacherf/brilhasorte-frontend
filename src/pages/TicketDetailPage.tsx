import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTicketDetails, createTicketReply } from '../services/api';
import type { Ticket, TicketReply } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const TicketDetailPage: React.FC = () => {
  const { ticketNumber } = useParams<{ ticketNumber: string }>();
  const { user } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [replies, setReplies] = useState<TicketReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  const fetchTicket = useCallback(() => {
    if (!ticketNumber) return;
    setLoading(true);
    getTicketDetails(ticketNumber)
      .then(response => {
        setTicket(response.data.data.attributes);
        const included = response.data.included || [];
        const userMap = new Map(included.filter(i => i.type === 'user').map(u => [u.id, u.attributes]));
        const ticketReplies = included
          .filter(i => i.type === 'ticket_reply')
          .map(reply => ({
            ...reply.attributes,
            user: userMap.get(reply.relationships.user.data.id)
          }));
        setReplies(ticketReplies);
      })
      .catch(() => setError('Ticket não encontrado ou você não tem permissão para vê-lo.'))
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
      await createTicketReply(ticketNumber, replyMessage);
      setReplyMessage('');
      toast.success('Resposta enviada com sucesso!');
      fetchTicket(); // Recarrega o ticket para ver a nova resposta
    } catch (err) {
      toast.error('Não foi possível enviar sua resposta.');
    } finally {
      setIsReplying(false);
    }
  };

  if (loading) return <p className="text-center mt-10">Carregando ticket...</p>;
  if (error) return <p className="text-center mt-10 text-red-400">{error}</p>;
  if (!ticket) return null;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-[var(--surface-dark)] border border-[var(--border-color)] p-6 rounded-lg shadow-lg">
        <div className="border-b border-[var(--border-color)] pb-4 mb-6">
          <Link to="/support" className="text-blue-400 hover:underline mb-4 inline-block">&larr; Voltar para Meus Tickets</Link>
          <h1 className="text-2xl font-bold text-[var(--primary-gold)]">{ticket.subject}</h1>
          <p className="text-sm text-[var(--text-secondary)]">Ticket #{ticket.ticket_number} &bull; Status: {ticket.status}</p>
        </div>

        <div className="space-y-4 mb-8">
          {replies.map(reply => (
            <div key={reply.id} className={`p-4 rounded-lg ${reply.user.id === user?.id ? 'bg-blue-900 bg-opacity-30' : 'bg-gray-700 bg-opacity-40'}`}>
              <div className="flex justify-between items-center mb-2">
                <p className="font-bold text-white">{reply.user.full_name || 'Usuário'}</p>
                <p className="text-xs text-[var(--text-secondary)]">{new Date(reply.created_at).toLocaleString('pt-BR')}</p>
              </div>
              <p className="text-[var(--text-primary)] whitespace-pre-wrap">{reply.message}</p>
            </div>
          ))}
        </div>

        {ticket.status !== 'closed' ? (
          <form onSubmit={handleReplySubmit}>
            <h3 className="text-lg font-semibold mb-2 text-white">Adicionar Resposta</h3>
            <textarea
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              rows={5}
              className="w-full bg-[#2a2a2a] p-3 border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-gold)]"
              placeholder="Digite sua resposta aqui..."
            />
            <button type="submit" disabled={isReplying} className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-500">
              {isReplying ? 'Enviando...' : 'Enviar Resposta'}
            </button>
          </form>
        ) : (
          <div className="text-center p-4 bg-red-900 bg-opacity-40 rounded-lg">
            <p className="font-bold text-red-300">Este ticket foi fechado e não pode mais receber respostas.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketDetailPage;