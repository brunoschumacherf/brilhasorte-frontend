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
    fetchBonusCodes(); // Recarrega a lista
  };

  const handleEdit = (code: AdminBonusCode) => {
    setSelectedCode(code);
    setIsModalOpen(true);
  };
  
  const handleAddNew = () => {
    setSelectedCode(null);
    setIsModalOpen(true);
  };

  if (loading) return <p>Carregando...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Gerenciamento de Códigos de Bônus</h1>
        <button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
          Adicionar Novo
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bônus</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usos</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bonusCodes.map(code => (
              <tr key={code.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold">{code.code}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{(code.bonus_percentage * 100).toFixed(0)}%</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{code.uses_count} / {code.max_uses === -1 ? '∞' : code.max_uses}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${code.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {code.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleEdit(code)} className="text-indigo-600 hover:text-indigo-900">Editar</button>
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