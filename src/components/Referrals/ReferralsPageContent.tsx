import React, { useState, useEffect } from 'react';
import { getReferrals } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import type { Referee } from '../../types';
import { toast } from 'react-toastify';

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
      toast.success('Código de referência copiado!');
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-[var(--surface-dark)] border border-[var(--border-color)] p-8 rounded-lg shadow-lg text-center">
        <h2 className="text-3xl font-bold mb-2 text-[var(--primary-gold)]">Programa de Afiliados</h2>
        <p className="text-[var(--text-secondary)] mb-6 max-w-2xl mx-auto">Compartilhe seu código com amigos. Quando eles se cadastrarem e fizerem o primeiro depósito, você ganha um bônus!</p>
        <div className="inline-flex items-center gap-4 bg-black bg-opacity-30 p-4 rounded-lg border border-[var(--border-color)]">
          <span className="text-2xl font-mono font-bold text-yellow-300 tracking-widest">
            {user?.referral_code || '...'}
          </span>
          <button onClick={handleCopyCode} className="bg-[var(--primary-gold)] hover:bg-yellow-300 text-black font-bold py-2 px-4 rounded-lg transition-colors">
            Copiar
          </button>
        </div>
      </div>

      <div className="bg-[var(--surface-dark)] border border-[var(--border-color)] shadow-md rounded-lg overflow-hidden">
        <h3 className="text-xl font-semibold p-4">Seus Indicados</h3>
        {loading && <p className="p-4 text-center text-[var(--text-secondary)]">Carregando afiliados...</p>}
        {error && <p className="p-4 text-center text-red-400">{error}</p>}
        {!loading && !error && (
          referrals.length === 0 ? (
            <p className="p-6 text-center text-[var(--text-secondary)]">Você ainda não indicou ninguém.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="border-b border-[var(--border-color)]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase">Nome do Indicado</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase">Data de Cadastro</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.map((referee) => (
                    <tr key={referee.id} className="border-b border-[var(--border-color)] hover:bg-[#2a2a2a]">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--text-primary)]">{referee.full_name || 'Usuário Anônimo'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">{new Date(referee.created_at).toLocaleDateString('pt-BR')}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {referee.has_deposited ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-900 bg-opacity-50 text-green-300">
                            Bônus Ativo
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-900 bg-opacity-50 text-yellow-300">
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