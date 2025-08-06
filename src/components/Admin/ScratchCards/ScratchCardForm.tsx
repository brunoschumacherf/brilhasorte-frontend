import React, { useEffect } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Modal from '../../Shared/Modal';
import type { AdminScratchCard, AdminPrize } from '../../../types';
import { createAdminScratchCard, updateAdminScratchCard } from '../../../services/api';
import { toast } from 'react-toastify';

// Esquema de validação para um prêmio individual
const prizeSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Nome é obrigatório"),
  value_in_cents: z.preprocess(val => Number(String(val).replace(/[^0-9]/g, '')), z.number().min(0, "Valor deve ser >= 0")),
  probability: z.preprocess(val => Number(val), z.number().min(0, "Prob. deve ser >= 0").max(1, "Prob. deve ser <= 1")),
  stock: z.preprocess(val => Number(val), z.number().int("Estoque deve ser um número inteiro")),
  image_url: z.string().url("Deve ser uma URL válida").optional().or(z.literal('')),
  _destroy: z.boolean().optional(),
});

// Esquema de validação para a raspadinha, com a validação customizada da soma
const scratchCardSchema = z.object({
  name: z.string().min(3, "O nome é obrigatório"),
  price_in_cents: z.preprocess(val => Number(String(val).replace(/[^0-9]/g, '')), z.number().min(0, "O preço deve ser >= 0")),
  description: z.string().optional(),
  image_url: z.string().url("Deve ser uma URL válida").optional().or(z.literal('')),
  is_active: z.boolean(),
  prizes: z.array(prizeSchema).min(1, "É necessário pelo menos um prêmio."),
}).refine(data => {
  const totalProbability = data.prizes
    .filter(p => !p._destroy)
    .reduce((sum, prize) => sum + Number(prize.probability || 0), 0);
  return Math.abs(totalProbability - 1.0) < 0.0001;
}, {
  message: "A soma das probabilidades de todos os prêmios deve ser exatamente 1.0 (100%)",
  path: ["prizes"],
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
    resolver: zodResolver(scratchCardSchema),
    defaultValues: {
      name: '', price_in_cents: 0, description: '', image_url: '', is_active: true, prizes: []
    }
  });

  const { fields, append, remove, update } = useFieldArray({ control, name: "prizes" });
  
  const prizesWatcher = useWatch({ control, name: 'prizes' });
  const totalProbability = (prizesWatcher || [])
    .filter(p => !p._destroy)
    .reduce((sum, prize) => sum + Number(prize.probability || 0), 0);

  useEffect(() => {
    if (isOpen) {
      if (existingScratchCard) {
        reset({
          ...existingScratchCard,
          description: existingScratchCard.description || '',
          image_url: existingScratchCard.image_url || '',
          prizes: existingScratchCard.prizes || [],
        });
      } else {
        reset({ name: '', price_in_cents: 0, description: '', image_url: '', is_active: true, prizes: [] });
      }
    }
  }, [existingScratchCard, isOpen, reset]);

  const onSubmit = async (data: ScratchCardFormData) => {
    const payload = { ...data, prizes_attributes: data.prizes };
    // @ts-ignore
    delete payload.prizes;

    try {
      const response = existingScratchCard
        ? await updateAdminScratchCard(existingScratchCard.id, payload)
        : await createAdminScratchCard(payload);
      toast.success(`Raspadinha ${existingScratchCard ? 'atualizada' : 'criada'} com sucesso!`);
      onSave(response.data.data.attributes);
    } catch (err: any) {
      toast.error(err.response?.data?.errors?.join(', ') || 'Ocorreu um erro.');
    }
  };
  
  const inputClasses = "mt-1 w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 focus:ring-blue-500 focus:border-blue-500";
  const FieldError: React.FC<{ message?: string }> = ({ message }) => message ? <p className="text-red-500 text-xs mt-1">{message}</p> : null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={existingScratchCard ? 'Editar Raspadinha' : 'Nova Raspadinha'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[80vh] overflow-y-auto p-1">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nome da Raspadinha</label>
          <input {...register("name")} className={inputClasses} />
          <FieldError message={errors.name?.message} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Preço (em centavos)</label>
          <input {...register("price_in_cents")} type="number" className={inputClasses} />
          <FieldError message={errors.price_in_cents?.message} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">URL da Imagem</label>
          <input {...register("image_url")} className={inputClasses} />
          <FieldError message={errors.image_url?.message} />
        </div>
        <div className="flex items-center">
          <input {...register("is_active")} type="checkbox" className="h-4 w-4 rounded border-gray-300" />
          <label className="ml-2 block text-sm text-gray-900">Ativa</label>
        </div>
        
        <hr className="my-4"/>
        <div className="flex justify-between items-center">
          <h4 className="text-lg font-medium text-gray-900">Prêmios</h4>
          <div className={`text-sm font-semibold px-2 py-1 rounded ${Math.abs(totalProbability - 1.0) < 0.0001 ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}`}>
            Soma: {(totalProbability * 100).toFixed(1)}%
          </div>
        </div>
        <FieldError message={errors.prizes?.message || errors.prizes?.root?.message} />
        
        <div className="space-y-4">
          {fields.map((field, index) => {
            if (field._destroy) return null;
            
            return (
              <div key={field.id} className="p-4 border rounded-lg bg-gray-50 relative">
                <button 
                  type="button" 
                  onClick={() => field.id ? update(index, { ...field, _destroy: true }) : remove(index)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold text-xl"
                >&times;</button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-600">Nome do Prêmio</label>
                    <input {...register(`prizes.${index}.name`)} className={inputClasses} />
                    <FieldError message={errors.prizes?.[index]?.name?.message} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">Valor (centavos)</label>
                    <input {...register(`prizes.${index}.value_in_cents`)} type="number" className={inputClasses} />
                    <FieldError message={errors.prizes?.[index]?.value_in_cents?.message} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">Probabilidade (0.0 a 1.0)</label>
                    <input {...register(`prizes.${index}.probability`)} type="number" step="0.001" className={inputClasses} />
                    <FieldError message={errors.prizes?.[index]?.probability?.message} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">Estoque (-1 para infinito)</label>
                    <input {...register(`prizes.${index}.stock`)} type="number" className={inputClasses} />
                    <FieldError message={errors.prizes?.[index]?.stock?.message} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-medium text-gray-600">URL da Imagem</label>
                    <input {...register(`prizes.${index}.image_url`)} className={inputClasses} />
                    <FieldError message={errors.prizes?.[index]?.image_url?.message} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button type="button" onClick={() => append({ name: '', value_in_cents: 0, probability: 0, stock: -1, image_url: '' })} className="mt-2 text-sm font-semibold text-blue-600 hover:text-blue-800">+ Adicionar Prêmio</button>
        
        <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
          <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancelar</button>
          <button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-400">
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ScratchCardForm;
