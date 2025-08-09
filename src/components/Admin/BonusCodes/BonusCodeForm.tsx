import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../../Shared/Modal';
import type { AdminBonusCode } from '../../../types';
import { createAdminBonusCode, updateAdminBonusCode } from '../../../services/api';
import { toast } from 'react-toastify';
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Zod schema for form validation
const bonusCodeSchema = z.object({
  code: z.string().min(3, "O código deve ter no mínimo 3 caracteres").toUpperCase(),
  bonus_percentage: z.preprocess(
    (val: any) => Number(String(val)),
    z.number().min(0.01, "A porcentagem deve ser maior que 0").max(1, "A porcentagem não pode ser maior que 1 (100%)")
  ),
  max_uses: z.preprocess(
    (val: any) => Number(String(val)),
    z.number().int("O número de usos deve ser inteiro")
  ),
  expires_at: z.string().optional().nullable(),
  is_active: z.boolean(),
});

type BonusCodeFormData = z.infer<typeof bonusCodeSchema>;

interface BonusCodeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bonusCode: AdminBonusCode) => void;
  existingBonusCode: AdminBonusCode | null;
}

const BonusCodeForm: React.FC<BonusCodeFormProps> = ({ isOpen, onClose, onSave, existingBonusCode }) => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<BonusCodeFormData>({
    resolver: zodResolver(bonusCodeSchema),
  });

  useEffect(() => {
    if (isOpen) {
      if (existingBonusCode) {
        reset({
          code: existingBonusCode.code,
          bonus_percentage: existingBonusCode.bonus_percentage,
          max_uses: existingBonusCode.max_uses,
          expires_at: existingBonusCode.expires_at ? existingBonusCode.expires_at.split('T')[0] : '',
          is_active: existingBonusCode.is_active,
        });
      } else {
        reset({ code: '', bonus_percentage: 0.1, max_uses: -1, expires_at: '', is_active: true });
      }
    }
  }, [existingBonusCode, isOpen, reset]);

  const onSubmit = async (data: BonusCodeFormData) => {
    try {
      const response = existingBonusCode
        ? await updateAdminBonusCode(existingBonusCode.id, data)
        : await createAdminBonusCode(data);
      toast.success(`Código de bônus ${existingBonusCode ? 'atualizado' : 'criado'} com sucesso!`);
      onSave(response.data.data.attributes); // Adjusted to pass the correct data structure
    } catch (err: any) {
      toast.error(err.response?.data?.errors?.join(', ') || 'Ocorreu um erro.');
    }
  };

  const FieldError: React.FC<{ message?: string }> = ({ message }) => message ? <p className="text-red-500 text-xs mt-1">{message}</p> : null;

  const inputClasses = "mt-1 w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 focus:ring-blue-500 focus:border-blue-500";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={existingBonusCode ? 'Editar Código de Bônus' : 'Novo Código de Bônus'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="code" className="block text-sm font-medium text-gray-700">Código</label>
          <input {...register("code")} id="code" className={inputClasses} />
          <FieldError message={errors.code?.message} />
        </div>
        
        <div>
          <label htmlFor="bonus_percentage" className="block text-sm font-medium text-gray-700">Percentual de Bônus (Ex: 0.2 para 20%)</label>
          <input {...register("bonus_percentage")} id="bonus_percentage" type="number" step="0.01" className={inputClasses} />
          <FieldError message={errors.bonus_percentage?.message} />
        </div>

        <div>
          <label htmlFor="max_uses" className="block text-sm font-medium text-gray-700">Máximo de Usos (-1 para infinito)</label>
          <input {...register("max_uses")} id="max_uses" type="number" className={inputClasses} />
          <FieldError message={errors.max_uses?.message} />
        </div>

        <div>
          <label htmlFor="expires_at" className="block text-sm font-medium text-gray-700">Data de Expiração (opcional)</label>
          <input {...register("expires_at")} id="expires_at" type="date" className={inputClasses} />
          <FieldError message={errors.expires_at?.message} />
        </div>
        
        <div className="flex items-center">
          <input {...register("is_active")} id="is_active" type="checkbox" className="h-4 w-4 rounded border-gray-300" />
          <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">Ativo</label>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancelar</button>
          <button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-400">
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default BonusCodeForm;