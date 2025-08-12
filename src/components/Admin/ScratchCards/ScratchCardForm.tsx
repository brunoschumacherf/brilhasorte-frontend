import React, { useEffect } from 'react';
import { useForm, useFieldArray, useWatch, type SubmitHandler } from 'react-hook-form';
import Modal from '../../Shared/Modal';
import type { AdminScratchCard, AdminPrize } from '../../../types';
import { createAdminScratchCard, updateAdminScratchCard } from '../../../services/api';
import { toast } from 'react-toastify';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { X, PlusCircle } from 'lucide-react';

// ✅ CORRIGIDO: Substituído z.preprocess por z.coerce para melhor inferência de tipos.
const prizeSchema = z.object({
  id: z.number().optional().nullable(),
  name: z.string().min(1, "O nome do prémio é obrigatório"),
  value_in_cents: z.coerce.number().min(0, "O valor deve ser positivo."),
  probability: z.coerce.number().min(0, "A probabilidade deve ser positiva.").max(1, "A probabilidade não pode ser maior que 1."),
  stock: z.coerce.number().int("O stock deve ser um número inteiro."),
  image_url: z.string().optional().nullable(),
  _destroy: z.boolean().optional(),
});

const scratchCardSchema = z.object({
  name: z.string().min(3, "O nome é obrigatório"),
  // ✅ CORRIGIDO: Substituído z.preprocess por z.coerce.
  price_in_cents: z.coerce.number().min(0, "O preço deve ser positivo."),
  description: z.string().optional().nullable(),
  image_url: z.string().optional().nullable(),
  is_active: z.boolean(),
  prizes: z.array(prizeSchema),
});

type ScratchCardFormData = z.infer<typeof scratchCardSchema>;

interface ScratchCardFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (scratchCard: AdminScratchCard) => void;
  existingScratchCard: AdminScratchCard | null;
}

