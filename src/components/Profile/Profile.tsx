import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import type { User } from '../../types';

const Profile: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <p className="text-center mt-8">Carregando perfil...</p>;
  }

  const renderDetail = (label: string, value: string | number | null | undefined) => (
    <div className="py-3 sm:py-4 sm:grid sm:grid-cols-3 sm:gap-4">
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{value || 'Não informado'}</dd>
    </div>
  );

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Perfil do Usuário
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Detalhes pessoais e informações da conta.
        </p>
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
    </div>
  );
};

export default Profile;