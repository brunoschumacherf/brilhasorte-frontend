import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Modal from '../Shared/Modal';
import { createDeposit } from '../../services/api';
import type { DepositResponse } from '../../types';
import { toast } from 'react-toastify';

const depositSchema = z.object({
  amount: z.preprocess(
    (val) => Number(String(val).replace(',', '.')),
    z.number().positive("O valor deve ser positivo.")
  ),
  bonus_code: z.string().optional(),
});

type DepositFormData = z.infer<typeof depositSchema>;

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose }) => {
  const [depositData, setDepositData] = useState<DepositResponse | null>(null);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<DepositFormData>({
    resolver: zodResolver(depositSchema),
  });

  useEffect(() => {
    if (!isOpen) {
      reset({ amount: undefined, bonus_code: '' });
      setDepositData(null);
    }
  }, [isOpen, reset]);

  const handleDeposit = async (data: DepositFormData) => {
    const amountInCents = Math.round(data.amount * 100);
    const bonusCode = data.bonus_code || undefined;

    try {
      const response = await createDeposit({ amount_in_cents: amountInCents, bonus_code: bonusCode });
      setDepositData(response.data.data.attributes);
      toast.success('PIX gerado com sucesso!');
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Ocorreu um erro ao gerar o PIX.");
    }
  };

  const copyToClipboard = () => {
    if (depositData) {
      navigator.clipboard.writeText(depositData.pix_qr_code_payload);
      toast.info('Código PIX Copiado!');
    }
  };

  const FieldError: React.FC<{ message?: string }> = ({ message }) => message ? <p className="text-red-500 text-xs mt-1">{message}</p> : null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={depositData ? "Pagar com PIX" : "Fazer um Depósito"}>
      {!depositData ? (
        <form onSubmit={handleSubmit(handleDeposit)} className="space-y-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Valor do Depósito (R$)</label>
            <input
              {...register("amount")}
              type="number"
              id="amount"
              placeholder="Ex: 50,00"
              step="0.01"
              className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900"
            />
            <FieldError message={errors.amount?.message} />
          </div>
          <div>
            <label htmlFor="bonus_code" className="block text-sm font-medium text-gray-700">Código de Bônus (opcional)</label>
            <input
              {...register("bonus_code")}
              type="text"
              id="bonus_code"
              placeholder="Insira seu código"
              className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-400"
          >
            {isSubmitting ? 'Gerando PIX...' : 'Gerar PIX'}
          </button>
        </form>
      ) : (
        <div className="text-center">
          <p className="mb-4 text-gray-600">Escaneie o QR Code ou use o "Copia e Cola".</p>
          <img src={depositData.pix_qr_code_image_base64} alt="PIX QR Code" className="mx-auto my-4 border rounded-lg w-64 h-64" />
          <textarea readOnly value={depositData.pix_qr_code_payload} className="w-full p-2 mt-1 text-xs border rounded bg-gray-100 resize-none text-gray-800" rows={4} />
          <button onClick={copyToClipboard} className="mt-2 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">Copiar Código</button>
          <p className="text-xs text-gray-500 mt-4">Após o pagamento, o saldo será atualizado automaticamente.</p>
        </div>
      )}
    </Modal>
  );
};

export default DepositModal;
