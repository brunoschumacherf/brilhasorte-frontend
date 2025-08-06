import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import EditProfileForm from './EditProfileForm';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  if (!user) {
    return <p className="text-center mt-8">Carregando perfil...</p>;
  }

  const DetailItem: React.FC<{ label: string; value: string | number | null | undefined }> = ({ label, value }) => (
    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 border-t border-[var(--border-color)]">
      <dt className="text-sm font-medium text-[var(--text-secondary)]">{label}</dt>
      <dd className="mt-1 text-sm text-[var(--text-primary)] sm:mt-0 sm:col-span-2">{value || 'Não informado'}</dd>
    </div>
  );

  return (
    <div className="bg-[var(--surface-dark)] border border-[var(--border-color)] shadow-lg overflow-hidden sm:rounded-lg">
      {isEditing ? (
        <EditProfileForm user={user} onSave={() => setIsEditing(false)} onCancel={() => setIsEditing(false)} />
      ) : (
        <>
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-xl leading-6 font-bold text-[var(--primary-gold)]">
                Meu Perfil
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-[var(--text-secondary)]">
                Seus detalhes pessoais e informações da conta.
              </p>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Editar
            </button>
          </div>
          <div className="px-4 py-5 sm:p-0">
            <dl>
              <DetailItem label="Nome Completo" value={user.full_name} />
              <DetailItem label="Endereço de Email" value={user.email} />
              <DetailItem label="CPF" value={user.cpf} />
              <DetailItem label="Data de Nascimento" value={user.birth_date} />
              <DetailItem label="Telefone" value={user.phone_number} />
              <DetailItem label="Membro Desde" value={new Date(user.created_at).toLocaleDateString('pt-BR')} />
            </dl>
          </div>
        </>
      )}
    </div>
  );
};

export default Profile;