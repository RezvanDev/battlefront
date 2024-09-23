// src/components/WaitingRoom.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getGameStatus } from '../api/api';

const WaitingRoom: React.FC = () => {
  const [isAccepted, setIsAccepted] = useState(false);
  const navigate = useNavigate();
  const { lobbyCode } = useParams<{ lobbyCode: string }>();

  useEffect(() => {
    const checkGameStatus = async () => {
      if (!lobbyCode) return;
      try {
        const data = await getGameStatus(lobbyCode);
        if (data.game.status === 'PLAYING') {
          setIsAccepted(true);
        }
      } catch (error) {
        console.error('Error checking game status:', error);
      }
    };

    const interval = setInterval(checkGameStatus, 5000); // Проверяем каждые 5 секунд
    return () => clearInterval(interval);
  }, [lobbyCode]);

  useEffect(() => {
    if (isAccepted) {
      const gameTimer = setTimeout(() => {
        navigate(`/game/${lobbyCode}`);
      }, 2000);

      return () => clearTimeout(gameTimer);
    }
  }, [isAccepted, navigate, lobbyCode]);

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