import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getAdminTickets } from '../../../services/api';
import type { Ticket } from '../../../types';
import PaginationControls from '../../Shared/PaginationControls';
import { motion } from 'framer-motion';
import { LifeBuoy, PlusCircle, MessageSquare, Clock, CheckCircle2, CircleDot } from 'lucide-react';
import NewTicketModal from '../../Support/NewTicketModal';

type ProcessedTicket = Ticket & {
  relationships: any;
};

const TicketList: React.FC = () => {
  const [tickets, setTickets] = useState<ProcessedTicket[]>([]);
  const [included, setIncluded] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchTickets = async (page: number) => {
    setLoading(true);
    try {
      const response = await getAdminTickets(page);
      const formattedTickets: ProcessedTicket[] = response.data.data.map((item: any) => ({
        ...item.attributes,
        id: parseInt(item.id, 10),
        relationships: item.relationships,
      }));
      setTickets(formattedTickets);
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

  const findUserEmail = (userId: string) => {
    const user = included?.find(item => item.type === 'user' && item.id === userId);
    return user?.attributes?.email || 'N/A';
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'open': return { text: 'Aberto', icon: <Clock size={14} />, className: 'text-yellow-400 bg-yellow-500/10' };
      case 'admin_reply': return { text: 'Respondido', icon: <MessageSquare size={14} />, className: 'text-blue-400 bg-blue-500/10' };
      case 'client_reply': return { text: 'Resposta do Cliente', icon: <CircleDot size={14} />, className: 'text-purple-400 bg-purple-500/10' };
      case 'closed': return { text: 'Fechado', icon: <CheckCircle2 size={14} />, className: 'text-green-400 bg-green-500/10' };
      default: return { text: status, icon: null, className: 'bg-gray-700 text-gray-300' };
    }
  };

  const renderContent = () => {
    if (loading) return <div className="text-center text-gray-400 py-12">A carregar tickets...</div>;
    if (tickets.length === 0) return <div className="text-center text-gray-400 py-12">Nenhum ticket encontrado.</div>;

    return (
        <div className="space-y-4">
            {tickets.map((ticket, index) => {
                const statusInfo = getStatusInfo(ticket.status);
                return (
                    <motion.div
                        key={ticket.id}
                        className="bg-white/5 p-4 rounded-lg border border-white/10 cursor-pointer transition-colors hover:bg-white/10"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => navigate(`/admin/support/${ticket.ticket_number}`)}
                    >
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm items-center">
                            <div>
                                <p className="text-xs text-gray-400">Ticket</p>
                                <p className="font-mono font-bold text-white">#{ticket.ticket_number}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Utilizador</p>
                                <p className="font-medium text-gray-300 truncate">{findUserEmail(ticket.relationships.user.data.id)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Assunto</p>
                                <p className="font-medium text-white truncate">{ticket.subject}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Status</p>
                                <div className={`flex items-center gap-2 text-xs font-semibold px-2 py-1 rounded-full ${statusInfo.className}`}>
                                    {statusInfo.icon}
                                    <span>{statusInfo.text}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
  };

  return (
    <>
      <div className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3"><LifeBuoy /> Tickets de Suporte</h1>
              <p className="text-sm text-gray-400 mt-1">Gira e responda aos tickets dos utilizadores.</p>
          </div>
          <motion.button 
              onClick={() => setIsModalOpen(true)} 
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 text-black"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
          >
            <PlusCircle size={16} />
            Abrir Novo Ticket
          </motion.button>
        </div>

        <div className="bg-black/30 backdrop-blur-md border border-white/10 shadow-2xl rounded-2xl p-6">
          {renderContent()}
          
          {totalPages > 1 && (
              <div className="mt-6">
                  <PaginationControls
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={(page) => setCurrentPage(page)}
                  />
              </div>
          )}
        </div>
      </div>
      <NewTicketModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onTicketCreated={() => fetchTickets(currentPage)} 
      />
    </>
  );
};

export default TicketList;
