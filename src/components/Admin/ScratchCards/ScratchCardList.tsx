import React, { useState, useEffect, useCallback } from 'react';
import { getAdminScratchCardList, getAdminScratchCardDetails } from '../../../services/api';
import type { AdminScratchCard, JsonApiData, AdminPrize } from '../../../types';
import ScratchCardForm from './ScratchCardForm';
import PaginationControls from '../../Shared/PaginationControls';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Ticket, PlusCircle, Edit, CheckCircle2, XCircle } from 'lucide-react';

type ResourceIdentifier = { id: string; type: string };

const ScratchCardList: React.FC = () => {
  const [scratchCards, setScratchCards] = useState<AdminScratchCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<AdminScratchCard | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchScratchCards = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const response = await getAdminScratchCardList(page);
      const cards = response.data.data.map((item: any) => ({
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

  const handleSave = () => {
    setIsModalOpen(false);
    setSelectedCard(null);
    fetchScratchCards(currentPage);
  };

  const handleEdit = async (card: AdminScratchCard) => {
    setIsDetailLoading(card.id);
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
      setIsDetailLoading(null);
    }
  };

  const handleAddNew = () => {
    setSelectedCard(null);
    setIsModalOpen(true);
  };
  
  const formatPrice = (priceInCents: number) => {
    return (priceInCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  const renderContent = () => {
    if (loading) return <div className="text-center text-gray-400 py-12">A carregar raspadinhas...</div>;
    if (scratchCards.length === 0) return <div className="text-center text-gray-400 py-12">Nenhuma raspadinha encontrada.</div>;

    return (
        <div className="space-y-4">
            {scratchCards.map((card, index) => (
                <motion.div
                    key={card.id}
                    className="bg-white/5 p-4 rounded-lg border border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                >
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 flex-grow text-sm">
                        <div className="sm:col-span-1">
                            <p className="text-xs text-gray-400">Nome</p>
                            <p className="font-medium text-white">{card.name}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Preço</p>
                            <p className="font-semibold text-green-400">{formatPrice(card.price_in_cents)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Status</p>
                            <div className={`flex items-center gap-2 text-xs font-semibold px-2 py-1 rounded-full ${card.is_active ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'}`}>
                                {card.is_active ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                                <span>{card.is_active ? 'Ativa' : 'Inativa'}</span>
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={() => handleEdit(card)} 
                        className="flex-shrink-0 text-yellow-400 hover:text-yellow-300 p-2 rounded-md hover:bg-white/10 transition-colors disabled:opacity-50"
                        disabled={isDetailLoading !== null}
                    >
                        {isDetailLoading === card.id ? 'A carregar...' : <Edit size={16} />}
                    </button>
                </motion.div>
            ))}
        </div>
    );
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3"><Ticket /> Raspadinhas</h1>
            <p className="text-sm text-gray-400 mt-1">Crie e gira as raspadinhas disponíveis para os utilizadores.</p>
        </div>
        <motion.button 
            onClick={handleAddNew} 
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 text-black"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
          <PlusCircle size={16} />
          Adicionar Nova
        </motion.button>
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

      {isModalOpen && <ScratchCardForm isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} existingScratchCard={selectedCard} />}
    </div>
  );
};

export default ScratchCardList;
