import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getGameStatus } from '../api/api';
import { useTelegram } from '../context/TelegramContext';

const WaitingRoom: React.FC = () => {
  const [gameStatus, setGameStatus] = useState<any>(null);
  const navigate = useNavigate();
  const { lobbyCode } = useParams<{ lobbyCode: string }>();
  const { user } = useTelegram();

  useEffect(() => {
    const checkGameStatus = async () => {
      if (!lobbyCode) return;
      try {
        const data = await getGameStatus(lobbyCode);
        setGameStatus(data.game);
        
        if (data.game.status !== 'WAITING') {
          navigate(`/game/${lobbyCode}`);
        }
      } catch (error) {
        console.error('Error checking game status:', error);
      }
    };

    checkGameStatus();
    const interval = setInterval(checkGameStatus, 5000);
    return () => clearInterval(interval);
  }, [lobbyCode, navigate]);

  if (!gameStatus) {
    return <div>Loading...</div>;
  }

  const isCreator = user && user.id === gameStatus.creator.id;

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <h2 className="text-2xl font-bold mb-4">Ожидание игрока</h2>
      <p className="text-xl mb-2">Код лобби: {lobbyCode}</p>
      {isCreator ? (
        <p>Ожидание присоединения второго игрока...</p>
      ) : (
        <p>Вы присоединились к игре. Ожидание начала...</p>
      )}
    </div>
  );
};

export default WaitingRoom;