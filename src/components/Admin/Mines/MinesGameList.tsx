import React from 'react';
import type { AdminMinesGameListItem } from '../../../types';
import TableSkeleton from '../../Shared/TableSkeleton';

interface MinesGameListProps {
  games: AdminMinesGameListItem[];
  loading: boolean;
  included: any[]; // 1. Adicione a propriedade 'included' para receber os dados do usuário
}

const MinesGameList: React.FC<MinesGameListProps> = ({ games, loading, included }) => {
  const formatBalance = (balanceInCents: number) => {
    return (balanceInCents / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  // 2. Função para encontrar o email do usuário nos dados incluídos
  const findUserEmail = (userId: string) => {
    const user = included?.find(item => item.type === 'user' && item.id === userId);
    return user?.attributes?.email || 'Usuário não encontrado';
  };

  const getStateLabel = (state: string) => {
    switch (state) {
      case 'active':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Ativo</span>;
      case 'busted':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Perdeu</span>;
      case 'cashed_out':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Ganhou</span>;
      default:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">{state}</span>;
    }
  };

  return (
    <div className="bg-gray-800 shadow overflow-hidden sm:rounded-lg">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          {/* O thead não muda */}
          <thead className="bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID do Jogo</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Usuário</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Aposta</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Minas</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Multiplicador</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Estado</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Data</th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {loading ? (
              <TableSkeleton columns={7} />
            ) : (
              games.map((game) => (
                <tr key={game.id} className="hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{game.id}</td>
                  {/* 3. CORREÇÃO: Use a função para buscar o email */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {findUserEmail(game.relationships.user.data.id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{formatBalance(game.attributes.bet_amount)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{game.attributes.mines_count}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{game.attributes.payout_multiplier}x</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{getStateLabel(game.attributes.state)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{new Date(game.attributes.created_at).toLocaleString('pt-BR')}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MinesGameList;