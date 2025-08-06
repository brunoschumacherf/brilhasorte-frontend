import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { playFreeDailyGame } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const DailyGameCard: React.FC = () => {
  const navigate = useNavigate();
  const { setDailyGameClaimed } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClaim = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await playFreeDailyGame();
      const gameId = response.data.data.id;
      setDailyGameClaimed();
      navigate(`/games/${gameId}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Não foi possível resgatar o jogo grátis.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-8 rounded-lg shadow-lg text-center border-2 border-yellow-300">
      <h2 className="text-3xl font-bold text-white drop-shadow-md">Sua Chance Grátis Diária!</h2>
      <p className="mt-2 mb-6 text-yellow-100">Resgate sua raspadinha grátis de hoje e concorra a prêmios!</p>
      <button
        onClick={handleClaim}
        disabled={loading}
        className="w-full max-w-xs mx-auto bg-white text-orange-600 font-bold py-3 px-4 rounded-lg transition-transform hover:scale-105 disabled:bg-gray-300 disabled:text-gray-500 disabled:scale-100"
      >
        {loading ? 'Resgatando...' : 'Resgatar Jogo Grátis'}
      </button>
      {error && <p className="text-red-200 text-sm mt-4">{error}</p>}
    </div>
  );
};

export default DailyGameCard;