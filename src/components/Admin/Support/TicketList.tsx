import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminTickets } from '../../../services/api';
import type { Ticket } from '../../../types';
import TableSkeleton from '../../Shared/TableSkeleton';

const TicketList: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getAdminTickets()
      .then(response => {
        const ticketData = response.data.data.map(item => ({
             id: parseInt(item.id),
            ...item.attributes
        }));
        setTickets(ticketData);
      })
      .catch(() => setError('Não foi possível carregar os tickets.'))
      .finally(() => setLoading(false));
  }, []);

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'open':
      case 'client_reply':
        return 'bg-yellow-100 text-yellow-800';
      case 'admin_reply':
        return 'bg-blue-100 text-blue-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <TableSkeleton rows={10} cols={5} />;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ticket</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assunto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Última Atualização</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tickets.map((ticket) => (
              <tr
                key={ticket.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => navigate(`/admin/support/${ticket.ticket_number}`)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-600">{ticket.ticket_number}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ticket.subject}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(ticket.created_at).toLocaleString('pt-BR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TicketList;