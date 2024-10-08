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
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [rotationAngle, setRotationAngle] = useState(0);

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
    if (game && game.status === 'PLAYING') {
      const currentTime = new Date();
      const roundStartTime = new Date(game.roundStartTime);
      const elapsedTime = currentTime.getTime() - roundStartTime.getTime();
      const remainingTime = Math.max(0, TIME_LIMIT - elapsedTime);
      setTimeLeft(remainingTime);

      const timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          const newTime = prevTime - 1000;
          if (newTime <= 0) {
            clearInterval(timer);
            return 0;
          }
          return newTime;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [game]);

  const handleColorSelect = async (color: 'red' | 'black') => {
    if (!user?.id || !lobbyCode) return;
    try {
      await chooseColor(user.id.toString(), lobbyCode, color);
      setPlayerColor(color);
      fetchGameStatus();
    } catch (error) {
      console.error('Error choosing color:', error);
    }
  };

  const animateSpin = useCallback(() => {
    let angle = 0;
    const spinInterval = setInterval(() => {
      angle += 10;
      setRotationAngle(angle % 360);
      if (angle >= 720 + Math.random() * 360) {
        clearInterval(spinInterval);
      }
    }, 20);
  }, []);

  useEffect(() => {
    if (game && game.lastSpinResult && game.lastSpinResult !== playerColor) {
      animateSpin();
      setPlayerColor(null);
    }
  }, [game, playerColor, animateSpin]);

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

  const isCreator = user?.id === game.creator.id;
  const currentPlayer = isCreator ? game.creator : game.participant;
  const opponentPlayer = isCreator ? game.participant : game.creator;

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4">
      <div className="text-center mb-4">
        <div className="text-2xl font-bold">Раунд {game.currentRound}/5</div>
        <div className="text-xl mt-2">Время: {Math.max(0, timeLeft / 1000).toFixed(1)} сек</div>
      </div>

      <div className="flex justify-between mb-4">
        <div>
          <p>Вы: {currentPlayer.wins} побед</p>
          <p>Цвет: {playerColor || 'Не выбран'}</p>
        </div>
        <div>
          <p>Оппонент: {opponentPlayer?.wins} побед</p>
          <p>Цвет: {isCreator ? game.participantColor : game.creatorColor || 'Не выбран'}</p>
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

      {game.status === 'PLAYING' && !playerColor && (
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

      {game.lastSpinResult && (
        <div className="mt-4 text-center">
          <div className="text-2xl font-bold mb-2">
            Выпал цвет: <span className={game.lastSpinResult === 'red' ? 'text-red-500' : 'text-gray-300'}>{game.lastSpinResult}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;