import React, { useState } from 'react';
import DepositHistoryList from '../components/History/DepositHistoryList';
import WithdrawalHistoryList from '../components/History/WithdrawalHistoryList';
import GameHistoryList from '../components/History/GameHistoryList';

type HistoryTab = 'games' | 'deposits' | 'withdrawals';

const HistoryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<HistoryTab>('games');

  const renderContent = () => {
    switch (activeTab) {
      case 'games':
        return <GameHistoryList />;
      case 'deposits':
        return <DepositHistoryList />;
      case 'withdrawals':
        return <WithdrawalHistoryList />;
      default:
        return null;
    }
  };

  const TabButton: React.FC<{tab: HistoryTab, label: string}> = ({ tab, label }) => {
    const isActive = activeTab === tab;
    return (
      <button
        onClick={() => setActiveTab(tab)}
        className={`px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${
          isActive
            ? 'bg-[var(--primary-gold)] text-black shadow-md'
            : 'bg-[#2a2a2a] text-[var(--text-secondary)] hover:bg-[#333]'
        }`}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-[var(--surface-dark)] border border-[var(--border-color)] p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-2 text-[var(--primary-gold)]">Seu Histórico</h1>
        <p className="text-[var(--text-secondary)] mb-6">Acompanhe todas as suas atividades na plataforma.</p>
        
        <div className="flex justify-center space-x-2 mb-6 border-b border-[var(--border-color)] pb-4">
          <TabButton tab="games" label="Jogos" />
          <TabButton tab="deposits" label="Depósitos" />
          <TabButton tab="withdrawals" label="Saques" />
        </div>

        <div>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;