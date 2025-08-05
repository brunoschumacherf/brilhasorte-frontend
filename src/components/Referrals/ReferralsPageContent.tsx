import React, { useState, useEffect } from 'react';
import { getReferrals } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import type { Referee } from '../../types';

const ReferralsPageContent: React.FC = () => {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState<Referee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getReferrals()
      .then(response => {
        const referralData = response.data.data.map(item => item.attributes);
        setReferrals(referralData);
      })
      .catch(() => {
        setError('Não foi possível carregar sua lista de afiliados.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleCopyCode = () => {
    if (user?.referral_code) {
      navigator.clipboard.writeText(user.referral_code);
      alert('Código de referência copiado!');
    }
  };

  return (
    <div className="space-y-8">
      {/* Seção do Código de Referência */}
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold mb-2 text-gray-800">Seu Código de Afiliado</h2>
        <p className="text-gray-600 mb-4">Compartilhe este código com seus amigos. Quando eles se cadastrarem e fizerem o primeiro depósito, você ganha!</p>
        <div className="flex justify-center items-center gap-4 bg-gray-100 p-4 rounded-lg">
          <span className="text-2xl font-mono font-bold text-yellow-600 tracking-widest">
            {user?.referral_code || 'Carregando...'}
          </span>
          <button onClick={handleCopyCode} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
            Copiar
          </button>
        </div>
      </div>

      {/* Seção da Lista de Afiliados */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <h3 className="text-xl font-semibold p-4 border-b">Seus Afiliados</h3>
        {loading && <p className="p-4 text-center">Carregando afiliados...</p>}
        {error && <p className="p-4 text-center text-red-500">{error}</p>}
        {!loading && !error && (
          referrals.length === 0 ? (
            <p className="p-4 text-gray-500">Você ainda não indicou ninguém.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome do Indicado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data de Cadastro</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {referrals.map((referee) => (
                    <tr key={referee.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{referee.full_name || 'Usuário Anônimo'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(referee.created_at).toLocaleDateString('pt-BR')}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {referee.has_deposited ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Bônus Ativo
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Aguardando Depósito
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default ReferralsPageContent;