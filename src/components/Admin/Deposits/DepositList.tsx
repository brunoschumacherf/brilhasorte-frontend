import React, { useState, useEffect } from 'react';
import { getAdminDepositList } from '../../../services/api';
import type { AdminDepositListItem } from '../../../types';

const DepositList: React.FC = () => {
  const [deposits, setDeposits] = useState<AdminDepositListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getAdminDepositList()
      .then(response => {
        const includedData = response.data.included || [];
        const depositData = response.data.data.map(item => {
          const userRel = item.relationships?.user.data;
          const user = includedData.find(inc => inc.id === userRel?.id && inc.type === 'user');
          return {
            ...item.attributes,
            id: parseInt(item.id),
            user: user?.attributes as any || { id: null, full_name: 'N/A', email: 'N/A' },
          };
        });
        setDeposits(depositData);
      })
      .catch(() => {
        setError('Não foi possível carregar a lista de depósitos.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);
  
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <p>Carregando depósitos...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Gerenciamento de Depósitos</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuário</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bônus</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {deposits.map((deposit) => (
              <tr key={deposit.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{deposit.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>{deposit.user.full_name || 'N/A'}</div>
                  <div className="text-xs text-gray-500">{deposit.user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">R$ {(deposit.amount_in_cents / 100).toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">R$ {(deposit.bonus_in_cents / 100).toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(deposit.status)}`}>
                    {deposit.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(deposit.created_at).toLocaleString('pt-BR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DepositList;