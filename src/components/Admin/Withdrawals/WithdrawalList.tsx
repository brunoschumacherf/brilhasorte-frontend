import React, { useState, useEffect } from 'react';
import { getAdminWithdrawalList } from '../../../services/api';
import type { AdminWithdrawalListItem } from '../../../types';

const WithdrawalList: React.FC = () => {
  const [withdrawals, setWithdrawals] = useState<AdminWithdrawalListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getAdminWithdrawalList()
      .then(response => {
        const includedData = response.data.included || [];
        const withdrawalData = response.data.data.map(item => {
          const userRel = item.relationships?.user.data;
          const user = includedData.find(inc => inc.id === userRel?.id && inc.type === 'user');
          return {
            ...item.attributes,
            id: parseInt(item.id),
            user: user?.attributes as any || { id: null, full_name: 'N/A', email: 'N/A' },
          };
        });
        setWithdrawals(withdrawalData);
      })
      .catch(() => {
        setError('Não foi possível carregar a lista de saques.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);
  
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <p>Carregando saques...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Gerenciamento de Saques</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuário</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chave PIX</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {withdrawals.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{item.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div>{item.user.full_name || 'N/A'}</div>
                  <div className="text-xs text-gray-500">{item.user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">R$ {(item.amount_in_cents / 100).toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>{item.pix_key}</div>
                  <div className="text-xs">{item.pix_key_type}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(item.status)}`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(item.created_at).toLocaleString('pt-BR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WithdrawalList;