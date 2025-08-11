import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Mail, Lock } from 'lucide-react';

// Esquema de validação com Zod para o login
const loginSchema = z.object({
  email: z.string().email("Formato de e-mail inválido"),
  password: z.string().min(1, "A senha é obrigatória"),
});

type LoginFormData = z.infer<typeof loginSchema>;

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

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      toast.success('Login bem-sucedido!');
      navigate('/games');
    } catch (err) {
      toast.error('Falha no login. Verifique as suas credenciais.');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#101010] p-4 overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full filter blur-3xl opacity-50 animate-blob"></div>
      <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-black/30 backdrop-blur-md border border-white/10 shadow-2xl rounded-2xl overflow-hidden">
            <div className="p-8 text-center border-b border-white/10">
                <img src="/logo.png" alt="BrilhaSorte Logo" className="h-20 w-20 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-white">Bem-vindo de Volta!</h2>
                <p className="text-sm text-gray-400 mt-1">Faça login para continuar a sua jornada.</p>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
                <InputField 
                    id="email" 
                    type="email" 
                    placeholder="Email" 
                    registerProps={register("email")} 
                    icon={<Mail size={16} />} 
                    errorMsg={errors.email?.message} 
                />
                <InputField 
                    id="password" 
                    type="password" 
                    placeholder="Senha" 
                    registerProps={register("password")} 
                    icon={<Lock size={16} />} 
                    errorMsg={errors.password?.message} 
                />
                
                <div className="text-right">
                    <Link to="/forgot-password" className="text-xs text-yellow-400 hover:underline">
                        Esqueceu a senha?
                    </Link>
                </div>

                <motion.button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold py-3 px-4 rounded-lg shadow-lg disabled:opacity-50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                  {isSubmitting ? 'A entrar...' : 'Entrar'}
                </motion.button>

                <p className="text-center text-sm text-gray-400">
                    Não tem uma conta? <Link to="/register" className="font-semibold text-yellow-400 hover:underline">Registe-se aqui</Link>.
                </p>
            </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
