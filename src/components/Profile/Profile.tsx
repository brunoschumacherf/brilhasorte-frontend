import React,{ useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { toast } from 'react-toastify';
import type { User } from '../../types';
import { updateProfile } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { User as UserIcon, Mail, Phone, Calendar, Hash, Edit3, X } from 'lucide-react';

interface DetailItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number | null | undefined;
}

const DetailItem: React.FC<DetailItemProps> = ({ icon, label, value }) => (
  <div className="bg-white/5 p-4 rounded-lg flex items-center gap-4">
    <div className="flex-shrink-0 text-yellow-400">{icon}</div>
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-semibold text-white">{value || 'Não informado'}</p>
    </div>
  </div>
);

interface EditProfileFormProps {
  user: User;
  onSave: (data: Partial<User>) => void;
  onCancel: () => void;
}

const EditProfileForm: React.FC<EditProfileFormProps> = ({ user, onSave, onCancel }) => {
  const { register, handleSubmit, formState: { isSubmitting, errors } } = useForm<User>({
    defaultValues: {
      ...user,
      birth_date: user.birth_date ? user.birth_date.split('T')[0] : '',
    },
  });

  const onSubmit: SubmitHandler<User> = async (data) => {
    const { cpf, email, ...updatableData } = data;
    try {
      const response = await updateProfile(updatableData);
      const updatedUser = response.data.data.attributes;
      toast.success("Perfil atualizado com sucesso!");
      onSave(updatedUser);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Erro ao atualizar o perfil.';
      toast.error(errorMessage);
    }
  };

  interface InputFieldProps {
    id: keyof User;
    label: string;
    type: string;
    registerProps: any;
    icon: React.ReactNode;
    disabled?: boolean;
    errorMsg?: string;
  }

  const InputField: React.FC<InputFieldProps> = ({ id, label, type, registerProps, icon, disabled = false, errorMsg }) => (
    <div className="relative">
      <label htmlFor={id} className="block text-xs font-medium text-gray-400 mb-1">{label}</label>
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">{icon}</span>
        <input 
          id={id} 
          type={type} 
          {...registerProps} 
          disabled={disabled}
          className={`w-full bg-zinc-800 border ${errors[id] ? 'border-red-500' : 'border-zinc-700'} rounded-lg py-2 pl-10 pr-3 text-white transition-colors focus:border-yellow-500 focus:ring-yellow-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50`}
        />
      </div>
      {errorMsg && <p className="text-xs text-red-400 mt-1">{errorMsg}</p>}
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <InputField id="full_name" label="Nome Completo" type="text" registerProps={register('full_name')} icon={<UserIcon size={16} />} />
        <InputField id="email" label="Email (não pode ser alterado)" type="email" registerProps={register('email')} icon={<Mail size={16} />} disabled />
        <InputField id="cpf" label="CPF (não pode ser alterado)" type="text" registerProps={register('cpf')} icon={<Hash size={16} />} disabled />
        <InputField id="phone_number" label="Telefone" type="tel" registerProps={register('phone_number')} icon={<Phone size={16} />} />
        <InputField id="birth_date" label="Data de Nascimento" type="date" registerProps={register('birth_date')} icon={<Calendar size={16} />} />
        
        <div className="flex justify-end space-x-4 pt-4">
          <motion.button type="button" onClick={onCancel} className="px-6 py-2 rounded-lg text-sm font-bold text-gray-300 bg-white/5 hover:bg-white/10" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            Cancelar
          </motion.button>
          <motion.button type="submit" disabled={isSubmitting} className="px-6 py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 text-black disabled:opacity-50" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            {isSubmitting ? 'A salvar...' : 'Salvar Alterações'}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

const Profile: React.FC = () => {
  const { user, updateUserDetails } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  if (!user) {
    return <div className="text-center mt-8 text-gray-400">A carregar perfil...</div>;
  }

  const handleSave = (updatedUser: Partial<User>) => {
    updateUserDetails(updatedUser);
    setIsEditing(false);
  };

  return (
    <div className="relative min-h-screen bg-[#101010] p-4 sm:p-6 lg:p-8 overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full filter blur-3xl opacity-50 animate-blob"></div>
      <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

      <div className="container mx-auto max-w-4xl relative z-10">
        <div className="bg-black/30 backdrop-blur-md border border-white/10 shadow-2xl rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">Meu Perfil</h2>
              <p className="text-sm text-gray-400">
                {isEditing ? 'Edite as suas informações abaixo.' : 'Os seus detalhes pessoais e informações da conta.'}
              </p>
            </div>
            <motion.button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center justify-center p-2 rounded-full bg-white/10 text-white hover:bg-white/20"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isEditing ? <X size={20} /> : <Edit3 size={20} />}
            </motion.button>
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {isEditing ? (
                <EditProfileForm key="edit-form" user={user} onSave={handleSave} onCancel={() => setIsEditing(false)} />
              ) : (
                <motion.div key="display-details" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DetailItem icon={<UserIcon size={20} />} label="Nome Completo" value={user.full_name} />
                    <DetailItem icon={<Mail size={20} />} label="Endereço de Email" value={user.email} />
                    <DetailItem icon={<Hash size={20} />} label="CPF" value={user.cpf} />
                    <DetailItem icon={<Phone size={20} />} label="Telefone" value={user.phone_number} />
                    <DetailItem icon={<Calendar size={20} />} label="Data de Nascimento" value={user.birth_date ? new Date(user.birth_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'Não informado'} />
                    <DetailItem icon={<Calendar size={20} />} label="Membro Desde" value={new Date(user.created_at).toLocaleDateString('pt-BR')} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
