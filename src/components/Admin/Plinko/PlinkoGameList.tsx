import React from 'react';
import type { AdminPlinkoGameListItem } from '../../../types';
import TableSkeleton from '../../Shared/TableSkeleton';

interface PlinkoGameListProps {
  games: AdminPlinkoGameListItem[];
  loading: boolean;
  included: any[];
}

const PlinkoGameList: React.FC<PlinkoGameListProps> = ({ games, loading, included }) => {
  const formatBalance = (balanceInCents: number) => {
    return (balanceInCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const findUserEmail = (userId: string) => {
    const user = included?.find(item => item.type === 'user' && item.id === userId);
    return user?.attributes?.email || 'N/A';
  };

  const getRiskLabel = (risk: string) => {
    const riskMap: { [key: string]: { label: string, className: string } } = {
      low: { label: 'Baixo', className: 'bg-blue-100 text-blue-800' },
      medium: { label: 'Médio', className: 'bg-yellow-100 text-yellow-800' },
      high: { label: 'Alto', className: 'bg-red-100 text-red-800' },
    };
    const riskInfo = riskMap[risk] || { label: risk, className: 'bg-gray-100 text-gray-800' };
    return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${riskInfo.className}`}>{riskInfo.label}</span>;
  };

  return (
    <div className="bg-gray-800 shadow overflow-hidden sm:rounded-lg">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Usuário</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Aposta</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Prêmio</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Linhas</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Risco</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Multiplicador</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Data</th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {loading ? <TableSkeleton cols={7} /> : games.map((game) => (
              <tr key={game.id} className="hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{findUserEmail(game.relationships.user.data.id)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400">{formatBalance(game.attributes.bet_amount)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-400 font-semibold">{formatBalance(game.attributes.winnings)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{game.attributes.rows}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{getRiskLabel(game.attributes.risk)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{game.attributes.multiplier}x</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{new Date(game.attributes.created_at).toLocaleString('pt-BR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlinkoGameList;