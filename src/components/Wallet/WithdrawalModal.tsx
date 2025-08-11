import React, { useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { toast } from 'react-toastify';
import Modal from '../Shared/Modal';
import { createWithdrawal } from '../../services/api';
import { motion } from 'framer-motion';

interface WithdrawalFormData {
  amount: number;
}

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const WithdrawalModal: React.FC<WithdrawalModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<WithdrawalFormData>();

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        reset({ amount: undefined });
      }, 300);
    }
  }, [isOpen, reset]);

  const onSubmit: SubmitHandler<WithdrawalFormData> = async (data) => {
    try {
      await createWithdrawal({
        amount_in_cents: Math.round(data.amount * 100),
        pix_key_type: '',
        pix_key: ''
      });
      toast.success('Solicitação de saque enviada com sucesso!');
      onSuccess();
      onClose();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Erro ao solicitar saque.';
      toast.error(errorMessage);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Solicitar Saque via PIX">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <p className="text-sm text-gray-400 bg-white/5 p-3 rounded-lg border border-white/10">
          O valor será enviado para o **CPF cadastrado** na sua conta. Certifique-se de que os seus dados estão corretos.
        </p>
        <div>
          <label htmlFor="amount" className="block text-xs font-medium text-gray-400 mb-1">
            Valor do Saque (R$)
          </label>
          <input
            type="number"
            id="amount"
            step="0.01"
            placeholder="Ex: 50.00"
            {...register('amount', { 
              required: 'O valor é obrigatório', 
              valueAsNumber: true, 
              min: { value: 1, message: "O valor mínimo é R$ 1,00" }
            })}
            className={`w-full bg-zinc-800 border ${errors.amount ? 'border-red-500' : 'border-zinc-700'} rounded-lg py-2 px-3 text-white transition-colors focus:border-yellow-500 focus:ring-yellow-500 focus:outline-none`}
          />
          {errors.amount && <p className="text-xs text-red-400 mt-1">{errors.amount.message}</p>}
        </div>
        <div className="flex justify-end space-x-4 pt-4">
          <motion.button type="button" onClick={onClose} className="px-6 py-2 rounded-lg text-sm font-bold text-gray-300 bg-white/5 hover:bg-white/10" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            Cancelar
          </motion.button>
          <motion.button type="submit" disabled={isSubmitting} className="px-6 py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-yellow-500 to-amber-600 text-black disabled:opacity-50" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            {isSubmitting ? 'A enviar...' : 'Confirmar Saque'}
          </motion.button>
        </div>
      </form>
    </Modal>
  );
};

export default WithdrawalModal;
