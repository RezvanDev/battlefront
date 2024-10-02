import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getGameStatus, chooseColor } from '../api/api';
import { useTelegram } from '../context/TelegramContext';

const SEGMENTS = 50;
const SEGMENT_DEGREE = 360 / SEGMENTS;
const TIME_LIMIT = 10000; // 10 секунд

const Game: React.FC = () => {
  const { lobbyCode } = useParams<{ lobbyCode: string }>();
  const navigate = useNavigate();
  const { user } = useTelegram();
  const [game, setGame] = useState<any>(null);
  const [playerColor, setPlayerColor] = useState<'red' | 'black' | null>(null);
  const [opponentColor, setOpponentColor] = useState<'red' | 'black' | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [landedColor, setLandedColor] = useState<'red' | 'black' | null>(null);

  const fetchGameStatus = useCallback(async () => {
    if (!lobbyCode) return;
    try {
      const data = await getGameStatus(lobbyCode);
      setGame(data.game);
      
      if (data.game.status === 'FINISHED') {
        navigate(`/results/${lobbyCode}`);
      }
    } catch (error) {
      console.error('Error fetching game status:', error);
    }
  }, [lobbyCode, navigate]);

  useEffect(() => {
    fetchGameStatus();
    const interval = setInterval(fetchGameStatus, 1000);
    return () => clearInterval(interval);
  }, [fetchGameStatus]);

  useEffect(() => {
    if (game) {
      const isCreator = user?.id === game.creator.id;
      setPlayerColor(isCreator ? game.creatorColor : game.participantColor);
      setOpponentColor(isCreator ? game.participantColor : game.creatorColor);

      if (game.creatorColor && game.participantColor && !isSpinning) {
        setIsSpinning(true);
        animateSpin(game.lastSpinResult);
      }
    }
  }, [game, user, isSpinning]);

  useEffect(() => {
    if (!playerColor && !isSpinning) {
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 0) {
            clearInterval(timer);
            // Автоматически выбираем случайный цвет, если время истекло
            handleColorSelect(Math.random() < 0.5 ? 'red' : 'black');
            return 0;
          }
          return prevTime - 1000;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [playerColor, isSpinning]);

  const handleColorSelect = async (color: 'red' | 'black') => {
    if (!user?.id || !lobbyCode) return;
    try {
      await chooseColor(user.id.toString(), lobbyCode, color);
      setPlayerColor(color);
      setTimeLeft(TIME_LIMIT); // Сбрасываем таймер после выбора цвета
    } catch (error) {
      console.error('Error choosing color:', error);
    }
  };

  const animateSpin = (finalColor: 'red' | 'black') => {
    let angle = 0;
    const spinInterval = setInterval(() => {
      angle += 10;
      setRotationAngle(angle % 360);
      if (angle >= 720 + Math.random() * 360) {
        clearInterval(spinInterval);
        setIsSpinning(false);
        setLandedColor(finalColor);
      }
    }, 20);
  };

  const renderWheel = () => {
    const segments = [];
    for (let i = 0; i < SEGMENTS; i++) {
      const isRed = i % 2 === 0;
      const startAngle = i * SEGMENT_DEGREE;
      const endAngle = (i + 1) * SEGMENT_DEGREE;
      const startRadians = (startAngle * Math.PI) / 180;
      const endRadians = (endAngle * Math.PI) / 180;
      const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

      const startX = Math.cos(startRadians);
      const startY = Math.sin(startRadians);
      const endX = Math.cos(endRadians);
      const endY = Math.sin(endRadians);

      segments.push(
        <path
          key={i}
          d={`M 0 0 L ${startX} ${startY} A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY} Z`}
          fill={isRed ? '#FF4136' : '#111111'}
          stroke="#555"
          strokeWidth="0.01"
        />
      );
    }
    return segments;
  };

  if (!game) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4">
      <div className="text-center mb-4">
        <div className="text-2xl font-bold">Раунд {game.currentRound}/5</div>
        <div className="text-xl mt-2">Время: {Math.max(0, timeLeft / 1000).toFixed(1)} сек</div>
      </div>

      <div className="flex justify-between mb-4">
        <div>
          <p>Вы: {game.creator.id === user?.id ? game.creatorWins : game.participantWins} побед</p>
          <p>Цвет: {playerColor || 'Не выбран'}</p>
        </div>
        <div>
          <p>Оппонент: {game.creator.id === user?.id ? game.participantWins : game.creatorWins} побед</p>
          <p>Цвет: {opponentColor || 'Не выбран'}</p>
        </div>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center relative">
        <div className="w-full max-w-md aspect-square relative">
          <svg 
            viewBox="-1 -1 2 2" 
            className="w-full h-full"
            style={{
              transform: `rotate(${rotationAngle}deg)`,
              transition: 'transform 0.05s linear'
            }}
          >
            {renderWheel()}
            <circle cx="0" cy="0" r="0.05" fill="#DDDDDD" />
          </svg>
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-t-[40px] border-l-transparent border-r-transparent border-t-yellow-400"></div>
          </div>
        </div>
      </div>

      {!playerColor && !isSpinning && (
        <div className="flex justify-center space-x-4 mt-4">
          <button
            className="w-1/2 py-4 rounded-xl bg-red-600"
            onClick={() => handleColorSelect('red')}
          >
            Красный
          </button>
          <button
            className="w-1/2 py-4 rounded-xl bg-gray-800"
            onClick={() => handleColorSelect('black')}
          >
            Черный
          </button>
        </div>
      )}

      {landedColor && (
        <div className="mt-4 text-center">
          <div className="text-2xl font-bold mb-2">
            Выпал цвет: <span className={landedColor === 'red' ? 'text-red-500' : 'text-gray-300'}>{landedColor}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;