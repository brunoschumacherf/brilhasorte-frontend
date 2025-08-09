import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// 1. Definir o esquema de validação com Zod
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
  path: ["password_confirmation"], // Onde o erro deve aparecer
});

type RegisterFormData = z.infer<typeof registerSchema>;

// Componente para exibir erros de um campo específico
const FieldError: React.FC<{ message?: string }> = ({ message }) => {
  if (!message) return null;
  return <p className="text-red-400 text-xs mt-1">{message}</p>;
};

const Register: React.FC = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  
  // 2. Integrar com react-hook-form
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser(data as any);
      toast.success("Cadastro realizado com sucesso!");
      navigate('/games');
    } catch (err: any) {
      const apiError = err.response?.data?.status?.message || "Falha no registro. Verifique os dados e tente novamente.";
      toast.error(apiError);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--background-dark)]">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-[var(--surface-dark)] border border-[var(--border-color)] p-8 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-3xl font-bold mb-6 text-center text-[var(--primary-gold)]">Crie sua Conta</h2>
        
        {/* 3. Mapear os campos para o react-hook-form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input {...register("full_name")} placeholder="Nome Completo" className="w-full bg-[#2a2a2a] p-3 border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-gold)]" />
            <FieldError message={errors.full_name?.message} />
          </div>
          <div>
            <input {...register("email")} placeholder="Email" type="email" className="w-full bg-[#2a2a2a] p-3 border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-gold)]" />
            <FieldError message={errors.email?.message} />
          </div>
          <div>
            <input {...register("cpf")} placeholder="CPF" className="w-full bg-[#2a2a2a] p-3 border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-gold)]" />
            <FieldError message={errors.cpf?.message} />
          </div>
          <div>
            <input {...register("birth_date")} type="date" className="w-full bg-[#2a2a2a] p-3 border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-gold)]" />
            <FieldError message={errors.birth_date?.message} />
          </div>
          <div>
            <input {...register("phone_number")} placeholder="Telefone" type="tel" className="w-full bg-[#2a2a2a] p-3 border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-gold)]" />
            <FieldError message={errors.phone_number?.message} />
          </div>
        </div>
        
        <div className="mt-4">
          <input {...register("password")} placeholder="Senha (mínimo 6 caracteres)" type="password" className="w-full bg-[#2a2a2a] p-3 border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-gold)]" />
          <FieldError message={errors.password?.message} />
        </div>
        
        <div className="mt-4">
          <input {...register("password_confirmation")} placeholder="Confirme a Senha" type="password" className="w-full bg-[#2a2a2a] p-3 border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-gold)]" />
          <FieldError message={errors.password_confirmation?.message} />
        </div>
        
        <button type="submit" disabled={isSubmitting} className="mt-6 w-full bg-[var(--primary-gold)] text-black font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-yellow-500/20 hover:bg-yellow-300 disabled:bg-gray-500 disabled:shadow-none">
          {isSubmitting ? 'Cadastrando...' : 'Finalizar Cadastro'}
        </button>
      </form>
    </div>
  );
};

export default Register;