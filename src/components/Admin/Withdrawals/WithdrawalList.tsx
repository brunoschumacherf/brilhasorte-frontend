import React, { useState, useEffect, useCallback } from 'react';
import { getAdminWithdrawalList, approveAdminWithdrawal } from '../../../services/api';
import type { AdminWithdrawalListItem } from '../../../types';
import TableSkeleton from '../../Shared/TableSkeleton';
import PaginationControls from '../../Shared/PaginationControls';
import { toast } from 'react-toastify';

// Este tipo representa a estrutura de dados "achatada" que vamos usar no estado
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
      
      // Corrigido: Mapeia a resposta da API para a estrutura que o componente espera
      const formattedWithdrawals: ProcessedWithdrawal[] = response.data.data.map(item => ({
        ...item.attributes,
        id: parseInt(item.id, 10), // Converte o ID de string para número
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

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleApprove = async (withdrawalId: number) => {
    setIsApproving(withdrawalId);
    try {
      // A API espera o ID como string
      await approveAdminWithdrawal(String(withdrawalId));
      toast.success('Saque aprovado com sucesso!');
      // Atualiza o status localmente para feedback imediato
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
      case 'completed': return { label: 'Completo', className: 'bg-green-100 text-green-800' };
      case 'pending': return { label: 'Pendente', className: 'bg-yellow-100 text-yellow-800' };
      case 'processing': return { label: 'Processando', className: 'bg-blue-100 text-blue-800' };
      case 'failed': return { label: 'Falhou', className: 'bg-red-100 text-red-800' };
      default: return { label: status, className: 'bg-gray-100 text-gray-800' };
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Saques</h1>
      <div className="bg-gray-800 shadow sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Usuário</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Valor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Chave PIX</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Data</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {loading ? <TableSkeleton cols={6} /> : withdrawals.map((item) => {
                const statusInfo = getStatusInfo(item.status);
                const isPending = item.status === 'pending';
                return (
                  <tr key={item.id} className="hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{findUserEmail(item.relationships.user)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-400">{formatCurrency(item.amount_in_cents)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <div>{item.pix_key}</div>
                      <div className="text-xs uppercase font-medium text-gray-500">{item.pix_key_type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.className}`}>{statusInfo.label}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{new Date(item.created_at).toLocaleString('pt-BR')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {isPending && (
                        <button
                          onClick={() => handleApprove(item.id)}
                          disabled={isApproving !== null}
                          className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded-md disabled:bg-gray-500 disabled:cursor-not-allowed"
                        >
                          {isApproving === item.id ? 'Aprovando...' : 'Aprovar'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
    </div>
  );
};

export default WithdrawalList;