import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getGameStatus, chooseColor, spinWheel } from '../api/api';

const SEGMENTS = 50;
const SEGMENT_DEGREE = 360 / SEGMENTS;
const TIME_LIMIT = 10000; // 10 секунд

const Game: React.FC = () => {
  const { lobbyCode } = useParams<{ lobbyCode: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<any>(null);
  const [playerColor, setPlayerColor] = useState<'red' | 'black' | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [landedColor, setLandedColor] = useState<'red' | 'black' | null>(null);

  const spinIntervalRef = useRef<number | null>(null);
  const timeIntervalRef = useRef<number | null>(null);

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
    if (isSpinning) {
      timeIntervalRef.current = window.setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 0) {
            handleStop();
            return 0;
          }
          return prevTime - 100;
        });
      }, 100);
    } else {
      if (timeIntervalRef.current) {
        clearInterval(timeIntervalRef.current);
      }
    }
    return () => {
      if (timeIntervalRef.current) {
        clearInterval(timeIntervalRef.current);
      }
    };
  }, [isSpinning]);

  const handleSpin = useCallback(async () => {
    setIsSpinning(true);
    setTimeLeft(TIME_LIMIT);
    let angle = rotationAngle;
    spinIntervalRef.current = window.setInterval(() => {
      angle += 10;
      setRotationAngle(angle % 360);
    }, 20);

    try {
      const telegramId = localStorage.getItem('telegramId');
      if (telegramId && lobbyCode) {
        await spinWheel(telegramId, lobbyCode);
      }
    } catch (error) {
      console.error('Error spinning wheel:', error);
    }
  }, [rotationAngle, lobbyCode]);

  const handleColorSelect = async (color: 'red' | 'black') => {
    setPlayerColor(color);
    try {
      const telegramId = localStorage.getItem('telegramId');
      if (telegramId && lobbyCode) {
        await chooseColor(telegramId, lobbyCode, color);
      }
    } catch (error) {
      console.error('Error choosing color:', error);
    }
  };

  const handleStop = () => {
    if (spinIntervalRef.current) {
      clearInterval(spinIntervalRef.current);
    }
    setIsSpinning(false);
    
    const finalAngle = (360 - (rotationAngle % 360)) % 360;
    const segment = Math.floor(finalAngle / SEGMENT_DEGREE);
    const isRed = segment % 2 === 0;
    const finalColor = isRed ? 'red' : 'black';
    
    setLandedColor(finalColor);
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
    return (
      <div className="flex flex-col h-screen bg-gradient-to-b from-gray-900 to-black text-white items-center justify-center">
        <div className="text-4xl font-bold mb-4">Загрузка игры...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4">
      <div className="text-center mb-4">
        <div className="text-2xl font-bold">Раунд {game.currentRound}/5</div>
        <div className="text-xl mt-2">Время: {(timeLeft / 1000).toFixed(1)} сек</div>
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

      <div className="flex justify-center space-x-4 mt-4">
        <button
          className={`w-1/2 py-4 rounded-xl ${playerColor === 'red' ? 'bg-red-600' : 'bg-red-800'}`}
          onClick={() => handleColorSelect('red')}
          disabled={playerColor !== null || isSpinning}
        >
          Красный
        </button>
        <button
          className={`w-1/2 py-4 rounded-xl ${playerColor === 'black' ? 'bg-gray-800' : 'bg-gray-900'}`}
          onClick={() => handleColorSelect('black')}
          disabled={playerColor !== null || isSpinning}
        >
          Черный
        </button>
      </div>

      {!isSpinning && playerColor && (
        <button
          className="mt-4 w-full py-4 bg-blue-600 rounded-xl"
          onClick={handleSpin}
        >
          Крутить колесо
        </button>
      )}

      {isSpinning && (
        <button
          className="mt-4 w-full py-4 bg-blue-600 rounded-xl"
          onClick={handleStop}
        >
          Остановить
        </button>
      )}

      {landedColor && (
        <div className="mt-4 text-center">
          <div className="text-2xl font-bold mb-2">
            Выпал цвет: <span className={landedColor === 'red' ? 'text-red-500' : 'text-gray-300'}>{landedColor}</span>
          </div>
          <div className="text-xl mb-2">
            Ваш выбор: <span className={playerColor === 'red' ? 'text-red-500' : 'text-gray-300'}>{playerColor}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;