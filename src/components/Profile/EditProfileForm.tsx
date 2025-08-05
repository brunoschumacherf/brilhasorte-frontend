import React, { useState } from 'react';
import type { User } from '../../types';
import { updateProfile } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface EditProfileFormProps {
  user: User;
  onSave: () => void;
  onCancel: () => void;
}

const EditProfileForm: React.FC<EditProfileFormProps> = ({ user, onSave, onCancel }) => {
  const { updateUserDetails } = useAuth();
  const [formData, setFormData] = useState({
    full_name: user.full_name || '',
    cpf: user.cpf || '',
    birth_date: user.birth_date || '',
    phone_number: user.phone_number || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await updateProfile(formData);
      updateUserDetails(response.data.data.attributes); // Atualiza o contexto global
      onSave(); // Fecha o formulário
    } catch (err: any) {
      setError(err.response?.data?.errors?.join(', ') || 'Erro ao atualizar o perfil.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 sm:p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Editar Perfil</h3>
      {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</p>}
      
      <div className="space-y-4">
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">Nome Completo</label>
          <input type="text" name="full_name" id="full_name" value={formData.full_name} onChange={handleChange} className="mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500" />
        </div>
        <div>
          <label htmlFor="cpf" className="block text-sm font-medium text-gray-700">CPF</label>
          <input type="text" name="cpf" id="cpf" value={formData.cpf} onChange={handleChange} className="mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500" />
        </div>
        <div>
          <label htmlFor="birth_date" className="block text-sm font-medium text-gray-700">Data de Nascimento</label>
          <input type="date" name="birth_date" id="birth_date" value={formData.birth_date} onChange={handleChange} className="mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500" />
        </div>
        <div>
          <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">Telefone</label>
          <input type="tel" name="phone_number" id="phone_number" value={formData.phone_number} onChange={handleChange} className="mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500" />
        </div>
      </div>

      <div className="flex justify-end space-x-4 mt-6">
        <button type="button" onClick={onCancel} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">
          Cancelar
        </button>
        <button type="submit" disabled={loading} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-400">
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>
    </form>
  );
};

export default EditProfileForm;