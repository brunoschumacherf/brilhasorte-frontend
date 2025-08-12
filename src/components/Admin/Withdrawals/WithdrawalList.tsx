import React, { useState, useEffect, useCallback } from 'react';
import { getAdminWithdrawalList, approveAdminWithdrawal } from '../../../services/api';
import type { AdminWithdrawalListItem } from '../../../types';
import PaginationControls from '../../Shared/PaginationControls';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { ArrowUpCircle, CheckCircle2, XCircle, Clock, Loader } from 'lucide-react';

type ProcessedWithdrawal = AdminWithdrawalListItem & {
  relationships: any;
};

const WithdrawalList: React.FC = () => {
  const [withdrawals, setWithdrawals] = useState<ProcessedWithdrawal[]>([]);
  const [included, setIncluded] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isApproving, setIsApproving] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchWithdrawals = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const response = await getAdminWithdrawalList(page);
      const formattedWithdrawals: ProcessedWithdrawal[] = response.data.data.map((item: any) => ({
        ...item.attributes,
        id: parseInt(item.id, 10),
        relationships: item.relationships,
      }));
      setWithdrawals(formattedWithdrawals);
      setIncluded(response.data.included || []);
      setTotalPages(parseInt(response.headers['total-pages'] || '1'));
      setCurrentPage(parseInt(response.headers['current-page'] || '1'));
    } catch (error) {
      toast.error('Não foi possível carregar a lista de saques.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWithdrawals(currentPage);
  }, [currentPage, fetchWithdrawals]);

  const handleApprove = async (withdrawalId: number) => {
    setIsApproving(withdrawalId);
    try {
      await approveAdminWithdrawal(String(withdrawalId));
      toast.success('Saque aprovado com sucesso!');
      setWithdrawals(prev =>
        prev.map(w =>
          w.id === withdrawalId ? { ...w, status: 'completed' } : w
        )
      );
    } catch (error) {
      toast.error('Falha ao aprovar o saque.');
    } finally {
      setIsApproving(null);
    }
  };

  const findUserEmail = (relationship: { data: { id: string; type: string } } | undefined) => {
    if (!relationship?.data) return 'N/A';
    const user = included.find(item => item.id === relationship.data.id && item.type === 'user');
    return user?.attributes?.email || 'N/A';
  };

  const formatCurrency = (valueInCents: number) => {
    return (valueInCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };
  
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'completed': return { text: 'Completo', icon: <CheckCircle2 size={14} />, className: 'text-green-400 bg-green-500/10' };
      case 'pending': return { text: 'Pendente', icon: <Clock size={14} />, className: 'text-yellow-400 bg-yellow-500/10' };
      case 'processing': return { text: 'Processando', icon: <Loader size={14} className="animate-spin" />, className: 'text-blue-400 bg-blue-500/10' };
      case 'failed': return { text: 'Falhou', icon: <XCircle size={14} />, className: 'text-red-400 bg-red-500/10' };
      default: return { text: status, icon: null, className: 'text-gray-400 bg-gray-500/10' };
    }
  };

  const renderContent = () => {
    if (loading) return <div className="text-center text-gray-400 py-12">A carregar saques...</div>;
    if (withdrawals.length === 0) return <div className="text-center text-gray-400 py-12">Nenhum saque encontrado.</div>;

    return (
        <div className="space-y-4">
            {withdrawals.map((item, index) => {
                const statusInfo = getStatusInfo(item.status);
                const isPending = item.status === 'pending';
                return (
                    <motion.div
                        key={item.id}
                        className="bg-white/5 p-4 rounded-lg border border-white/10"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 text-sm items-center">
                            <div className="md:col-span-2">
                                <p className="text-xs text-gray-400">Utilizador</p>
                                <p className="font-medium text-white truncate">{findUserEmail(item.relationships.user)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Valor</p>
                                <p className="font-semibold text-red-400">{formatCurrency(item.amount_in_cents)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Chave PIX</p>
                                <p className="text-gray-300 truncate">{item.pix_key}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Status</p>
                                <div className={`flex items-center gap-2 text-xs font-semibold px-2 py-1 rounded-full ${statusInfo.className}`}>
                                    {statusInfo.icon}
                                    <span>{statusInfo.text}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                {isPending && (
                                    <motion.button
                                        onClick={() => handleApprove(item.id)}
                                        disabled={isApproving !== null}
                                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-1.5 px-3 rounded-md text-xs disabled:bg-gray-500 disabled:cursor-not-allowed"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {isApproving === item.id ? 'A aprovar...' : 'Aprovar'}
                                    </motion.button>
                                )}
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
                <h1 className="text-2xl font-bold text-white flex items-center gap-3"><ArrowUpCircle /> Saques</h1>
                <p className="text-sm text-gray-400 mt-1">Gira e monitorize todos os saques da plataforma.</p>
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

export default WithdrawalList;
