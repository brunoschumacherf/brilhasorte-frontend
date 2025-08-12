import React, { useState, useEffect } from 'react';
import { getAdminDepositList } from '../../../services/api';
import type { AdminDepositListItem } from '../../../types';
import PaginationControls from '../../Shared/PaginationControls';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { ArrowDownCircle, CheckCircle2, XCircle, Clock } from 'lucide-react';

type ProcessedDeposit = AdminDepositListItem & {
  relationships: any;
};

const DepositList: React.FC = () => {
  const [deposits, setDeposits] = useState<ProcessedDeposit[]>([]);
  const [included, setIncluded] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchDeposits = async (page: number) => {
    setLoading(true);
    try {
      const response = await getAdminDepositList(page);
      const formattedDeposits: ProcessedDeposit[] = response.data.data.map((item: any) => ({
        ...item.attributes,
        id: parseInt(item.id, 10),
        relationships: item.relationships,
      }));
      setDeposits(formattedDeposits);
      setIncluded(response.data.included || []);
      setTotalPages(parseInt(response.headers['total-pages'] || '1'));
      setCurrentPage(parseInt(response.headers['current-page'] || '1'));
    } catch (error) {
      toast.error('Não foi possível carregar a lista de depósitos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeposits(currentPage);
  }, [currentPage]);

  const findUserEmail = (relationship: { data: { id: string; type: string } } | undefined) => {
    if (!relationship?.data) return 'N/A';
    const { id, type } = relationship.data;
    const found = included.find(item => item.id === id && item.type === type);
    return found?.attributes?.email || 'N/A';
  };

  const formatCurrency = (valueInCents: number) => {
    return (valueInCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };
  
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'completed': return { text: 'Completo', icon: <CheckCircle2 size={14} />, className: 'text-green-400 bg-green-500/10' };
      case 'pending': return { text: 'Pendente', icon: <Clock size={14} />, className: 'text-yellow-400 bg-yellow-500/10' };
      case 'error': return { text: 'Erro', icon: <XCircle size={14} />, className: 'text-red-400 bg-red-500/10' };
      default: return { text: status, icon: null, className: 'text-gray-400 bg-gray-500/10' };
    }
  };

  const renderContent = () => {
    if (loading) return <div className="text-center text-gray-400 py-12">A carregar depósitos...</div>;
    if (deposits.length === 0) return <div className="text-center text-gray-400 py-12">Nenhum depósito encontrado.</div>;

    return (
        <div className="space-y-4">
            {deposits.map((deposit, index) => {
                const statusInfo = getStatusInfo(deposit.status);
                return (
                    <motion.div
                        key={deposit.id}
                        className="bg-white/5 p-4 rounded-lg border border-white/10"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                            <div>
                                <p className="text-xs text-gray-400">Utilizador</p>
                                <p className="font-medium text-white truncate">{findUserEmail(deposit.relationships.user)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Valor</p>
                                <p className="font-semibold text-green-400">{formatCurrency(deposit.amount_in_cents)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Bónus</p>
                                <p className="font-semibold text-yellow-400">{formatCurrency(deposit.bonus_in_cents)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Data</p>
                                <p className="text-gray-300">{new Date(deposit.created_at).toLocaleString('pt-BR')}</p>
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
    <div className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-3"><ArrowDownCircle /> Depósitos</h1>
                <p className="text-sm text-gray-400 mt-1">Gira e monitorize todos os depósitos na plataforma.</p>
            </div>
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
  );
};

export default DepositList;
