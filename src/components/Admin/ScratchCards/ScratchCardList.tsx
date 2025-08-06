import React, { useState, useEffect } from 'react';
import { getAdminScratchCardList, getAdminScratchCardDetails } from '../../../services/api';
import type { AdminScratchCard } from '../../../types';
import ScratchCardForm from './ScratchCardForm';
import TableSkeleton from '../../Shared/TableSkeleton';
import { toast } from 'react-toastify';

const ScratchCardList: React.FC = () => {
  const [scratchCards, setScratchCards] = useState<AdminScratchCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false); // Loading para o detalhe
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<AdminScratchCard | null>(null);

  const fetchScratchCards = () => {
    setLoading(true);
    getAdminScratchCardList()
      .then(response => {
        const cardData = response.data.data.map(item => ({
          ...item.attributes,
          id: parseInt(item.id),
          prizes: [], // A lista não precisa carregar os prêmios
        }));
        setScratchCards(cardData);
      })
      .catch(() => setError('Não foi possível carregar as raspadinhas.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchScratchCards();
  }, []);

  const handleSave = () => {
    setIsModalOpen(false);
    setSelectedCard(null);
    fetchScratchCards();
  };

  const handleEdit = async (card: AdminScratchCard) => {
    setIsDetailLoading(true);
    try {
      const response = await getAdminScratchCardDetails(card.id);
      const includedData = response.data.included || [];
      const fullCardData = {
        ...response.data.data.attributes,
        id: parseInt(response.data.data.id),
        prizes: (response.data.data.relationships?.prizes?.data || [])
          .map((pRel: any) => {
            const prizeData = includedData.find(inc => inc.id === pRel.id && inc.type === 'prize');
            return prizeData ? { ...prizeData.attributes, id: parseInt(prizeData.id) } : null;
          })
          .filter(Boolean),
      };
      setSelectedCard(fullCardData);
      setIsModalOpen(true);
    } catch {
      toast.error("Não foi possível carregar os detalhes da raspadinha.");
    } finally {
      setIsDetailLoading(false);
    }
  };
  
  const handleAddNew = () => {
    setSelectedCard(null);
    setIsModalOpen(true);
  };

  if (loading) return <TableSkeleton rows={5} cols={5} />;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-end items-center mb-4">
        <button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
          Adicionar Nova Raspadinha
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {scratchCards.map(card => (
              <tr key={card.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{card.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">R$ {(card.price_in_cents / 100).toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${card.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {card.is_active ? 'Ativa' : 'Inativa'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => handleEdit(card)} 
                    className="text-indigo-600 hover:text-indigo-900 disabled:text-gray-400"
                    disabled={isDetailLoading}
                  >
                    {isDetailLoading && selectedCard?.id === card.id ? 'Carregando...' : 'Editar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && <ScratchCardForm isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} existingScratchCard={selectedCard} />}
    </div>
  );
};

export default ScratchCardList;
