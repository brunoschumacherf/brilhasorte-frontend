import React, { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Lock, CheckCircle, AlertTriangle } from 'lucide-react';
import { resetPassword } from '../../services/api';

// Esquema de validação com Zod
const resetPasswordSchema = z.object({
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
  password_confirmation: z.string()
}).refine(data => data.password === data.password_confirmation, {
  message: "As senhas não conferem",
  path: ["password_confirmation"],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

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

const ResetPasswordForm: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema)
  });

  const onSubmit: SubmitHandler<ResetPasswordFormData> = async (data) => {
    if (!token) {
      setError('Token de redefinição inválido ou em falta.');
      toast.error('Token de redefinição inválido ou em falta.');
      return;
    }

    setError('');
    setMessage('');
    try {
      const response = await resetPassword(data.password, data.password_confirmation, token);
      setMessage(response.data.status.message);
      toast.success(response.data.status.message);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      const apiError = err.response?.data?.errors?.join(', ') || 'Ocorreu um erro. Tente novamente.';
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
                <h2 className="text-3xl font-bold text-white">Definir Nova Senha</h2>
                <p className="text-sm text-gray-400 mt-1">
                  {message ? 'Senha redefinida com sucesso!' : 'Insira a sua nova senha abaixo.'}
                </p>
            </div>
            <div className="p-8">
              {message ? (
                <div className="text-center">
                  <CheckCircle size={48} className="mx-auto text-green-400 mb-4" />
                  <p className="text-green-300">{message}</p>
                  <p className="text-sm text-gray-400 mt-2">Você será redirecionado para o login em breve...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <InputField 
                        id="password" 
                        type="password" 
                        placeholder="Nova senha" 
                        registerProps={register("password")} 
                        icon={<Lock size={16} />} 
                        errorMsg={errors.password?.message} 
                    />
                    <InputField 
                        id="password_confirmation" 
                        type="password" 
                        placeholder="Confirme a nova senha" 
                        registerProps={register("password_confirmation")} 
                        icon={<Lock size={16} />} 
                        errorMsg={errors.password_confirmation?.message} 
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
                      {isSubmitting ? 'A salvar...' : 'Salvar Nova Senha'}
                    </motion.button>
                </form>
              )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
