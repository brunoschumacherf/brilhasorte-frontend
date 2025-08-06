import React, { useState, useEffect } from 'react';
import Modal from '../../Shared/Modal';
import type { AdminBonusCode } from '../../../types';
import { createAdminBonusCode, updateAdminBonusCode } from '../../../services/api';

interface BonusCodeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bonusCode: AdminBonusCode) => void;
  existingBonusCode: AdminBonusCode | null;
}

const BonusCodeForm: React.FC<BonusCodeFormProps> = ({ isOpen, onClose, onSave, existingBonusCode }) => {
  const [formData, setFormData] = useState({
    code: '',
    bonus_percentage: 0.1,
    max_uses: -1,
    expires_at: '',
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (existingBonusCode) {
      setFormData({
        code: existingBonusCode.code,
        bonus_percentage: existingBonusCode.bonus_percentage,
        max_uses: existingBonusCode.max_uses,
        expires_at: existingBonusCode.expires_at ? existingBonusCode.expires_at.split('T')[0] : '',
        is_active: existingBonusCode.is_active,
      });
    } else {
      setFormData({ code: '', bonus_percentage: 0.1, max_uses: -1, expires_at: '', is_active: true });
    }
  }, [existingBonusCode, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = { ...formData, bonus_percentage: Number(formData.bonus_percentage), max_uses: Number(formData.max_uses) };
      const response = existingBonusCode
        ? await updateAdminBonusCode(existingBonusCode.id, payload)
        : await createAdminBonusCode(payload);
      onSave(response.data.data.attributes);
    } catch (err: any) {
      setError(err.response?.data?.errors?.join(', ') || 'Ocorreu um erro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={existingBonusCode ? 'Editar Código de Bônus' : 'Novo Código de Bônus'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="bg-red-100 text-red-700 p-3 rounded">{error}</p>}
        
        <div>
          <label htmlFor="code" className="block text-sm font-medium text-gray-700">Código</label>
          <input type="text" name="code" id="code" value={formData.code} onChange={handleChange} required className="mt-1 w-full px-3 py-2 border rounded-md" />
        </div>
        
        <div>
          <label htmlFor="bonus_percentage" className="block text-sm font-medium text-gray-700">Percentual de Bônus (Ex: 0.2 para 20%)</label>
          <input type="number" step="0.01" name="bonus_percentage" id="bonus_percentage" value={formData.bonus_percentage} onChange={handleChange} required className="mt-1 w-full px-3 py-2 border rounded-md" />
        </div>

        <div>
          <label htmlFor="max_uses" className="block text-sm font-medium text-gray-700">Máximo de Usos (-1 para infinito)</label>
          <input type="number" name="max_uses" id="max_uses" value={formData.max_uses} onChange={handleChange} required className="mt-1 w-full px-3 py-2 border rounded-md" />
        </div>

        <div>
          <label htmlFor="expires_at" className="block text-sm font-medium text-gray-700">Data de Expiração (opcional)</label>
          <input type="date" name="expires_at" id="expires_at" value={formData.expires_at} onChange={handleChange} className="mt-1 w-full px-3 py-2 border rounded-md" />
        </div>
        
        <div className="flex items-center">
          <input type="checkbox" name="is_active" id="is_active" checked={formData.is_active} onChange={handleChange} className="h-4 w-4 rounded" />
          <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">Ativo</label>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancelar</button>
          <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-400">
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default BonusCodeForm;