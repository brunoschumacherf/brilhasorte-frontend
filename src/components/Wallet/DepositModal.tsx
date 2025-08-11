import React, { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import Modal from '../Shared/Modal';
import { createDeposit } from '../../services/api';
import type { DepositResponse } from '../../types';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check } from 'lucide-react';

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
  const [isCopied, setIsCopied] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<DepositFormData>();

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        reset({ amount: undefined, bonus_code: '' });
        setDepositData(null);
        setIsCopied(false);
      }, 300);
    }
  }, [isOpen, reset]);

  const handleDeposit: SubmitHandler<DepositFormData> = async (data) => {
    const amountInCents = Math.round(data.amount * 100);
    const bonusCode = data.bonus_code || undefined;

    try {
      const response = await createDeposit({ amount_in_cents: amountInCents, bonus_code: bonusCode });
      setDepositData(response.data.data.attributes);
      toast.success('PIX gerado com sucesso!');
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Ocorreu um erro ao gerar o PIX.";
      toast.error(errorMessage);
    }
  };

  const copyToClipboard = () => {
    if (depositData) {
      navigator.clipboard.writeText(depositData.pix_qr_code_payload);
      setIsCopied(true);
      toast.info('Código PIX Copiado!');
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={depositData ? "Pagar com PIX" : "Fazer um Depósito"}>
      <AnimatePresence mode="wait">
        {!depositData ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.3 }}
          >
            <form onSubmit={handleSubmit(handleDeposit)} className="space-y-6">
              <div>
                <label htmlFor="amount" className="block text-xs font-medium text-gray-400 mb-1">Valor do Depósito (R$)</label>
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
                  className={`w-full bg-zinc-800 border ${errors.amount ? 'border-red-500' : 'border-zinc-700'} rounded-lg py-2 px-3 text-white transition-colors focus:border-yellow-500 focus:ring-yellow-500 focus:outline-none`}
                />
                {errors.amount && <p className="text-xs text-red-400 mt-1">{errors.amount.message}</p>}
              </div>
              <div>
                <label htmlFor="bonus_code" className="block text-xs font-medium text-gray-400 mb-1">Código de Bónus (opcional)</label>
                <input
                  {...register("bonus_code")}
                  type="text"
                  id="bonus_code"
                  placeholder="Insira o seu código"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2 px-3 text-white transition-colors focus:border-yellow-500 focus:ring-yellow-500 focus:outline-none"
                />
              </div>
              <div className="flex justify-end space-x-4 pt-4">
                <motion.button type="button" onClick={onClose} className="px-6 py-2 rounded-lg text-sm font-bold text-gray-300 bg-white/5 hover:bg-white/10" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  Cancelar
                </motion.button>
                <motion.button type="submit" disabled={isSubmitting} className="px-6 py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-green-500 to-emerald-600 text-white disabled:opacity-50" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  {isSubmitting ? 'A gerar...' : 'Gerar PIX'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="qrcode"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <p className="mb-4 text-gray-300">Escaneie o QR Code ou use o "Copia e Cola".</p>
            <div className="mx-auto my-4 p-2 bg-white rounded-lg inline-block">
                <img 
                    src={depositData.pix_qr_code_image_base64} 
                    alt="PIX QR Code" 
                    className="w-56 h-56"
                />
            </div>
            <div className="relative">
                <textarea 
                    readOnly 
                    value={depositData.pix_qr_code_payload} 
                    className="w-full p-2 pr-10 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-gray-300 resize-none" 
                    rows={3} 
                />
                <button 
                    onClick={copyToClipboard} 
                    className="absolute top-2 right-2 p-1.5 rounded-md bg-white/10 text-gray-300 hover:bg-white/20"
                >
                    {isCopied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                </button>
            </div>
            <p className="text-xs text-gray-500 mt-4">Após o pagamento, o saldo será atualizado automaticamente.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
};

export default DepositModal;
