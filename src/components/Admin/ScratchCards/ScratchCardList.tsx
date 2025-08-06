import React, { useState, useEffect } from 'react';
import { getAdminScratchCardList } from '../../../services/api';
import type { AdminScratchCard } from '../../../types';
import ScratchCardForm from './ScratchCardForm';

const ScratchCardList: React.FC = () => {
  const [scratchCards, setScratchCards] = useState<AdminScratchCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<AdminScratchCard | null>(null);

  const fetchScratchCards = () => {
    setLoading(true);
    getAdminScratchCardList()
      .then(response => {
        const includedData = response.data.included || [];
        const cardData = response.data.data.map(item => ({
          ...item.attributes,
          id: parseInt(item.id),
          prizes: (item.relationships?.prizes?.data || [])
            .map((pRel: any) => {
              const prizeData = includedData.find(inc => inc.id === pRel.id && inc.type === 'prize');
              return prizeData ? { ...prizeData.attributes, id: parseInt(prizeData.id) } : null;
            })
            .filter(Boolean),
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

  const handleEdit = (card: AdminScratchCard) => {
    setSelectedCard(card);
    setIsModalOpen(true);
  };
  
  const handleAddNew = () => {
    setSelectedCard(null);
    setIsModalOpen(true);
  };

  if (loading) return <p>Carregando...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Gerenciamento de Raspadinhas</h1>
        <button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
          Adicionar Nova
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preço</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prêmios</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {scratchCards.map(card => (
              <tr key={card.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{card.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">R$ {(card.price_in_cents / 100).toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{card.prizes.length}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${card.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {card.is_active ? 'Ativa' : 'Inativa'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleEdit(card)} className="text-indigo-600 hover:text-indigo-900">Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ScratchCardForm isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} existingScratchCard={selectedCard} />
    </div>
  );
};

export default ScratchCardList;