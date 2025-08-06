import React from 'react';
import ScratchCardList from '../components/Games/ScratchCardList';
import DailyGameCard from '../components/Games/DailyGameCard';
import { useAuth } from '../contexts/AuthContext';

const GamesPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* <div className="bg-[var(--surface-dark)] border border-[var(--border-color)] rounded-lg h-64 mb-12 flex items-center justify-center">
        <h2 className="text-2xl text-[var(--text-secondary)]">Espaço do Banner Principal</h2>
      </div> */}

      <div className="space-y-12">
        {user?.can_claim_daily_game && <DailyGameCard />}
        
        <ScratchCardList />
      </div>
    </div>
  );
};

export default GamesPage;