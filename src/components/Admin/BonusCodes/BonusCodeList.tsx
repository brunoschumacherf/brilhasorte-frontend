import React, { useState, useEffect } from 'react';
import { getAdminBonusCodeList } from '../../../services/api';
import type { AdminBonusCode } from '../../../types';
import BonusCodeForm from './BonusCodeForm';
import PaginationControls from '../../Shared/PaginationControls';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Gift, PlusCircle, Edit, CheckCircle2, XCircle } from 'lucide-react';

const BonusCodeList: React.FC = () => {
  const [bonusCodes, setBonusCodes] = useState<AdminBonusCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCode, setSelectedCode] = useState<AdminBonusCode | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchBonusCodes = async (page: number) => {
    setLoading(true);
    try {
      const response = await getAdminBonusCodeList(page);
      const codes = response.data.data.map((item: any) => ({
        ...item.attributes,
        id: parseInt(item.id, 10)
      }));
      setBonusCodes(codes);
      setTotalPages(parseInt(response.headers['total-pages'] || '1'));
      setCurrentPage(parseInt(response.headers['current-page'] || '1'));
    } catch (error) {
      toast.error('Não foi possível carregar os códigos de bónus.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBonusCodes(currentPage);
  }, [currentPage]);

  const handleSave = () => {
    setIsModalOpen(false);
    setSelectedCode(null);
    fetchBonusCodes(currentPage);
  };

  const handleEdit = (code: AdminBonusCode) => {
    setSelectedCode(code);
    setIsModalOpen(true);
  };
  
  const handleAddNew = () => {
    setSelectedCode(null);
    setIsModalOpen(true);
  };

  const formatUses = (usesCount: number, maxUses: number) => {
    return maxUses === -1 ? `${usesCount} / ∞` : `${usesCount} / ${maxUses}`;
  };

  const renderContent = () => {
    if (loading) {
        return <div className="text-center text-gray-400 py-12">A carregar códigos...</div>;
    }
    if (bonusCodes.length === 0) {
        return <div className="text-center text-gray-400 py-12">Nenhum código de bónus encontrado.</div>;
    }
    return (
        <div className="space-y-4">
            {bonusCodes.map((code, index) => (
                <motion.div
                    key={code.id}
                    className="bg-white/5 p-4 rounded-lg border border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                >
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 flex-grow text-sm">
                        <div>
                            <p className="text-xs text-gray-400">Código</p>
                            <p className="font-mono font-bold text-white">{code.code}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Bónus</p>
                            <p className="font-semibold text-green-400">{(code.bonus_percentage * 100).toFixed(0)}%</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Usos</p>
                            <p className="text-gray-300">{formatUses(code.uses_count, code.max_uses)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Expira em</p>
                            <p className="text-gray-400">{code.expires_at ? new Date(code.expires_at).toLocaleDateString('pt-BR') : 'Nunca'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Status</p>
                            <div className={`flex items-center gap-2 text-xs font-semibold px-2 py-1 rounded-full ${code.is_active ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'}`}>
                                {code.is_active ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                                <span>{code.is_active ? 'Ativo' : 'Inativo'}</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => handleEdit(code)} className="flex-shrink-0 text-yellow-400 hover:text-yellow-300 p-2 rounded-md hover:bg-white/10 transition-colors">
                        <Edit size={16} />
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
            <h1 className="text-2xl font-bold text-white flex items-center gap-3"><Gift /> Códigos de Bónus</h1>
            <p className="text-sm text-gray-400 mt-1">Crie e gira os códigos de bónus para os seus utilizadores.</p>
        </div>
        <motion.button 
            onClick={handleAddNew} 
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 text-black"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
          <PlusCircle size={16} />
          Adicionar Novo
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

      <BonusCodeForm 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSave} 
        existingBonusCode={selectedCode} 
      />
    </div>
  );
};

export default BonusCodeList;
