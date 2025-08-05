import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import FormField from '../Layout/FormField';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    cpf: '',
    birth_date: '',
    phone_number: '',
    password: '',
    password_confirmation: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.password_confirmation) {
      setError('As senhas não conferem.');
      return;
    }
    setLoading(true);
    try {
      await register(formData);
      navigate('/games');
    } catch (err: any) {
      const apiError = err.response?.data?.status?.message || "Falha no registro. Verifique os dados e tente novamente.";
      setError(apiError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Crie sua Conta</h2>
        {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center">{error}</p>}
        
        <FormField label="Nome Completo" type="text" name="full_name" value={formData.full_name} onChange={handleChange} required />
        <FormField label="Email" type="email" name="email" value={formData.email} onChange={handleChange} required />
        <FormField label="CPF" type="text" name="cpf" value={formData.cpf} onChange={handleChange} required />
        <FormField label="Data de Nascimento" type="date" name="birth_date" value={formData.birth_date} onChange={handleChange} required />
        <FormField label="Telefone" type="tel" name="phone_number" value={formData.phone_number} onChange={handleChange} required />
        <FormField label="Senha" type="password" name="password" value={formData.password} onChange={handleChange} required />
        <FormField label="Confirmação da Senha" type="password" name="password_confirmation" value={formData.password_confirmation} onChange={handleChange} required />
        
        <button type="submit" disabled={loading} className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-gray-400">
          {loading ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>
    </div>
  );
};

export default Register;