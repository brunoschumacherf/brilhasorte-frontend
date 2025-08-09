import React, { useState, useEffect } from 'react';
import { getAdminBonusCodeList } from '../../../services/api';
import type { AdminBonusCode } from '../../../types';
import BonusCodeForm from './BonusCodeForm';
import TableSkeleton from '../../Shared/TableSkeleton';
import PaginationControls from '../../Shared/PaginationControls';
import { toast } from 'react-toastify';

const BonusCodeList: React.FC = () => {
  const [bonusCodes, setBonusCodes] = useState<AdminBonusCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCode, setSelectedCode] = useState<AdminBonusCode | null>(null);

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetches data for the specified page
  const fetchBonusCodes = async (page: number) => {
    setLoading(true);
    try {
      const response = await getAdminBonusCodeList(page);
      setBonusCodes(response.data.data);
      setTotalPages(parseInt(response.headers['total-pages'] || '1'));
      setCurrentPage(parseInt(response.headers['current-page'] || '1'));
    } catch (error) {
      toast.error('Não foi possível carregar os códigos de bônus.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBonusCodes(currentPage);
  }, [currentPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleSave = () => {
    setIsModalOpen(false);
    setSelectedCode(null);
    fetchBonusCodes(currentPage); // Refresh current page
  };

  const handleEdit = (code: AdminBonusCode) => {
    // We pass the full object including attributes to the form
    setSelectedCode(code);
    setIsModalOpen(true);
  };
  
  const handleAddNew = () => {
    setSelectedCode(null);
    setIsModalOpen(true);
  };

  const formatUses = (usesCount: number, maxUses: number) => {
    if (maxUses === -1) {
      return `${usesCount} / Ilimitado`;
    }
    return `${usesCount} / ${maxUses}`;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Códigos de Bônus</h1>
        <button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
          Adicionar Novo
        </button>
      </div>

      <div className="bg-gray-800 shadow sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Código</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Bônus (%)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Usos</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Expira em</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {loading ? <TableSkeleton cols={6} /> : bonusCodes.map((item) => {
                const code = item.attributes; // Access attributes for data
                return (
                  <tr key={item.id} className="hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold text-gray-200">{code.code}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400">{(code.bonus_percentage * 100).toFixed(0)}%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{formatUses(code.uses_count, code.max_uses)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {code.expires_at ? new Date(code.expires_at).toLocaleDateString('pt-BR') : 'Nunca'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${code.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {code.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleEdit(item)} className="text-indigo-400 hover:text-indigo-300">
                        Editar
                      </button>
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

      {isModalOpen && <BonusCodeForm isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} existingBonusCode={selectedCode} />}
    </div>
  );
};

export default BonusCodeList;