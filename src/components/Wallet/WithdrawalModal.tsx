import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Modal from '../Shared/Modal';
import { createWithdrawal } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const withdrawalSchema = (maxAmount: number) => z.object({
  amount: z.preprocess(
    (val) => Number(String(val).replace(',', '.')),
    z.number()
      .positive("O valor deve ser positivo.")
      .max(maxAmount, `O valor não pode ser maior que seu saldo de R$ ${maxAmount.toFixed(2)}`)
  ),
  pix_key_type: z.string(),
  pix_key: z.string().min(1, "A chave PIX é obrigatória."),
});

type WithdrawalFormData = z.infer<ReturnType<typeof withdrawalSchema>>;

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WithdrawalModal: React.FC<WithdrawalModalProps> = ({ isOpen, onClose }) => {
  const { user, updateBalance } = useAuth();
  const [success, setSuccess] = useState(false);
  const userBalance = user ? user.balance_in_cents / 100 : 0;

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<WithdrawalFormData>({
    resolver: zodResolver(withdrawalSchema(userBalance)),
  });

  useEffect(() => {
    if (!isOpen) {
      reset({ amount: undefined, pix_key_type: 'cpf', pix_key: '' });
      setSuccess(false);
    }
  }, [isOpen, reset]);

  const handleWithdrawal = async (data: WithdrawalFormData) => {
    if (!user) return;
    const amountInCents = Math.round(data.amount * 100);
    
    try {
      await createWithdrawal({ amount_in_cents: amountInCents, pix_key_type: data.pix_key_type, pix_key: data.pix_key });
      updateBalance(user.balance_in_cents - amountInCents);
      setSuccess(true);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Ocorreu um erro ao solicitar o saque.");
    }
  };

  const FieldError: React.FC<{ message?: string }> = ({ message }) => message ? <p className="text-red-500 text-xs mt-1">{message}</p> : null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Solicitar Saque">
      {success ? (
        <div className="text-center">
          <h3 className="text-lg font-medium text-green-600">Saque Solicitado!</h3>
          <p className="mt-2 text-sm text-gray-600">Sua solicitação foi enviada e será processada em breve.</p>
          <button onClick={onClose} className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">Fechar</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(handleWithdrawal)} className="space-y-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Valor do Saque (R$)</label>
            <input {...register("amount")} type="number" id="amount" placeholder="Ex: 50,00" step="0.01" className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900" />
            {user && <p className="text-xs text-gray-500 mt-1">Saldo disponível: R$ {userBalance.toFixed(2)}</p>}
            <FieldError message={errors.amount?.message} />
          </div>

          <div>
            <label htmlFor="pix_key_type" className="block text-sm font-medium text-gray-700">Tipo de Chave PIX</label>
            <select {...register("pix_key_type")} id="pix_key_type" className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900">
              <option value="cpf">CPF</option>
              <option value="email">Email</option>
              <option value="phone">Telefone</option>
              <option value="random">Chave Aleatória</option>
            </select>
          </div>

          <div>
            <label htmlFor="pix_key" className="block text-sm font-medium text-gray-700">Chave PIX</label>
            <input {...register("pix_key")} type="text" id="pix_key" placeholder="Sua chave PIX" className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900" />
            <FieldError message={errors.pix_key?.message} />
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-400">
            {isSubmitting ? 'Solicitando...' : 'Confirmar Saque'}
          </button>
        </form>
      )}
    </Modal>
  );
};

export default WithdrawalModal;
