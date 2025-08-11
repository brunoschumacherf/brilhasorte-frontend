import React, { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, AlertTriangle } from 'lucide-react';
import { requestPasswordReset } from '../../services/api';

// Esquema de validação com Zod
const forgotPasswordSchema = z.object({
  email: z.string().email("Formato de e-mail inválido"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// Componente de campo de formulário reutilizável
const InputField = ({ id, type, placeholder, registerProps, icon, errorMsg }: any) => (
    <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">{icon}</span>
        <input
            id={id}
            type={type}
            placeholder={placeholder}
            {...registerProps}
            className={`w-full bg-zinc-800 border ${errorMsg ? 'border-red-500' : 'border-zinc-700'} rounded-lg py-2.5 pl-10 pr-3 text-white transition-colors focus:border-yellow-500 focus:ring-yellow-500 focus:outline-none`}
        />
        {errorMsg && <p className="text-xs text-red-400 mt-1">{errorMsg}</p>}
    </div>
);

const ForgotPasswordPage: React.FC = () => {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema)
  });

  const onSubmit: SubmitHandler<ForgotPasswordFormData> = async (data) => {
    setError('');
    setMessage('');
    try {
      const response = await requestPasswordReset(data.email);
      setMessage(response.data.status.message);
      toast.success(response.data.status.message);
    } catch (err: any) {
      const apiError = err.response?.data?.status?.message || 'Ocorreu um erro. Tente novamente.';
      setError(apiError);
      toast.error(apiError);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#101010] p-4 overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full filter blur-3xl opacity-50 animate-blob"></div>
      <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-black/30 backdrop-blur-md border border-white/10 shadow-2xl rounded-2xl overflow-hidden">
            <div className="p-8 text-center border-b border-white/10">
                <h2 className="text-3xl font-bold text-white">Recuperar Senha</h2>
                <p className="text-sm text-gray-400 mt-1">
                  {message ? 'Verifique a sua caixa de entrada.' : 'Insira o seu e-mail para receber o link de recuperação.'}
                </p>
            </div>
            <div className="p-8">
              {message ? (
                <div className="text-center">
                  <CheckCircle size={48} className="mx-auto text-green-400 mb-4" />
                  <p className="text-green-300">{message}</p>
                  <Link to="/login" className="mt-6 inline-block font-semibold text-yellow-400 hover:underline">
                    Voltar para o Login
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <InputField 
                        id="email" 
                        type="email" 
                        placeholder="O seu e-mail de registo" 
                        registerProps={register("email")} 
                        icon={<Mail size={16} />} 
                        errorMsg={errors.email?.message} 
                    />
                    
                    {error && (
                        <div className="flex items-center gap-2 text-xs text-red-400 p-2 bg-red-500/10 rounded-lg">
                            <AlertTriangle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    <motion.button 
                        type="submit" 
                        disabled={isSubmitting} 
                        className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold py-3 px-4 rounded-lg shadow-lg disabled:opacity-50"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                      {isSubmitting ? 'A enviar...' : 'Enviar Link de Recuperação'}
                    </motion.button>

                    <p className="text-center text-sm text-gray-400">
                        Lembrou-se da senha? <Link to="/login" className="font-semibold text-yellow-400 hover:underline">Faça login</Link>.
                    </p>
                </form>
              )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
