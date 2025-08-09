import React from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { toast } from 'react-toastify';
import type { User } from '../../types';
import { updateProfile } from '../../services/api';

interface EditProfileFormProps {
  user: User;
  onSave: (data: Partial<User>) => void; // A função onSave agora é síncrona, corrigindo o erro
  onCancel: () => void;
}

const EditProfileForm: React.FC<EditProfileFormProps> = ({ user, onSave, onCancel }) => {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<User>({
    defaultValues: {
      ...user,
      birth_date: user.birth_date ? user.birth_date.split('T')[0] : '',
    },
  });

  const onSubmit: SubmitHandler<User> = async (data) => {
    // Remove o CPF dos dados, pois ele não pode ser alterado
    const { cpf, ...updatableData } = data;
    
    try {
      // Chama a API para atualizar o perfil
      const response = await updateProfile(updatableData);
      
      // Se a API responder com sucesso, extrai os novos dados
      const updatedUser = response.data.data.attributes;
      
      toast.success("Perfil atualizado com sucesso!");
      
      // Chama a função onSave passada pelo pai para atualizar a UI
      onSave(updatedUser);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Erro ao atualizar o perfil.';
      toast.error(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="full_name" className="block text-sm font-medium text-gray-300">Nome Completo</label>
        <input id="full_name" type="text" {...register('full_name')} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md p-2" />
      </div>

      <div>
        <label htmlFor="cpf" className="block text-sm font-medium text-gray-300">CPF</label>
        <input 
          id="cpf" 
          type="text" 
          {...register('cpf')} 
          className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md p-2 text-gray-400 cursor-not-allowed" 
          disabled 
        />
        <p className="text-xs text-gray-500 mt-1">O CPF não pode ser alterado após o cadastro.</p>
      </div>

      <div>
        <label htmlFor="phone_number" className="block text-sm font-medium text-gray-300">Telefone</label>
        <input id="phone_number" type="tel" {...register('phone_number')} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md p-2" />
      </div>

      <div>
        <label htmlFor="birth_date" className="block text-sm font-medium text-gray-300">Data de Nascimento</label>
        <input id="birth_date" type="date" {...register('birth_date')} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md p-2" />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button type="button" onClick={onCancel} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
          Cancelar
        </button>
        <button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-500">
          {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>
    </form>
  );
};

export default EditProfileForm;