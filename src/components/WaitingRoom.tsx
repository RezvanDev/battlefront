import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { joinGame } from '../api/gameService';

const WaitingRoom: React.FC = () => {
  const [isAccepted, setIsAccepted] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const { user } = useUser();

  const gameId = (location.state as { gameId: string })?.gameId || params.gameId;

  useEffect(() => {
    if (!user || !gameId) return;

    const checkGameStatus = async () => {
      try {
        const game = await joinGame(gameId, user.id);
        if (game.status === 'READY') {
          setIsAccepted(true);
        }
      } catch (error) {
        console.error('Error checking game status:', error);
      }
    };

    const interval = setInterval(checkGameStatus, 5000);
    return () => clearInterval(interval);
  }, [gameId, user]);

  useEffect(() => {
    if (isAccepted) {
      const gameTimer = setTimeout(() => {
        navigate('/game', { state: { gameId } });
      }, 2000);
      return () => clearTimeout(gameTimer);
    }
  }, [isAccepted, navigate, gameId]);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4 items-center justify-center">
      <div className="text-center">
        {!isAccepted ? (
          <>
            <h2 className="text-2xl font-bold mb-4">Ждите пока игрок примет вызов</h2>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
          </>
        ) : (
          <h2 className="text-2xl font-bold mb-4">Игрок принял ваш вызов!</h2>
        )}
      </div>
    </div>
  );
};

export default WaitingRoom;