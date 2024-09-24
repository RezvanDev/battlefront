import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getGameStatus } from '../api/api';
import { useTelegram } from '../context/TelegramContext';

const WaitingResults: React.FC = () => {
  const [gameResult, setGameResult] = useState<{
    creatorWins: number;
    participantWins: number;
    status: 'WAITING' | 'FINISHED';
  } | null>(null);
  const [isCreator, setIsCreator] = useState(false);

  const { lobbyCode } = useParams<{ lobbyCode: string }>();
  const navigate = useNavigate();
  const { user } = useTelegram();

  useEffect(() => {
    const fetchGameStatus = async () => {
      if (!lobbyCode || !user) return;
      try {
        const data = await getGameStatus(lobbyCode);
        setGameResult({
          creatorWins: data.game.creatorWins,
          participantWins: data.game.participantWins,
          status: data.game.status,
        });
        setIsCreator(user.id === data.game.creator.id);
      } catch (error) {
        console.error('Error fetching game status:', error);
      }
    };

    fetchGameStatus();
    const interval = setInterval(fetchGameStatus, 5000);

    return () => clearInterval(interval);
  }, [lobbyCode, user]);

  if (!gameResult) {
    return (
      <div className="flex flex-col h-screen bg-gradient-to-b from-gray-900 to-black text-white items-center justify-center">
        <div className="text-2xl font-bold mb-4">Загрузка результатов...</div>
      </div>
    );
  }

  const playerWins = isCreator ? gameResult.creatorWins : gameResult.participantWins;
  const opponentWins = isCreator ? gameResult.participantWins : gameResult.creatorWins;

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-gray-900 to-black text-white items-center justify-center p-4">
      <div className="text-4xl font-bold mb-8">Результаты игры</div>
      <div className="text-2xl mb-4">Ваши победы: {playerWins}</div>
      <div className="text-2xl mb-8">Победы соперника: {opponentWins}</div>
      
      {gameResult.status === 'FINISHED' ? (
        <>
          <div className="text-3xl font-bold mb-8">
            {playerWins > opponentWins ? 'Вы выиграли!' : playerWins < opponentWins ? 'Вы проиграли' : 'Ничья'}
          </div>
          <button
            className="w-full max-w-md py-4 bg-blue-600 rounded-xl text-xl"
            onClick={() => navigate('/')}
          >
            Вернуться в главное меню
          </button>
        </>
      ) : (
        <div className="text-2xl">Ожидание завершения игры соперником...</div>
      )}
    </div>
  );
};

export default WaitingResults;