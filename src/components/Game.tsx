import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { spinWheel, getGameStatus, chooseColor } from '../api/api';
import { useTelegram } from '../context/TelegramContext';

const SEGMENTS = 50;
const SEGMENT_DEGREE = 360 / SEGMENTS;
const TIME_LIMIT = 10000; // 10 секунд

const Game: React.FC = () => {
  const [gameStatus, setGameStatus] = useState<any>(null);
  const [selectedColor, setSelectedColor] = useState<'red' | 'black' | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<'win' | 'lose' | null>(null);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [landedColor, setLandedColor] = useState<'red' | 'black' | null>(null);

  const { lobbyCode } = useParams<{ lobbyCode: string }>();
  const { user } = useTelegram();

  const spinIntervalRef = useRef<number | null>(null);
  const timeIntervalRef = useRef<number | null>(null);

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

  const handleColorSelect = async (color: 'red' | 'black') => {
    if (!user || !user.id || !lobbyCode) {
      console.error('User ID или lobbyCode не найден');
      return;
    }
    setSelectedColor(color);
    await chooseColor(user.id.toString(), lobbyCode, color);
  };

  const handleSpin = async () => {
    if (!user || !user.id || !lobbyCode) {
      console.error('Не хватает данных для вращения');
      return;
    }
    setIsSpinning(true);
    setTimeLeft(TIME_LIMIT);

    try {
      const data = await spinWheel(user.id.toString(), lobbyCode);
      const { isCreatorWin, isParticipantWin, angle, wheelColor } = data.result;

      let currentAngle = 0;
      spinIntervalRef.current = window.setInterval(() => {
        if (currentAngle >= angle) {
          handleStop(isCreatorWin || isParticipantWin, angle, wheelColor);
        } else {
          currentAngle += 10;
          setRotationAngle(currentAngle % 360);
        }
      }, 20);
    } catch (error) {
      console.error('Error spinning wheel:', error);
      setIsSpinning(false);
    }
  };

  const handleStop = (isWin?: boolean, finalAngle?: number, finalColor?: 'red' | 'black') => {
    if (spinIntervalRef.current) {
      clearInterval(spinIntervalRef.current);
    }
    setIsSpinning(false);
    
    if (finalAngle !== undefined) setRotationAngle(finalAngle);
    if (finalColor !== undefined) setLandedColor(finalColor);
    if (isWin !== undefined) setResult(isWin ? 'win' : 'lose');
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

  if (!gameStatus) {
    return <div className="flex items-center justify-center h-screen bg-gradient-to-b from-gray-900 to-black text-white">Загрузка...</div>;
  }

  const isCreator = user && user.id === gameStatus.creator.id;
  const isPlayerTurn = (isCreator && gameStatus.currentTurn === 'CREATOR') || (!isCreator && gameStatus.currentTurn === 'PARTICIPANT');

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold">Игра: {lobbyCode}</h2>
        <p className="text-xl">Статус: {gameStatus.status}</p>
        <p className="text-xl">Ставка: {gameStatus.bet}$</p>
        <p className="text-xl">Раунд: {gameStatus.currentRound}/3</p>
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

      {isPlayerTurn && !selectedColor && (
        <div className="flex justify-center space-x-4 mt-4">
          <button
            className="w-1/2 py-4 bg-red-600 rounded-xl"
            onClick={() => handleColorSelect('red')}
          >
            Красный
          </button>
          <button
            className="w-1/2 py-4 bg-gray-800 rounded-xl"
            onClick={() => handleColorSelect('black')}
          >
            Черный
          </button>
        </div>
      )}

      {selectedColor && !isSpinning && isPlayerTurn && (
        <button
          className="w-full py-4 bg-blue-600 rounded-xl mt-4"
          onClick={handleSpin}
        >
          Вращать колесо
        </button>
      )}

      {isSpinning && (
        <div className="text-center mt-4">
          <p className="text-xl">Вращение колеса...</p>
          <p className="text-xl">Осталось времени: {(timeLeft / 1000).toFixed(1)} сек</p>
        </div>
      )}

      {result && (
        <div className="text-center mt-4">
          <p className="text-2xl font-bold">{result === 'win' ? 'Победа!' : 'Поражение'}</p>
          <p className="text-xl">Выпавший цвет: <span className={landedColor === 'red' ? 'text-red-500' : 'text-gray-300'}>{landedColor}</span></p>
          <p className="text-xl">Ваш выбор: <span className={selectedColor === 'red' ? 'text-red-500' : 'text-gray-300'}>{selectedColor}</span></p>
        </div>
      )}

      {!isPlayerTurn && (
        <div className="text-center mt-4">
          <p className="text-xl">Ожидание хода другого игрока...</p>
        </div>
      )}
    </div>
  );
};

export default Game;