import React from 'react';
import DepositHistoryList from '../components/History/DepositHistoryList';
import WithdrawalHistoryList from '../components/History/WithdrawalHistoryList'; // Importar a nova lista

const HistoryPage: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Seu Histórico de Transações</h1>
      <div className="space-y-8">
        <DepositHistoryList />
        <WithdrawalHistoryList />
      </div>
    </div>
  );
};

export default HistoryPage;