import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTickets } from '../services/api';
import type { Ticket } from '../types';
import NewTicketModal from '../components/Support/NewTicketModal';

const SupportPage: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchTickets = useCallback(() => {
    setLoading(true);
    getTickets()
      .then(response => {
        setTickets(
          response.data.data.map(item => {
            const { id, ...attributesWithoutId } = item.attributes;
            return { id: parseInt(item.id), ...attributesWithoutId };
          })
        );
      })
      .catch(() => setError('Não foi possível carregar seus tickets.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'open':
      case 'client_reply':
        return 'bg-yellow-900 bg-opacity-50 text-yellow-300';
      case 'admin_reply':
        return 'bg-green-900 bg-opacity-50 text-green-300';
      case 'closed':
        return 'bg-gray-700 text-gray-300';
      default:
        return '';
    }
  };

  return (
    <>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-[var(--surface-dark)] border border-[var(--border-color)] p-6 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-[var(--primary-gold)]">Meus Tickets</h1>
              <p className="text-[var(--text-secondary)]">Acompanhe suas solicitações de suporte.</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
            >
              Abrir Novo Ticket
            </button>
          </div>

          {loading && <p className="text-center text-[var(--text-secondary)]">Carregando...</p>}
          {error && <p className="text-center text-red-400">{error}</p>}

          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="border-b border-[var(--border-color)]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase">Ticket</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase">Assunto</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase">Aberto em</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      className="border-b border-[var(--border-color)] hover:bg-[#2a2a2a] cursor-pointer"
                      onClick={() => navigate(`/support/${ticket.ticket_number}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-400">{ticket.ticket_number}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-primary)]">{ticket.subject}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(ticket.status)}`}>
                          {ticket.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">{new Date(ticket.created_at).toLocaleString('pt-BR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <NewTicketModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onTicketCreated={fetchTickets} />
    </>
  );
};

export default SupportPage;