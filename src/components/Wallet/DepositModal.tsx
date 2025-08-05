import React, { useState } from 'react';
import Modal from '../Shared/Modal';
import { createDeposit } from '../../services/api';
import type { DepositResponse } from '../../types';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [depositData, setDepositData] = useState<DepositResponse | null>(null);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountInCents = Math.round(parseFloat(amount) * 100);

    if (isNaN(amountInCents) || amountInCents <= 0) {
      setError('Por favor, insira um valor válido.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await createDeposit(amountInCents);
      setDepositData(response.data.data.attributes);
    } catch (err: any) {
      setError(err.response?.data?.error || "Ocorreu um erro ao gerar o PIX.");
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setAmount('');
    setError('');
    setDepositData(null);
    onClose();
  };

  const copyToClipboard = () => {
    if (depositData) {
      navigator.clipboard.writeText(depositData.pix_qr_code_payload);
      alert('Código PIX Copiado!');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={resetAndClose} title={depositData ? "Pagar com PIX" : "Fazer um Depósito"}>
      {!depositData ? (
        // Passo 1: Formulário para inserir o valor
        <form onSubmit={handleDeposit}>
          <div className="mb-4">
            <label htmlFor="amount" className="block text-gray-700 text-sm font-bold mb-2">
              Valor do Depósito (R$)
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Ex: 50,00"
              step="0.01"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-400"
          >
            {loading ? 'Gerando PIX...' : 'Gerar PIX'}
          </button>
        </form>
      ) : (
        // Passo 2: Mostrar o QR Code e o código
        <div className="text-center">
          <p className="mb-4 text-gray-600">Escaneie o QR Code com o app do seu banco ou use o "Copia e Cola".</p>
          <img 
            src={depositData.pix_qr_code_image_base64} 
            alt="PIX QR Code" 
            className="mx-auto my-4 border rounded-lg"
            // A imagem base64 do backend é um placeholder, então vamos aumentar o tamanho dela
            style={{ width: '256px', height: '256px' }}
          />
          <div className="mb-4">
            <label className="font-bold text-sm">PIX Copia e Cola:</label>
            <textarea
              readOnly
              value={depositData.pix_qr_code_payload}
              className="w-full p-2 mt-1 text-xs border rounded bg-gray-100 resize-none"
              rows={4}
            />
          </div>
          <button
            onClick={copyToClipboard}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
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