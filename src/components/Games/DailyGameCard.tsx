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
      setDailyGameClaimed(); // Atualiza o estado global
      navigate(`/games/${gameId}`); // Redireciona para a revelação
    } catch (err: any) {
      setError(err.response?.data?.error || 'Não foi possível resgatar o jogo grátis.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-6 rounded-lg shadow-lg text-white text-center">
      <h3 className="text-2xl font-bold">Sua Chance Grátis Diária!</h3>
      <p className="mt-2 mb-4">Resgate sua raspadinha grátis de hoje e concorra a prêmios!</p>
      <button
        onClick={handleClaim}
        disabled={loading}
        className="w-full bg-white text-yellow-500 font-bold py-3 px-4 rounded-lg transition-colors hover:bg-gray-100 disabled:bg-gray-300"
      >
        {loading ? 'Resgatando...' : 'Resgatar Jogo Grátis'}
      </button>
      {error && <p className="text-red-200 text-sm mt-2">{error}</p>}
    </div>
  );
};

export default DailyGameCard;