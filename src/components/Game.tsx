import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { spinWheel, getGameStatus } from '../api/api';

const SEGMENTS = 50;
const SEGMENT_DEGREE = 360 / SEGMENTS;
const TIME_LIMIT = 10000; // 10 секунд

const Game: React.FC = () => {
  const [currentRound, setCurrentRound] = useState(1);
  const [showRoundInfo, setShowRoundInfo] = useState(true);
  const [playerColor, setPlayerColor] = useState<'red' | 'black' | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<'win' | 'lose' | null>(null);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [landedColor, setLandedColor] = useState<'red' | 'black' | null>(null);
  const [bet, setBet] = useState(0);
  const [gameStatus, setGameStatus] = useState<'WAITING' | 'PLAYING' | 'FINISHED'>('WAITING');
  const [balance, setBalance] = useState(0);

  const { lobbyCode } = useParams<{ lobbyCode: string }>();
  const navigate = useNavigate();

  const spinIntervalRef = useRef<number | null>(null);
  const timeIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    const fetchGameStatus = async () => {
      if (!lobbyCode) return;
      try {
        const data = await getGameStatus(lobbyCode);
        setGameStatus(data.game.status);
        setBet(data.game.bet);
        setBalance(data.game.creator.balance);
      } catch (error) {
        console.error('Error fetching game status:', error);
      }
    };

    fetchGameStatus();
    const interval = setInterval(fetchGameStatus, 5000);

    return () => clearInterval(interval);
  }, [lobbyCode]);

  useEffect(() => {
    if (showRoundInfo) {
      const timer = setTimeout(() => {
        setShowRoundInfo(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showRoundInfo]);

  useEffect(() => {
    if (isSpinning) {
      timeIntervalRef.current = window.setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 0) {
            handleStop(false, rotationAngle);
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
  }, [isSpinning, rotationAngle]);

  const handleColorSelect = async (color: 'red' | 'black') => {
    setPlayerColor(color);
    setIsSpinning(true);
    setTimeLeft(TIME_LIMIT);

    try {
      const telegramId = localStorage.getItem('telegramId');
      if (!telegramId || !lobbyCode) {
        console.error('TelegramId или lobbyCode не найден');
        return;
      }
      const data = await spinWheel(telegramId, lobbyCode, bet);
      const { isWin, angle, newBalance } = data.result;

      let currentAngle = rotationAngle;
      spinIntervalRef.current = window.setInterval(() => {
        if (currentAngle >= angle) {
          handleStop(isWin, angle);
        } else {
          currentAngle += 10;
          setRotationAngle(currentAngle % 360);
        }
      }, 20);

      setBalance(newBalance);
    } catch (error) {
      console.error('Error spinning wheel:', error);
      setIsSpinning(false);
    }
  };

  const handleStop = (isWin: boolean, finalAngle: number) => {
    if (spinIntervalRef.current) {
      clearInterval(spinIntervalRef.current);
    }
    setIsSpinning(false);
    
    setRotationAngle(finalAngle);
    const segment = Math.floor(finalAngle / SEGMENT_DEGREE);
    const isRed = segment % 2 === 0;
    const finalColor = isRed ? 'red' : 'black';
    
    setLandedColor(finalColor);
    setResult(isWin ? 'win' : 'lose');
  };

  const handleNextRound = () => {
    if (currentRound < 3) {
      setCurrentRound(currentRound + 1);
      setShowRoundInfo(true);
      setPlayerColor(null);
      setResult(null);
      setRotationAngle(0);
      setIsSpinning(false);
      setTimeLeft(TIME_LIMIT);
      setLandedColor(null);
    } else {
      navigate('/');
    }
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

  if (gameStatus === 'WAITING') {
    return (
      <div className="flex flex-col h-screen bg-gradient-to-b from-gray-900 to-black text-white items-center justify-center">
        <div className="text-2xl font-bold mb-4">Ожидание второго игрока...</div>
      </div>
    );
  }

  if (showRoundInfo) {
    return (
      <div className="flex flex-col h-screen bg-gradient-to-b from-gray-900 to-black text-white items-center justify-center">
        <div className="text-4xl font-bold mb-4">Раунд {currentRound}/3</div>
        <div className="text-2xl">Ставка: {bet}$</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4">
      <div className="text-center mb-4">
        <div className="text-2xl font-bold">Выберите цвет</div>
        <div className="text-xl mt-2">Время: {(timeLeft / 1000).toFixed(1)} сек</div>
        <div className="text-xl mt-2">Баланс: {balance}$</div>
        <div className="text-xl mt-2">Ставка: {bet}$</div>
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

      {result && (
        <div className="mt-4 text-center">
          <div className="text-2xl font-bold mb-2">
            {result === 'win' ? 'Вы выиграли!' : 'Вы проиграли'}
          </div>
          <div className="text-xl mb-2">
            Выпал цвет: <span className={landedColor === 'red' ? 'text-red-500' : 'text-gray-300'}>{landedColor}</span>
          </div>
          <div className="text-xl mb-2">
            Ваш выбор: <span className={playerColor === 'red' ? 'text-red-500' : 'text-gray-300'}>{playerColor}</span>
          </div>
          <button
            className="w-full py-4 bg-green-600 rounded-xl"
            onClick={handleNextRound}
          >
            {currentRound < 3 ? 'Следующий раунд' : 'Завершить игру'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Game;