import React, { useState, useEffect } from 'react';
import { getAdminBonusCodeList } from '../../../services/api';
import type { AdminBonusCode } from '../../../types';
import BonusCodeForm from './BonusCodeForm';

const BonusCodeList: React.FC = () => {
  const [bonusCodes, setBonusCodes] = useState<AdminBonusCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCode, setSelectedCode] = useState<AdminBonusCode | null>(null);

  const fetchBonusCodes = () => {
    setLoading(true);
    getAdminBonusCodeList()
      .then(response => {
        setBonusCodes(response.data.data.map(item => item.attributes));
      })
      .catch(() => setError('Não foi possível carregar os códigos.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBonusCodes();
  }, []);

  const handleSave = () => {
    setIsModalOpen(false);
    setSelectedCode(null);
    fetchBonusCodes();
  };

  const handleEdit = (code: AdminBonusCode) => {
    setSelectedCode(code);
    setIsModalOpen(true);
  };
  
  const handleAddNew = () => {
    setSelectedCode(null);
    setIsModalOpen(true);
  };

  if (loading) return <p className="text-gray-500">Carregando...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-end items-center mb-4">
        <button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
          Adicionar Novo Código
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bônus</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usos</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expira em</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bonusCodes.map(code => (
              <tr key={code.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold text-gray-900">{code.code}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{(code.bonus_percentage * 100).toFixed(0)}%</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{code.uses_count} / {code.max_uses === -1 ? 'Ilimitado' : code.max_uses}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {code.expires_at ? new Date(code.expires_at).toLocaleDateString('pt-BR') : 'Nunca'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${code.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {code.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleEdit(code)} className="text-indigo-600 hover:text-indigo-900">
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <BonusCodeForm isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} existingBonusCode={selectedCode} />
    </div>
  );
};

export default BonusCodeList;
