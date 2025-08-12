import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../../Shared/Modal';
import type { AdminBonusCode } from '../../../types';
import { createAdminBonusCode, updateAdminBonusCode } from '../../../services/api';
import { toast } from 'react-toastify';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';

const bonusCodeSchema = z.object({
  code: z.string().min(3, "O código deve ter no mínimo 3 caracteres.").transform(val => val.toUpperCase()),
  bonus_percentage: z.preprocess(
    (val: any) => Number(String(val)),
    z.number().min(0.01, "A percentagem deve ser maior que 0").max(1, "A percentagem não pode ser maior que 1 (100%)")
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
    } else {
        setTimeout(() => reset(), 300);
    }
  }, [existingBonusCode, isOpen, reset]);

  const onSubmit = async (data: BonusCodeFormData) => {
    try {
      const response = existingBonusCode
        ? await updateAdminBonusCode(existingBonusCode.id, data)
        : await createAdminBonusCode(data);
      toast.success(`Código de bónus ${existingBonusCode ? 'atualizado' : 'criado'} com sucesso!`);
      onSave(response.data.data.attributes);
    } catch (err: any) {
      toast.error(err.response?.data?.errors?.join(', ') || 'Ocorreu um erro.');
    }
  };

  const inputClasses = (hasError: boolean) => 
    `w-full bg-zinc-800 border ${hasError ? 'border-red-500' : 'border-zinc-700'} rounded-lg py-2 px-3 text-white transition-colors focus:border-yellow-500 focus:ring-yellow-500 focus:outline-none`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={existingBonusCode ? 'Editar Código de Bónus' : 'Novo Código de Bónus'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="code" className="block text-xs font-medium text-gray-400 mb-1">Código</label>
          <input {...register("code")} id="code" className={inputClasses(!!errors.code)} />
          {errors.code && <p className="text-xs text-red-400 mt-1">{errors.code.message}</p>}
        </div>
        
        <div>
          <label htmlFor="bonus_percentage" className="block text-xs font-medium text-gray-400 mb-1">Percentual de Bónus (Ex: 0.2 para 20%)</label>
          <input {...register("bonus_percentage")} id="bonus_percentage" type="number" step="0.01" className={inputClasses(!!errors.bonus_percentage)} />
          {errors.bonus_percentage && <p className="text-xs text-red-400 mt-1">{errors.bonus_percentage.message}</p>}
        </div>

        <div>
          <label htmlFor="max_uses" className="block text-xs font-medium text-gray-400 mb-1">Máximo de Usos (-1 para infinito)</label>
          <input {...register("max_uses")} id="max_uses" type="number" className={inputClasses(!!errors.max_uses)} />
          {errors.max_uses && <p className="text-xs text-red-400 mt-1">{errors.max_uses.message}</p>}
        </div>

        <div>
          <label htmlFor="expires_at" className="block text-xs font-medium text-gray-400 mb-1">Data de Expiração (opcional)</label>
          <input {...register("expires_at")} id="expires_at" type="date" className={inputClasses(!!errors.expires_at)} />
          {errors.expires_at && <p className="text-xs text-red-400 mt-1">{errors.expires_at.message}</p>}
        </div>
        
        <div className="flex items-center gap-2">
          <input {...register("is_active")} id="is_active" type="checkbox" className="h-4 w-4 rounded border-gray-600 bg-zinc-800 text-yellow-500 focus:ring-yellow-500" />
          <label htmlFor="is_active" className="block text-sm text-gray-300">Ativo</label>
        </div>
        
        <div className="flex justify-end space-x-4 pt-4">
          <motion.button type="button" onClick={onClose} className="px-6 py-2 rounded-lg text-sm font-bold text-gray-300 bg-white/5 hover:bg-white/10" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            Cancelar
          </motion.button>
          <motion.button type="submit" disabled={isSubmitting} className="px-6 py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 text-black disabled:opacity-50" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            {isSubmitting ? 'A salvar...' : 'Salvar'}
          </motion.button>
        </div>
      </form>
    </Modal>
  );
};

export default BonusCodeForm;
