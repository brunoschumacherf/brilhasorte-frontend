import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../../services/api';

const ResetPasswordForm: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== passwordConfirmation) {
      setError('As senhas não conferem.');
      return;
    }
    if (!token) {
      setError('Token de redefinição inválido.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await resetPassword(password, passwordConfirmation, token);
      setMessage(response.data.status.message);
      setTimeout(() => navigate('/login'), 3000); // Redireciona para o login após 3s
    } catch (err: any) {
      setError(err.response?.data?.errors?.join(', ') || 'Ocorreu um erro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Definir Nova Senha</h2>
        {message && <p className="bg-green-100 text-green-700 p-3 rounded mb-4">{message}</p>}
        {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</p>}

        {!message && (
          <>
            <div className="mb-4">
              <input
                type="password"
                placeholder="Nova senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                required
              />
            </div>
            <div className="mb-6">
              <input
                type="password"
                placeholder="Confirme a nova senha"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                required
              />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-400">
              {loading ? 'Salvando...' : 'Salvar Nova Senha'}
            </button>
          </>
        )}
      </form>
    </div>
  );
};

export default ResetPasswordForm;