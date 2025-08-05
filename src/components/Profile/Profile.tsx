import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import EditProfileForm from './EditProfileForm'; // Importar o novo formulário

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  if (!user) {
    return <p className="text-center mt-8">Carregando perfil...</p>;
  }

  // Componente para exibir um detalhe do perfil
  const renderDetail = (label: string, value: string | number | null | undefined) => (
    <div className="py-3 sm:py-4 sm:grid sm:grid-cols-3 sm:gap-4">
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{value || 'Não informado'}</dd>
    </div>
  );

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      {isEditing ? (
        // MODO DE EDIÇÃO
        <EditProfileForm user={user} onSave={() => setIsEditing(false)} onCancel={() => setIsEditing(false)} />
      ) : (
        // MODO DE VISUALIZAÇÃO
        <>
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">Perfil do Usuário</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Detalhes pessoais e informações da conta.</p>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Editar
            </button>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <dl className="sm:divide-y sm:divide-gray-200">
              {renderDetail('Nome Completo', user.full_name)}
              {renderDetail('Endereço de Email', user.email)}
              {renderDetail('CPF', user.cpf)}
              {renderDetail('Data de Nascimento', user.birth_date)}
              {renderDetail('Telefone', user.phone_number)}
              {renderDetail('Membro Desde', new Date(user.created_at).toLocaleDateString('pt-BR'))}
            </dl>
          </div>
        </>
      )}
    </div>
  );
};

export default Profile;