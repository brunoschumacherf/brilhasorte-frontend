import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Login bem-sucedido!');
      navigate('/games');
    } catch (err) {
      toast.error('Falha no login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--background-dark)] px-4">
      <div className="bg-[var(--surface-dark)] border border-[var(--border-color)] p-8 rounded-lg shadow-lg w-full max-w-md text-center">
        
        <img src="/logo.png" alt="BrilhaSorte Logo" className="h-20 w-20 mx-auto mb-4" />

        <h2 className="text-3xl font-bold mb-6 text-[var(--primary-gold)]">
          Bem-vindo de Volta!
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#2a2a2a] text-white p-3 border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-gold)] transition"
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#2a2a2a] text-white p-3 border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-gold)] transition"
              required
            />
          </div>
          <div className="text-right">
            <Link to="/forgot-password" className="text-sm text-blue-400 hover:underline">
              Esqueceu a senha?
            </Link>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[var(--primary-gold)] text-black font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-yellow-500/20 hover:bg-yellow-300 disabled:bg-gray-500 disabled:shadow-none"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
          <p className="text-center text-sm text-[var(--text-secondary)]">
            Não tem uma conta?{' '}
            <Link to="/register" className="font-medium text-[var(--primary-gold)] hover:underline">
              Cadastre-se
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
