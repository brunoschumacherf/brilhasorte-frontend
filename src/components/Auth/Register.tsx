import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { User, Mail, Hash, Calendar, Phone, Lock } from 'lucide-react';

const registerSchema = z.object({
  full_name: z.string().min(3, "O nome completo é obrigatório"),
  email: z.string().email("Formato de e-mail inválido"),
  cpf: z.string().min(11, "O CPF deve ter no mínimo 11 dígitos"),
  birth_date: z.string().refine((date) => new Date(date) < new Date(), "Data de nascimento inválida"),
  phone_number: z.string().min(10, "O telefone é obrigatório"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
  password_confirmation: z.string()
}).refine(data => data.password === data.password_confirmation, {
  message: "As senhas não conferem",
  path: ["password_confirmation"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

type ApiErrors = {
  [K in keyof RegisterFormData]?: string[];
};

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

const Register: React.FC = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [apiErrors, setApiErrors] = useState<ApiErrors>({});

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: RegisterFormData) => {
    setApiErrors({});
    try {
      await registerUser(data as any);
      toast.success("Registo realizado com sucesso!");
      navigate('/games');
    } catch (err: any) {
      const errorData = err.response?.data?.errors;

      if (errorData && typeof errorData === "object") {
        setApiErrors(errorData);
      } else {
        toast.error("Falha no registo. Verifique os dados e tente novamente.");
      }
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#101010] p-4 overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full filter blur-3xl opacity-50 animate-blob"></div>
      <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

      <div className="relative z-10 w-full max-w-2xl">
        <div className="bg-black/30 backdrop-blur-md border border-white/10 shadow-2xl rounded-2xl overflow-hidden">
          <div className="p-8 text-center border-b border-white/10">
            <h2 className="text-3xl font-bold text-white">Crie a sua Conta</h2>
            <p className="text-sm text-gray-400 mt-1">Junte-se a nós e comece a ganhar prémios hoje mesmo.</p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField id="full_name" type="text" placeholder="Nome Completo"
                registerProps={register("full_name")}
                icon={<User size={16} />}
                errorMsg={errors.full_name?.message || apiErrors.full_name?.[0]} />

              <InputField id="email" type="email" placeholder="Email"
                registerProps={register("email")}
                icon={<Mail size={16} />}
                errorMsg={errors.email?.message || apiErrors.email?.[0]} />

              <InputField id="cpf" type="text" placeholder="CPF"
                registerProps={register("cpf")}
                icon={<Hash size={16} />}
                errorMsg={errors.cpf?.message || apiErrors.cpf?.[0]} />

              <InputField id="birth_date" type="date" placeholder="Data de Nascimento"
                registerProps={register("birth_date")}
                icon={<Calendar size={16} />}
                errorMsg={errors.birth_date?.message || apiErrors.birth_date?.[0]} />

              <InputField id="phone_number" type="tel" placeholder="Telefone"
                registerProps={register("phone_number")}
                icon={<Phone size={16} />}
                errorMsg={errors.phone_number?.message || apiErrors.phone_number?.[0]} />
            </div>

            <InputField id="password" type="password" placeholder="Senha (mínimo 6 caracteres)"
              registerProps={register("password")}
              icon={<Lock size={16} />}
              errorMsg={errors.password?.message || apiErrors.password?.[0]} />

            <InputField id="password_confirmation" type="password" placeholder="Confirme a Senha"
              registerProps={register("password_confirmation")}
              icon={<Lock size={16} />}
              errorMsg={errors.password_confirmation?.message || apiErrors.password_confirmation?.[0]} />

            <motion.button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold py-3 px-4 rounded-lg shadow-lg disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSubmitting ? 'A registar...' : 'Finalizar Registo'}
            </motion.button>

            <p className="text-center text-sm text-gray-400">
              Já tem uma conta? <Link to="/login" className="font-semibold text-yellow-400 hover:underline">Faça login aqui</Link>.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
