import React from 'react';
import ScratchCardList from '../components/Games/ScratchCardList';
import DailyGameCard from '../components/Games/DailyGameCard';
import { useAuth } from '../contexts/AuthContext';

const GamesPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {user?.can_claim_daily_game && <DailyGameCard />}

      <ScratchCardList />
    </div>
  );
};

export default GamesPage;