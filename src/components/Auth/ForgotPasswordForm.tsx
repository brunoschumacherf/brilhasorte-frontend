import React, { useState } from 'react';
import { requestPasswordReset } from '../../services/api';

const ForgotPasswordForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await requestPasswordReset(email);
      setMessage(response.data.status.message);
    } catch (err: any) {
      setError(err.response?.data?.status?.message || 'Ocorreu um erro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Recuperar Senha</h2>
        {message && <p className="bg-green-100 text-green-700 p-3 rounded mb-4">{message}</p>}
        {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</p>}

        {!message && (
          <>
            <p className="text-center text-gray-600 mb-4">Digite seu e-mail e enviaremos um link para redefinir sua senha.</p>
            <div className="mb-4">
              <input
                type="email"
                placeholder="Seu e-mail de cadastro"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                required
              />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-400">
              {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
            </button>
          </>
        )}
      </form>
    </div>
  );
};

export default ForgotPasswordForm;