import React, { useState, useEffect } from 'react';
import { getAdminDepositList } from '../../../services/api';
import type { AdminDepositListItem } from '../../../types';
import TableSkeleton from '../../Shared/TableSkeleton';
import PaginationControls from '../../Shared/PaginationControls';
import { toast } from 'react-toastify';

const DepositList: React.FC = () => {
  const [deposits, setDeposits] = useState<AdminDepositListItem[]>([]);
  const [included, setIncluded] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetches data for the specified page
  const fetchDeposits = async (page: number) => {
    setLoading(true);
    try {
      const response = await getAdminDepositList(page);
      setDeposits(response.data.data);
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

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

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
      case 'completed': return { label: 'Completo', className: 'bg-green-100 text-green-800' };
      case 'pending': return { label: 'Pendente', className: 'bg-yellow-100 text-yellow-800' };
      case 'error': return { label: 'Erro', className: 'bg-red-100 text-red-800' };
      default: return { label: status, className: 'bg-gray-100 text-gray-800' };
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Depósitos</h1>

      <div className="bg-gray-800 shadow sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Usuário</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Valor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Bônus</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Data</th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {loading ? <TableSkeleton cols={5} /> : deposits.map((deposit) => {
                const { attributes, relationships } = deposit;
                const statusInfo = getStatusInfo(attributes.status);
                return (
                  <tr key={deposit.id} className="hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {findUserEmail(relationships.user)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-400">
                      {formatCurrency(attributes.amount_in_cents)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-yellow-400">
                      {formatCurrency(attributes.bonus_in_cents)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.className}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {new Date(attributes.created_at).toLocaleString('pt-BR')}
                    </td>
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

export default DepositList;