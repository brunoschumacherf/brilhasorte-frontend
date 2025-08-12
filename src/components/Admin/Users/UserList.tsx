import React, { useState, useEffect } from 'react';
import { getAdminUserList } from '../../../services/api';
import type { AdminUserListItem } from '../../../types';
import PaginationControls from '../../Shared/PaginationControls';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Users, Wallet, Gamepad2, Calendar } from 'lucide-react';

const UserList: React.FC = () => {
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = async (page: number) => {
    setLoading(true);
    try {
      const response = await getAdminUserList(page);
      const formattedUsers: AdminUserListItem[] = response.data.data.map((item: any) => ({
        ...item.attributes,
        id: parseInt(item.id, 10),
      }));
      setUsers(formattedUsers);
      setTotalPages(parseInt(response.headers['total-pages'] || '1'));
      setCurrentPage(parseInt(response.headers['current-page'] || '1'));
    } catch (error) {
      toast.error('Não foi possível carregar a lista de utilizadores.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  const formatBalance = (balanceInCents: number) => {
    return (balanceInCents / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const renderContent = () => {
    if (loading) return <div className="text-center text-gray-400 py-12">A carregar utilizadores...</div>;
    if (users.length === 0) return <div className="text-center text-gray-400 py-12">Nenhum utilizador encontrado.</div>;

    return (
        <div className="space-y-4">
            {users.map((user, index) => (
                <motion.div
                    key={user.id}
                    className="bg-white/5 p-4 rounded-lg border border-white/10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div className="md:col-span-1">
                            <p className="font-medium text-white truncate">{user.full_name || 'N/A'}</p>
                            <p className="text-xs text-gray-400 truncate">{user.email}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Saldo</p>
                            <p className="font-semibold text-green-400">{formatBalance(user.balance_in_cents)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Atividade</p>
                            <div className="flex items-center gap-3 text-gray-300">
                                <span className="flex items-center gap-1"><Gamepad2 size={14} /> {user.games_count}</span>
                                <span className="flex items-center gap-1"><Wallet size={14} /> {user.deposits_count}</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Data de Registo</p>
                            <p className="text-gray-300 flex items-center gap-2">
                                <Calendar size={14} /> {new Date(user.created_at).toLocaleDateString('pt-BR')}
                            </p>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
  };

  return (
    <div className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-3"><Users /> Gestão de Utilizadores</h1>
                <p className="text-sm text-gray-400 mt-1">Gira e monitorize todos os utilizadores da plataforma.</p>
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

export default UserList;
