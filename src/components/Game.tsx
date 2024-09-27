import React, { useState, useEffect, useCallback } from 'react';
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
  const [showRoundInfo, setShowRoundInfo] = useState(false);

  const fetchGameStatus = useCallback(async () => {
    if (lobbyCode) {
      const response = await getGameStatus(lobbyCode);
      if (response.success) {
        const newGame = response.game;
        setGame(newGame);
        if (newGame.status === 'FINISHED') {
          navigate(`/results/${lobbyCode}`);
        } else if (newGame.currentRound !== game?.currentRound) {
          setShowRoundInfo(true);
          setTimeout(() => setShowRoundInfo(false), 2000);
        }
      } else {
        console.error('Ошибка при получении статуса игры:', response.error);
      }
    }
  }, [lobbyCode, navigate, game]);

  useEffect(() => {
    fetchGameStatus();
    const interval = setInterval(fetchGameStatus, 2000);
    return () => clearInterval(interval);
  }, [fetchGameStatus]);

  const handleColorSelect = async (color: 'red' | 'black') => {
    if (!user || !lobbyCode) return;

    setSelectedColor(color);
    try {
      const response = await chooseColor(user.id.toString(), lobbyCode, color);
      if (response.success) {
        setGame(response.game);
        if (response.spinResult) {
          setIsSpinning(true);
          setSpinResult(null);
          setTimeout(() => {
            setSpinResult(response.spinResult);
            setIsSpinning(false);
            setTimeout(() => {
              setSelectedColor(null);
              setSpinResult(null);
              fetchGameStatus();
            }, 2000);
          }, 3000);
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

  if (showRoundInfo) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-gray-900 to-black text-white">
        <h1 className="text-6xl font-bold mb-4">{game.currentRound}/5</h1>
        <p className="text-3xl">Раунд</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4">
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold">Раунд {game.currentRound}</h1>
        <p>Ставка: {game.bet}$</p>
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
          <div className="w-32 h-32 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
          <p className="text-3xl mt-4">Рулетка крутится...</p>
        </div>
      ) : spinResult ? (
        <div className="text-center my-8">
          <div className={`w-32 h-32 rounded-full mx-auto ${spinResult === 'red' ? 'bg-red-600' : 'bg-black'}`}></div>
          <p className="text-3xl mt-4">Результат: {spinResult === 'red' ? 'Красный' : 'Черный'}</p>
        </div>
      ) : (
        <div className="flex justify-center space-x-4 my-8">
          <button
            className={`w-1/3 py-4 rounded-xl ${selectedColor === 'red' ? 'bg-red-600' : 'bg-red-800'}`}
            onClick={() => handleColorSelect('red')}
            disabled={!!selectedColor || Math.max(game.creatorWins, game.participantWins) >= 3}
          >
            Красный
          </button>
          <button
            className={`w-1/3 py-4 rounded-xl ${selectedColor === 'black' ? 'bg-gray-800' : 'bg-gray-900'}`}
            onClick={() => handleColorSelect('black')}
            disabled={!!selectedColor || Math.max(game.creatorWins, game.participantWins) >= 3}
          >
            Черный
          </button>
        </div>
      )}

      {Math.max(game.creatorWins, game.participantWins) >= 3 && (
        <div className="text-center mt-8">
          <h2 className="text-3xl font-bold mb-4">Игра завершена!</h2>
          <p>Ожидание результатов...</p>
        </div>
      )}
    </div>
  );
};

export default Game;