import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { User } from '../../types';
import { updateProfile } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

interface EditProfileFormProps {
  user: User;
  onSave: () => void;
  onCancel: () => void;
}

// Esquema de validação com Zod para o formulário de perfil
const profileSchema = z.object({
  full_name: z.string().min(3, "O nome completo é obrigatório"),
  cpf: z.string().min(11, "O CPF deve ter no mínimo 11 dígitos"),
  birth_date: z.string().refine((date) => new Date(date) < new Date(), "Data de nascimento inválida"),
  phone_number: z.string().min(10, "O telefone é obrigatório"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const EditProfileForm: React.FC<EditProfileFormProps> = ({ user, onSave, onCancel }) => {
  const { updateUserDetails } = useAuth();
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: user.full_name || '',
      cpf: user.cpf || '',
      birth_date: user.birth_date || '',
      phone_number: user.phone_number || '',
    }
  });

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const response = await updateProfile(data);
      updateUserDetails(response.data.data.attributes); // Atualiza o contexto global
      toast.success("Perfil atualizado com sucesso!");
      onSave(); // Fecha o formulário
    } catch (err: any) {
      toast.error(err.response?.data?.errors?.join(', ') || 'Erro ao atualizar o perfil.');
    }
  };

  const Field: React.FC<{name: keyof ProfileFormData, label: string, type?: string}> = ({ name, label, type = 'text' }) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-[var(--text-secondary)]">{label}</label>
      <input 
        {...register(name)} 
        id={name}
        type={type}
        className="mt-1 w-full bg-[#2a2a2a] p-3 border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-gold)]"
      />
      {errors[name] && <p className="text-red-400 text-xs mt-1">{errors[name]?.message}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6">
      <h3 className="text-lg font-bold text-[var(--primary-gold)] mb-4">Editar Perfil</h3>
      
      <div className="space-y-4">
        <Field name="full_name" label="Nome Completo" />
        <Field name="cpf" label="CPF" />
        <Field name="birth_date" label="Data de Nascimento" type="date" />
        <Field name="phone_number" label="Telefone" type="tel" />
      </div>

      <div className="flex justify-end space-x-4 mt-6 pt-4 border-t border-[var(--border-color)]">
        <button type="button" onClick={onCancel} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg">
          Cancelar
        </button>
        <button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-500">
          {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>
    </form>
  );
};

export default EditProfileForm;