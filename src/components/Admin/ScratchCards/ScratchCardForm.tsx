import React, { useState, useEffect } from 'react';
import Modal from '../../Shared/Modal';
import type { AdminScratchCard, AdminPrize } from '../../../types';
import { createAdminScratchCard, updateAdminScratchCard } from '../../../services/api';

interface ScratchCardFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (scratchCard: AdminScratchCard) => void;
  existingScratchCard: AdminScratchCard | null;
}

const ScratchCardForm: React.FC<ScratchCardFormProps> = ({ isOpen, onClose, onSave, existingScratchCard }) => {
  const [formData, setFormData] = useState<Omit<AdminScratchCard, 'id'>>({
    name: '', price_in_cents: 0, description: '', image_url: '', is_active: true, prizes: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (existingScratchCard) {
      setFormData({
        name: existingScratchCard.name,
        price_in_cents: existingScratchCard.price_in_cents,
        description: existingScratchCard.description || '',
        image_url: existingScratchCard.image_url || '',
        is_active: existingScratchCard.is_active,
        prizes: existingScratchCard.prizes.map(p => ({...p, image_url: p.image_url || ''})) || [],
      });
    } else {
      setFormData({ name: '', price_in_cents: 0, description: '', image_url: '', is_active: true, prizes: [] });
    }
  }, [existingScratchCard, isOpen]);

  const handleMainChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handlePrizeChange = (index: number, field: keyof AdminPrize, value: any) => {
    const newPrizes = [...formData.prizes];
    (newPrizes[index] as any)[field] = value;
    setFormData({ ...formData, prizes: newPrizes });
  };

  const addPrize = () => {
    setFormData({ ...formData, prizes: [...formData.prizes, { name: '', value_in_cents: 0, probability: 0, stock: -1, image_url: '' }] });
  };
  
  const removePrize = (index: number) => {
    const prize = formData.prizes[index];
    if (prize.id) {
      handlePrizeChange(index, '_destroy', true);
    } else {
      setFormData({ ...formData, prizes: formData.prizes.filter((_, i) => i !== index) });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const payload = {
      ...formData,
      price_in_cents: Number(formData.price_in_cents),
      prizes_attributes: formData.prizes.map(p => ({
        ...p,
        value_in_cents: Number(p.value_in_cents),
        probability: Number(p.probability),
        stock: Number(p.stock),
      })),
    };
    // @ts-ignore
    delete payload.prizes;

    try {
      const response = existingScratchCard
        ? await updateAdminScratchCard(existingScratchCard.id, payload)
        : await createAdminScratchCard(payload);
      onSave(response.data.data.attributes);
    } catch (err: any) {
      setError(err.response?.data?.errors?.join(', ') || 'Ocorreu um erro.');
    } finally {
      setLoading(false);
    }
  };

  const PrizeInput: React.FC<{label: string, name: keyof AdminPrize, index: number, value: any, type?: string, step?: string}> = 
  ({label, name, index, value, type = 'text', step}) => (
    <div>
      <label htmlFor={`${name}-${index}`} className="block text-xs font-medium text-gray-600">{label}</label>
      <input
        id={`${name}-${index}`}
        type={type}
        step={step}
        placeholder={label}
        value={value}
        onChange={e => handlePrizeChange(index, name, e.target.value)}
        className="mt-1 w-full border rounded-md p-2 text-sm"
      />
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={existingScratchCard ? 'Editar Raspadinha' : 'Nova Raspadinha'}>
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
        {error && <p className="bg-red-100 text-red-700 p-3 rounded">{error}</p>}
        
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome da Raspadinha</label>
          <input type="text" name="name" id="name" value={formData.name} onChange={handleMainChange} required className="mt-1 w-full border rounded-md p-2" />
        </div>
        <div>
          <label htmlFor="price_in_cents" className="block text-sm font-medium text-gray-700">Preço (em centavos)</label>
          <input type="number" id="price_in_cents" name="price_in_cents" value={formData.price_in_cents} onChange={handleMainChange} required className="mt-1 w-full border rounded-md p-2" />
        </div>
        {/* CAMPO ADICIONADO AQUI */}
        <div>
          <label htmlFor="image_url" className="block text-sm font-medium text-gray-700">URL da Imagem da Raspadinha (opcional)</label>
          <input type="text" id="image_url" name="image_url" value={formData.image_url || ''} onChange={handleMainChange} className="mt-1 w-full border rounded-md p-2" />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição</label>
          <textarea id="description" name="description" value={formData.description || ''} onChange={handleMainChange} className="mt-1 w-full border rounded-md p-2" />
        </div>
        <div className="flex items-center">
          <input type="checkbox" id="is_active" name="is_active" checked={formData.is_active} onChange={handleMainChange} className="h-4 w-4 rounded" />
          <label htmlFor="is_active" className="ml-2 block text-sm font-medium text-gray-700">Ativa</label>
        </div>
        
        <hr className="my-4"/>
        <h4 className="text-lg font-medium">Prêmios</h4>
        
        <div className="space-y-4">
          {formData.prizes.filter(p => !p._destroy).map((prize, index) => (
            <div key={index} className="p-4 border rounded-lg bg-gray-50 relative">
              <button type="button" onClick={() => removePrize(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold text-xl">&times;</button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PrizeInput label="Nome do Prêmio" name="name" index={index} value={prize.name} />
                <PrizeInput label="Valor (centavos)" name="value_in_cents" index={index} value={prize.value_in_cents} type="number"/>
                <PrizeInput label="Probabilidade (0.0 a 1.0)" name="probability" index={index} value={prize.probability} type="number" step="0.001"/>
                <PrizeInput label="Estoque (-1 para infinito)" name="stock" index={index} value={prize.stock} type="number"/>
                <div className="md:col-span-2">
                  <PrizeInput label="URL da Imagem (opcional)" name="image_url" index={index} value={prize.image_url || ''}/>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button type="button" onClick={addPrize} className="mt-2 text-sm font-semibold text-blue-600 hover:text-blue-800">+ Adicionar Prêmio</button>
        
        <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
          <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancelar</button>
          <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-400">
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ScratchCardForm;