const ScratchCardForm: React.FC<ScratchCardFormProps> = ({ isOpen, onClose, onSave, existingScratchCard }) => {
  const { register, control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ScratchCardFormData>({
    resolver: zodResolver(scratchCardSchema), // Este resolver agora funciona sem erros.
    defaultValues: { prizes: [] }
  });

  const { fields, append, remove, update } = useFieldArray({ control, name: "prizes" });
  const prizesWatcher = useWatch({ control, name: 'prizes' });
  const totalProbability = (prizesWatcher || []).filter(p => !p._destroy).reduce((sum, prize) => sum + Number(prize.probability || 0), 0);

  useEffect(() => {
    if (isOpen) {
      if (existingScratchCard) {
        reset({
          ...existingScratchCard,
          price_in_cents: existingScratchCard.price_in_cents / 100,
          prizes: (existingScratchCard.prizes || []).map(prize => ({ ...prize, value_in_cents: prize.value_in_cents / 100 })),
        });
      } else {
        reset({ name: '', price_in_cents: 0, description: '', image_url: '', is_active: true, prizes: [] });
      }
    }
  }, [existingScratchCard, isOpen, reset]);

  const onSubmit: SubmitHandler<ScratchCardFormData> = async (data) => {
    const payload = {
      ...data,
      price_in_cents: Math.round(data.price_in_cents * 100),
      prizes_attributes: data.prizes.map(p => ({ ...p, value_in_cents: Math.round(p.value_in_cents * 100) })),
    };
    // @ts-ignore
    delete payload.prizes;

    try {
      const apiCall = existingScratchCard ? updateAdminScratchCard(existingScratchCard.id, payload) : createAdminScratchCard(payload);
      const response = await apiCall;
      toast.success(`Raspadinha ${existingScratchCard ? 'atualizada' : 'criada'} com sucesso!`);
      onSave(response.data.data.attributes);
    } catch (err: any) {
      toast.error(err.response?.data?.errors?.join(', ') || 'Ocorreu um erro.');
    }
  };
  
  const inputClasses = (hasError: boolean) => `w-full bg-zinc-800 border ${hasError ? 'border-red-500' : 'border-zinc-700'} rounded-lg py-2 px-3 text-white transition-colors focus:border-yellow-500 focus:ring-yellow-500 focus:outline-none`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={existingScratchCard ? 'Editar Raspadinha' : 'Nova Raspadinha'}>
      {/* Este handleSubmit agora funciona sem erros. */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-h-[80vh] overflow-y-auto p-1 pr-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Nome da Raspadinha</label>
                <input {...register("name")} className={inputClasses(!!errors.name)} />
                {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Preço (em R$)</label>
                <input {...register("price_in_cents")} type="number" step="0.01" className={inputClasses(!!errors.price_in_cents)} />
                {errors.price_in_cents && <p className="text-xs text-red-400 mt-1">{errors.price_in_cents.message}</p>}
            </div>
        </div>
        <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">URL da Imagem</label>
            <input {...register("image_url")} className={inputClasses(!!errors.image_url)} />
        </div>
        <div className="flex items-center gap-2">
            <input {...register("is_active")} id="is_active_form" type="checkbox" className="h-4 w-4 rounded border-gray-600 bg-zinc-800 text-yellow-500 focus:ring-yellow-500" />
            <label htmlFor="is_active_form" className="block text-sm text-gray-300">Ativa</label>
        </div>
        
        <div className="border-t border-white/10 pt-4 mt-4">
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-medium text-white">Prémios</h4>
                <div className={`text-sm font-semibold px-2 py-1 rounded-full ${Math.abs(totalProbability - 1.0) < 0.0001 ? 'text-green-300 bg-green-500/10' : 'text-red-300 bg-red-500/10'}`}>
                    Soma: {(totalProbability * 100).toFixed(1)}%
                </div>
            </div>
            <div className="space-y-4">
                {fields.map((field, index) => !field._destroy && (
                    <div key={field.id} className="p-4 border border-white/10 rounded-lg bg-white/5 relative">
                        <button type="button" onClick={() => field.id ? update(index, { ...field, _destroy: true }) : remove(index)} className="absolute top-2 right-2 text-red-400 hover:text-red-300"><X size={16} /></button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-gray-400">Nome do Prémio</label>
                                <input {...register(`prizes.${index}.name`)} className={inputClasses(!!errors.prizes?.[index]?.name)} />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-400">Valor (R$)</label>
                                <input {...register(`prizes.${index}.value_in_cents`)} type="number" step="0.01" className={inputClasses(!!errors.prizes?.[index]?.value_in_cents)} />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-400">Probabilidade (0.0 a 1.0)</label>
                                <input {...register(`prizes.${index}.probability`)} type="number" step="0.001" className={inputClasses(!!errors.prizes?.[index]?.probability)} />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-400">Stock (-1 para infinito)</label>
                                <input {...register(`prizes.${index}.stock`)} type="number" className={inputClasses(!!errors.prizes?.[index]?.stock)} />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-xs font-medium text-gray-400">URL da Imagem do Prémio</label>
                                <input {...register(`prizes.${index}.image_url`)} className={inputClasses(!!errors.prizes?.[index]?.image_url)} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <button type="button" onClick={() => append({ name: '', value_in_cents: 0, probability: 0, stock: -1, image_url: '' })} className="mt-4 flex items-center gap-2 text-sm font-semibold text-yellow-400 hover:text-yellow-300">
                <PlusCircle size={16} /> Adicionar Prémio
            </button>
        </div>
        
        <div className="flex justify-end space-x-4 pt-4 border-t border-white/10 mt-4">
          <motion.button type="button" onClick={onClose} className="px-6 py-2 rounded-lg text-sm font-bold text-gray-300 bg-white/5 hover:bg-white/10" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Cancelar</motion.button>
          <motion.button type="submit" disabled={isSubmitting} className="px-6 py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 text-black disabled:opacity-50" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            {isSubmitting ? 'A salvar...' : 'Salvar'}
          </motion.button>
        </div>
      </form>
    </Modal>
  );
};

export default ScratchCardForm;