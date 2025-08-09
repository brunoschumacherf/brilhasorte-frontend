import React, { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import Modal from '../Shared/Modal';
import { createDeposit } from '../../services/api';
import type { DepositResponse } from '../../types';
import { toast } from 'react-toastify';

// Interface para os dados do formulário
interface DepositFormData {
  amount: number;
  bonus_code?: string;
}

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose }) => {
  const [depositData, setDepositData] = useState<DepositResponse | null>(null);
  
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<DepositFormData>();

  // Limpa o estado do modal quando ele é fechado
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        reset({ amount: undefined, bonus_code: '' });
        setDepositData(null);
      }, 300);
    }
  }, [isOpen, reset]);

  // Handler para o envio do formulário de depósito
  const handleDeposit: SubmitHandler<DepositFormData> = async (data) => {
    const amountInCents = Math.round(data.amount * 100);
    const bonusCode = data.bonus_code || undefined;

    try {
      const response = await createDeposit({ amount_in_cents: amountInCents, bonus_code: bonusCode });
      setDepositData(response.data.data.attributes);
      toast.success('PIX gerado com sucesso!', { toastId: 'deposit-success' });
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Ocorreu um erro ao gerar o PIX.";
      toast.error(errorMessage, { toastId: 'deposit-error' });
    }
  };

  // Handler para copiar o código PIX
  const copyToClipboard = () => {
    if (depositData) {
      navigator.clipboard.writeText(depositData.pix_qr_code_payload);
      toast.info('Código PIX Copiado!', { toastId: 'copy-success' });
    }
  };
  
  // Componente de erro reutilizável
  const FieldError: React.FC<{ message?: string }> = ({ message }) => message ? <p className="form-error">{message}</p> : null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={depositData ? "Pagar com PIX" : "Fazer um Depósito"}>
      {!depositData ? (
        // Etapa 1: Formulário de Depósito
        <form onSubmit={handleSubmit(handleDeposit)} className="space-y-4">
          <div>
            <label htmlFor="amount" className="form-label">Valor do Depósito (R$)</label>
            <input
              {...register("amount", { 
                required: "O valor é obrigatório",
                valueAsNumber: true,
                min: { value: 1, message: "O valor mínimo é R$ 1,00" } 
              })}
              type="number"
              id="amount"
              placeholder="Ex: 50,00"
              step="0.01"
              className="form-input"
            />
            <FieldError message={errors.amount?.message} />
          </div>
          <div>
            <label htmlFor="bonus_code" className="form-label">Código de Bônus (opcional)</label>
            <input
              {...register("bonus_code")}
              type="text"
              id="bonus_code"
              placeholder="Insira seu código"
              className="form-input"
            />
          </div>
          <div className="pt-4 flex justify-end">
             <button type="button" onClick={onClose} className="btn btn-secondary">
                Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
            >
              {isSubmitting ? 'Gerando PIX...' : 'Gerar PIX'}
            </button>
          </div>
        </form>
      ) : (
        // Etapa 2: Exibição do QR Code
        <div className="text-center">
          <p className="mb-4 text-gray-300">Escaneie o QR Code ou use o "Copia e Cola".</p>
          <img 
            src={depositData.pix_qr_code_image_base64} 
            alt="PIX QR Code" 
            className="mx-auto my-4 border-2 border-gray-400 rounded-lg bg-white p-2"
            style={{ width: '256px', height: '256px' }}
          />
          <textarea 
            readOnly 
            value={depositData.pix_qr_code_payload} 
            className="form-input w-full p-2 mt-1 text-xs resize-none" 
            rows={3} 
          />
          <button 
            onClick={copyToClipboard} 
            className="btn btn-primary w-full mt-4"
          >
            Copiar Código
          </button>
          <p className="text-xs text-gray-500 mt-4">Após o pagamento, o saldo será atualizado automaticamente.</p>
        </div>
      )}
    </Modal>
  );
};

export default DepositModal;