import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAdminTicketDetails, createAdminTicketReply } from '../../../services/api';
import type { Ticket, TicketReply, User } from '../../../types';
import { toast } from 'react-toastify';

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

        type IncludedItem = {
          id: string;
          type: string;
          attributes: any;
          relationships?: any;
        };
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
  
  if (loading) return <p className="text-center mt-10">Carregando ticket...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;
  if (!ticket || !ticketUser) return null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="border-b pb-4 mb-6">
        <Link to="/admin/support" className="text-blue-600 hover:underline mb-4 inline-block">&larr; Voltar para Tickets</Link>
        <h1 className="text-2xl font-bold text-gray-800">{ticket.subject}</h1>
        <p className="text-sm text-gray-500">
          Ticket #{ticket.ticket_number} | Cliente: {ticketUser.full_name || ticketUser.email}
        </p>
      </div>

      <div className="space-y-4 mb-8 max-h-96 overflow-y-auto pr-2">
        {replies.map(reply => (
          <div key={reply.id} className={`p-4 rounded-lg ${reply.user.admin ? 'bg-blue-50' : 'bg-gray-50'}`}>
            <div className="flex justify-between items-center mb-2">
              <p className="font-bold text-gray-900">{reply.user.full_name || 'Usuário'}</p>
              <p className="text-xs text-gray-500">{new Date(reply.created_at).toLocaleString('pt-BR')}</p>
            </div>
            <p className="text-gray-800 whitespace-pre-wrap">{reply.message}</p>
          </div>
        ))}
      </div>

      {ticket.status !== 'closed' ? (
        <form onSubmit={handleReplySubmit} className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Responder Ticket</h3>
          <textarea
            value={replyMessage}
            onChange={(e) => setReplyMessage(e.target.value)}
            rows={5}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Digite sua resposta aqui..."
          />
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center">
              <input
                id="close_ticket"
                type="checkbox"
                checked={closeOnReply}
                onChange={(e) => setCloseOnReply(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label htmlFor="close_ticket" className="ml-2 block text-sm text-gray-900">
                Fechar ticket após responder
              </label>
            </div>
            <button type="submit" disabled={isReplying} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-400">
              {isReplying ? 'Enviando...' : 'Enviar Resposta'}
            </button>
          </div>
        </form>
      ) : (
        <div className="text-center p-4 bg-gray-100 rounded-lg">
          <p className="font-bold text-gray-700">Este ticket está fechado.</p>
        </div>
      )}
    </div>
  );
};

export default TicketDetail;