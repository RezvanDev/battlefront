import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { chooseColor, getGameStatus } from '../api/api';

const GamePlay: React.FC = () => {
  const { lobbyCode } = useParams<{ lobbyCode: string }>();
  const [gameStatus, setGameStatus] = useState<any>(null);
  const [selectedColor, setSelectedColor] = useState<'red' | 'black' | null>(null);

  useEffect(() => {
    const fetchGameStatus = async () => {
      if (lobbyCode) {
        const data = await getGameStatus(lobbyCode);
        setGameStatus(data.game);
      }
    };
    fetchGameStatus();
    const interval = setInterval(fetchGameStatus, 5000);
    return () => clearInterval(interval);
  }, [lobbyCode]);

  const handleColorChoice = async (color: 'red' | 'black') => {
    const telegramId = localStorage.getItem('telegramId');
    if (telegramId && lobbyCode) {
      const result = await chooseColor(telegramId, lobbyCode, color);
      setSelectedColor(color);
      if (result.result) {
        // Обработка результата игры
        console.log('Игра завершена:', result);
      }
    }
  };

  if (!gameStatus) {
    return <div>Загрузка...</div>;
  }

  return (
    <div>
      <h2>Игра: {lobbyCode}</h2>
      <p>Статус: {gameStatus.status}</p>
      <p>Ставка: {gameStatus.bet}</p>
      {gameStatus.status === 'PLAYING' && !selectedColor && (
        <div>
          <button onClick={() => handleColorChoice('red')}>Красный</button>
          <button onClick={() => handleColorChoice('black')}>Черный</button>
        </div>
      )}
      {selectedColor && <p>Вы выбрали: {selectedColor}</p>}
      {gameStatus.result && (
        <div>
          <p>Результат: {gameStatus.result}</p>
          {/* Здесь можно добавить отображение победителя и выигрыша */}
        </div>
      )}
    </div>
  );
};

export default GamePlay;