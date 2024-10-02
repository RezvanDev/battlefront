import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getGameStatus } from '../api/api';
import { useTelegram } from '../context/TelegramContext';

const WaitingResults: React.FC = () => {
  const { lobbyCode } = useParams<{ lobbyCode: string }>();
  const navigate = useNavigate();
  const { user } = useTelegram();
  const [game, setGame] = useState<any>(null);

  useEffect(() => {
    const fetchGameStatus = async () => {
      if (lobbyCode) {
        const response = await getGameStatus(lobbyCode);
        if (response.success) {
          setGame(response.game);
        } else {
          console.error('Ошибка при получении статуса игры:', response.error);
        }
      }
    };
    fetchGameStatus();
  }, [lobbyCode]);

  if (!game || !user) {
    return <div className="text-center">Загрузка результатов...</div>;
  }

  const isCreator = game.creator.id === user.id;
  const currentPlayer = isCreator ? game.creator : game.participant;
  const opponentPlayer = isCreator ? game.participant : game.creator;
  const playerWins = isCreator ? game.creatorWins : game.participantWins;
  const opponentWins = isCreator ? game.participantWins : game.creatorWins;

  let resultMessage;
  let winnings;
  if (playerWins > opponentWins) {
    resultMessage = "Поздравляем! Вы выиграли!";
    winnings = game.bet * 2 * 0.9; // 90% от общей ставки
  } else if (playerWins < opponentWins) {
    resultMessage = "К сожалению, вы проиграли.";
    winnings = 0;
  } else {
    resultMessage = "Ничья!";
    winnings = game.bet;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4">
      <h1 className="text-4xl font-bold mb-8">Результаты игры</h1>
      <div className="text-2xl mb-6">
        <p className={playerWins > opponentWins ? "text-green-500" : playerWins < opponentWins ? "text-red-500" : "text-yellow-500"}>
          {resultMessage}
        </p>
      </div>
      <div className="mb-8">
        <p className="text-xl">{currentPlayer.username || 'Вы'}: {playerWins} очков</p>
        <p className="text-xl">{opponentPlayer?.username || 'Оппонент'}: {opponentWins} очков</p>
      </div>
      <p className="text-lg mb-4">Выигрыш: {winnings} монет</p>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full text-lg transition duration-300"
        onClick={() => navigate('/')}
      >
        Вернуться в главное меню
      </button>
    </div>
  );
};

export default WaitingResults;