import React, { useState, useEffect } from 'react';
import { getWithdrawalHistory } from '../../services/api';
import type { WithdrawalHistoryItem } from '../../types';

const WithdrawalHistoryList: React.FC = () => {
  const [withdrawals, setWithdrawals] = useState<WithdrawalHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getWithdrawalHistory()
      .then(response => {
        const withdrawalData = response.data.data.map(item => item.attributes);
        setWithdrawals(withdrawalData);
      })
      .catch(() => {
        setError('Não foi possível carregar o histórico de saques.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-900 bg-opacity-50 text-green-300';
      case 'pending':
        return 'bg-yellow-900 bg-opacity-50 text-yellow-300';
      case 'processing':
        return 'bg-blue-900 bg-opacity-50 text-blue-300';
      case 'failed':
        return 'bg-red-900 bg-opacity-50 text-red-300';
      default:
        return 'bg-gray-700 text-gray-300';
    }
  };

  if (loading) return <p className="text-center p-4 text-[var(--text-secondary)]">Carregando histórico de saques...</p>;
  if (error) return <p className="text-center p-4 text-red-400">{error}</p>;

  return (
    <div>
      {withdrawals.length === 0 ? (
        <p className="p-4 text-center text-[var(--text-secondary)]">Nenhum saque encontrado.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b border-[var(--border-color)]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase">Data</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase">Valor</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase">Chave PIX</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map((item) => (
                <tr key={item.id} className="border-b border-[var(--border-color)] hover:bg-[#2a2a2a]">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">{new Date(item.created_at).toLocaleString('pt-BR')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-primary)] font-semibold">R$ {(item.amount_in_cents / 100).toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">{item.pix_key} ({item.pix_key_type})</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(item.status)}`}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default WithdrawalHistoryList;
