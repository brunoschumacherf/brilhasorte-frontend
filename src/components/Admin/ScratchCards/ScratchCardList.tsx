import React, { useState, useEffect, useCallback } from 'react';
import { getAdminScratchCardList, getAdminScratchCardDetails } from '../../../services/api';
import type { AdminScratchCard, JsonApiData, AdminPrize } from '../../../types';
import ScratchCardForm from './ScratchCardForm';
import TableSkeleton from '../../Shared/TableSkeleton';
import PaginationControls from '../../Shared/PaginationControls';
import { toast } from 'react-toastify';

// Tipo auxiliar para identificar recursos em relacionamentos JSON:API
type ResourceIdentifier = { id: string; type: string };

const ScratchCardList: React.FC = () => {
  const [scratchCards, setScratchCards] = useState<AdminScratchCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<AdminScratchCard | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchScratchCards = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const response = await getAdminScratchCardList(page);
      const cards = response.data.data.map(item => ({
        ...item.attributes,
        id: parseInt(item.id, 10)
      }));
      setScratchCards(cards);
      setTotalPages(parseInt(response.headers['total-pages'] || '1'));
      setCurrentPage(parseInt(response.headers['current-page'] || '1'));
    } catch (error) {
      toast.error('Não foi possível carregar as raspadinhas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScratchCards(currentPage);
  }, [currentPage, fetchScratchCards]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleSave = () => {
    setIsModalOpen(false);
    setSelectedCard(null);
    fetchScratchCards(currentPage);
  };

  const handleEdit = async (card: AdminScratchCard) => {
    setIsDetailLoading(true);
    setSelectedCard(card);
    try {
      const response = await getAdminScratchCardDetails(card.id);
      const includedData: JsonApiData<any>[] = response.data.included || [];
      
      const fullCardData: AdminScratchCard = {
        ...response.data.data.attributes,
        id: parseInt(response.data.data.id, 10),
        prizes: (response.data.data.relationships?.prizes?.data || [])
          .map((pRel: ResourceIdentifier) => {
            const prizeData = includedData.find(inc => inc.id === pRel.id && inc.type === 'prize');
            if (!prizeData) return null;
            return { ...prizeData.attributes, id: parseInt(prizeData.id, 10) };
          })
          .filter((p: any): p is AdminPrize => p !== null),
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
  
  const formatPrice = (priceInCents: number) => {
    return (priceInCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Raspadinhas</h1>
        <button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
          Adicionar Nova
        </button>
      </div>

      <div className="bg-gray-800 shadow sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Preço</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {loading ? <TableSkeleton cols={4} /> : scratchCards.map((card) => (
                <tr key={card.id} className="hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">{card.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400">{formatPrice(card.price_in_cents)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${card.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {card.is_active ? 'Ativa' : 'Inativa'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => handleEdit(card)} 
                      className="text-indigo-400 hover:text-indigo-300 disabled:text-gray-500"
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
      </div>
      
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {isModalOpen && <ScratchCardForm isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} existingScratchCard={selectedCard} />}
    </div>
  );
};

export default ScratchCardList;