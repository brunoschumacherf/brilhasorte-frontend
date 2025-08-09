import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getAdminTickets } from '../../../services/api';
import type { Ticket } from '../../../types'; // Usaremos a interface Ticket como base
 // Usaremos a interface Ticket como base
import PaginationControls from '../../Shared/PaginationControls';
import TableSkeleton from '../../Shared/TableSkeleton';

// Interface para o item de ticket no formato que a API retorna
interface AdminTicketListItem {
  id: string;
  type: 'ticket';
  attributes: Ticket; // Os atributos correspondem à interface Ticket
  relationships: {
    user: {
      data: {
        id: string;
        type: 'user';
      }
    }
  }
}

const TicketList: React.FC = () => {
  const [tickets, setTickets] = useState<AdminTicketListItem[]>([]);
  const [included, setIncluded] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  // Função para buscar os tickets com paginação
  const fetchTickets = async (page: number) => {
    setLoading(true);
    try {
      const response = await getAdminTickets(page);
      setTickets(response.data.data);
      setIncluded(response.data.included || []);
      setTotalPages(parseInt(response.headers['total-pages'] || '1'));
      setCurrentPage(parseInt(response.headers['current-page'] || '1'));
    } catch (error) {
      toast.error('Não foi possível carregar os tickets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets(currentPage);
  }, [currentPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const findUserEmail = (userId: string) => {
    const user = included?.find(item => item.type === 'user' && item.id === userId);
    return user?.attributes?.email || 'N/A';
  };

  // Mapeamento de status para classes de estilo e texto
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'open':
        return { label: 'Aberto', className: 'bg-green-100 text-green-800' };
      case 'client_reply':
        return { label: 'Cliente Respondeu', className: 'bg-yellow-100 text-yellow-800' };
      case 'admin_reply':
        return { label: 'Aguardando Cliente', className: 'bg-blue-100 text-blue-800' };
      case 'closed':
        return { label: 'Fechado', className: 'bg-gray-100 text-gray-800' };
      default:
        return { label: status, className: 'bg-gray-100 text-gray-800' };
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Tickets de Suporte</h1>
      <div className="bg-gray-800 shadow sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Ticket</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Usuário</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Assunto</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Última Atualização</th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {loading ? <TableSkeleton cols={5} /> : tickets.map((ticket) => {
                const statusInfo = getStatusInfo(ticket.attributes.status);
                return (
                  <tr
                    key={ticket.id}
                    className="hover:bg-gray-700 cursor-pointer"
                    onClick={() => navigate(`/admin/support/${ticket.attributes.ticket_number}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-400">{ticket.attributes.ticket_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{findUserEmail(ticket.relationships.user.data.id)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">{ticket.attributes.subject}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.className}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{new Date(ticket.attributes.created_at).toLocaleString('pt-BR')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default TicketList;