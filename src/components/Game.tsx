import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getGameStatus, chooseColor } from '../api/api';
import { useTelegram } from '../context/TelegramContext';

const Game: React.FC = () => {
  const { lobbyCode } = useParams<{ lobbyCode: string }>();
  const navigate = useNavigate();
  const { user } = useTelegram();
  const [game, setGame] = useState<any>(null);
  const [selectedColor, setSelectedColor] = useState<'red' | 'black' | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<string | null>(null);

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
    const interval = setInterval(fetchGameStatus, 5000); // Опрос каждые 5 секунд

    return () => clearInterval(interval);
  }, [lobbyCode]);

  const handleColorSelect = async (color: 'red' | 'black') => {
    if (!user || !lobbyCode) return;

    setSelectedColor(color);
    try {
      const response = await chooseColor(user.id.toString(), lobbyCode, color);
      if (response.success) {
        setGame(response.game);
        if (response.spinResult) {
          setIsSpinning(true);
          setSpinResult(response.spinResult);
          setTimeout(() => {
            setIsSpinning(false);
            setSelectedColor(null);
          }, 3000); // Имитация вращения рулетки
        }
      } else {
        console.error('Ошибка при выборе цвета:', response.error);
      }
    } catch (error) {
      console.error('Ошибка при отправке выбора цвета:', error);
    }
  };

  if (!game) {
    return <div>Загрузка игры...</div>;
  }

  const isCreator = game.creator.id === user?.id;
  const currentPlayer = isCreator ? game.creator : game.participant;
  const opponentPlayer = isCreator ? game.participant : game.creator;

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4">
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold">Раунд {game.currentRound}/5</h1>
        <p>Ставка: {game.bet}</p>
      </div>

      <div className="flex justify-between mb-4">
        <div>
          <p>{currentPlayer.username || 'Вы'}</p>
          <p>Очки: {isCreator ? game.creatorWins : game.participantWins}</p>
        </div>
        <div>
          <p>{opponentPlayer?.username || 'Оппонент'}</p>
          <p>Очки: {isCreator ? game.participantWins : game.creatorWins}</p>
        </div>
      </div>

      {isSpinning ? (
        <div className="text-center my-8">
          <p className="text-3xl">Рулетка крутится...</p>
        </div>
      ) : spinResult ? (
        <div className="text-center my-8">
          <p className="text-3xl">Результат: {spinResult === 'red' ? 'Красный' : 'Черный'}</p>
        </div>
      ) : (
        <div className="flex justify-center space-x-4 my-8">
          <button
            className={`w-1/3 py-4 rounded-xl ${selectedColor === 'red' ? 'bg-red-600' : 'bg-red-800'}`}
            onClick={() => handleColorSelect('red')}
            disabled={!!selectedColor}
          >
            Красный
          </button>
          <button
            className={`w-1/3 py-4 rounded-xl ${selectedColor === 'black' ? 'bg-gray-800' : 'bg-gray-900'}`}
            onClick={() => handleColorSelect('black')}
            disabled={!!selectedColor}
          >
            Черный
          </button>
        </div>
      )}

      {game.status === 'FINISHED' && (
        <div className="text-center mt-8">
          <h2 className="text-3xl font-bold mb-4">
            {game.creatorWins === 3 ? 'Создатель выиграл!' : 'Участник выиграл!'}
          </h2>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => navigate('/')}
          >
            Вернуться на главную
          </button>
        </div>
      )}
    </div>
  );
};

export default Game;