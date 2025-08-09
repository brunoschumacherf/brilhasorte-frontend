import React from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { toast } from 'react-toastify';
import Modal from '../Shared/Modal';
import { createWithdrawal } from '../../services/api';
import type { WithdrawalRequest } from '../../types';

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const WithdrawalModal: React.FC<WithdrawalModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<WithdrawalRequest>();

  const onSubmit: SubmitHandler<WithdrawalRequest> = async (data) => {
    try {
      await createWithdrawal({
        amount_in_cents: Math.round(data.amount_in_cents * 100),
        pix_key_type: '', // O backend cuida disso
        pix_key: ''      // O backend cuida disso
      });
      toast.success('Solicitação de saque enviada com sucesso!', { toastId: 'withdrawal-success' });
      onClose();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Erro ao solicitar saque.';
      toast.error(errorMessage, { toastId: 'withdrawal-error' });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Solicitar Saque via PIX">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <p className="text-sm text-gray-400">
            O valor será enviado para o CPF cadastrado em sua conta.
          </p>
          <div>
            <label htmlFor="amount_in_cents" className="form-label">
              Valor (R$)
            </label>
            <input
              type="number"
              id="amount_in_cents"
              step="0.01"
              placeholder="Ex: 50.00"
              {...register('amount_in_cents', { 
                required: 'Valor é obrigatório', 
                valueAsNumber: true, 
                min: { value: 1, message: "O valor mínimo é R$ 1,00" }
              })}
              className="form-input"
            />
            {errors.amount_in_cents && <p className="form-error">{errors.amount_in_cents.message}</p>}
          </div>
        </div>
        <div className="mt-6 flex justify-end">
            <button type="button" onClick={onClose} className="btn btn-secondary">
                Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                {isSubmitting ? 'Enviando...' : 'Confirmar Saque'}
            </button>
        </div>
      </form>
    </Modal>
  );
};

export default WithdrawalModal;