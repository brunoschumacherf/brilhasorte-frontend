import React, { useState } from 'react';
import Modal from '../Shared/Modal';
import { createWithdrawal } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WithdrawalModal: React.FC<WithdrawalModalProps> = ({ isOpen, onClose }) => {
  const { user, updateBalance } = useAuth();
  const [amount, setAmount] = useState('');
  const [pixKeyType, setPixKeyType] = useState('cpf');
  const [pixKey, setPixKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountInCents = Math.round(parseFloat(amount) * 100);

    if (!user || user.balance_in_cents < amountInCents) {
      setError('Saldo insuficiente.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      await createWithdrawal({ amount_in_cents: amountInCents, pix_key_type: pixKeyType, pix_key: pixKey });
      updateBalance(user.balance_in_cents - amountInCents); // Atualiza saldo localmente
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || "Ocorreu um erro ao solicitar o saque.");
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setAmount('');
    setPixKeyType('cpf');
    setPixKey('');
    setError('');
    setSuccess(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={resetAndClose} title="Solicitar Saque">
      {success ? (
        <div className="text-center">
          <h3 className="text-lg font-medium text-green-600">Saque Solicitado!</h3>
          <p className="mt-2 text-sm text-gray-600">
            Sua solicitação de saque foi enviada com sucesso e será processada em breve.
          </p>
          <button onClick={resetAndClose} className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">
            Fechar
          </button>
        </div>
      ) : (
        <form onSubmit={handleWithdrawal}>
          <div className="mb-4">
            <label htmlFor="amount" className="block text-gray-700 text-sm font-bold mb-2">Valor do Saque (R$)</label>
            <input type="number" id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Ex: 50,00" required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500" />
            {user && <p className="text-xs text-gray-500 mt-1">Saldo disponível: R$ {(user.balance_in_cents / 100).toFixed(2)}</p>}
          </div>

          <div className="mb-4">
            <label htmlFor="pixKeyType" className="block text-gray-700 text-sm font-bold mb-2">Tipo de Chave PIX</label>
            <select id="pixKeyType" value={pixKeyType} onChange={(e) => setPixKeyType(e.target.value)} className="w-full px-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-yellow-500">
              <option value="cpf">CPF</option>
              <option value="email">Email</option>
              <option value="phone">Telefone</option>
              <option value="random">Chave Aleatória</option>
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="pixKey" className="block text-gray-700 text-sm font-bold mb-2">Chave PIX</label>
            <input type="text" id="pixKey" value={pixKey} onChange={(e) => setPixKey(e.target.value)} placeholder="Sua chave PIX" required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500" />
          </div>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <button type="submit" disabled={loading} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-400">
            {loading ? 'Solicitando...' : 'Confirmar Saque'}
          </button>
        </form>
      )}
    </Modal>
  );
};

export default WithdrawalModal;