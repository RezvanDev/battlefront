import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { spinWheel, getGameStatus, setPlayerReady } from '../api/api';
import { useTelegram } from '../context/TelegramContext';

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
  const [isReady, setIsReady] = useState(false);
  const [opponentReady, setOpponentReady] = useState(false);

  const { lobbyCode } = useParams<{ lobbyCode: string }>();
  const navigate = useNavigate();
  const { user } = useTelegram();

  const spinIntervalRef = useRef<number | null>(null);
  const timeIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    const fetchGameStatus = async () => {
      if (!lobbyCode) return;
      try {
        const data = await getGameStatus(lobbyCode);
        setGameStatus(data.game.status);
        setBet(data.game.bet);
        setCurrentRound(data.game.currentRound);
        if (user && user.id === data.game.creator.id) {
          setBalance(data.game.creator.balance);
          setIsReady(data.game.creatorReady);
          setOpponentReady(data.game.participantReady);
        } else if (user && data.game.participant && user.id === data.game.participant.id) {
          setBalance(data.game.participant.balance);
          setIsReady(data.game.participantReady);
          setOpponentReady(data.game.creatorReady);
        }
      } catch (error) {
        console.error('Error fetching game status:', error);
      }
    };

    fetchGameStatus();
    const interval = setInterval(fetchGameStatus, 5000);

    return () => clearInterval(interval);
  }, [lobbyCode, user]);

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
            handleStop(false, rotationAngle, playerColor || 'red');
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
  }, [isSpinning, rotationAngle, playerColor]);

  const handleColorSelect = async (color: 'red' | 'black') => {
    setPlayerColor(color);
    setIsSpinning(true);
    setTimeLeft(TIME_LIMIT);

    try {
      if (!user || !user.id || !lobbyCode) {
        console.error('User ID или lobbyCode не найден');
        return;
      }
      const data = await spinWheel(user.id.toString(), lobbyCode, color);
      const { isWin, angle, newBalance, wheelColor } = data.result;

      let currentAngle = rotationAngle;
      spinIntervalRef.current = window.setInterval(() => {
        if (currentAngle >= angle) {
          handleStop(isWin, angle, wheelColor);
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

  const handleStop = (isWin: boolean, finalAngle: number, finalColor: 'red' | 'black') => {
    if (spinIntervalRef.current) {
      clearInterval(spinIntervalRef.current);
    }
    setIsSpinning(false);
    
    setRotationAngle(finalAngle);
    setLandedColor(finalColor);
    setResult(isWin ? 'win' : 'lose');
    setIsReady(false);
    setOpponentReady(false);
  };

  const handleReady = async () => {
    if (!user || !user.id || !lobbyCode) return;
    try {
      await setPlayerReady(user.id.toString(), lobbyCode);
      setIsReady(true);
    } catch (error) {
      console.error('Error setting player ready:', error);
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
        <div className="text-2xl font-bold">Раунд {currentRound}/3</div>
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

      {!isReady && !isSpinning && (
        <button
          className="w-full py-4 bg-green-600 rounded-xl mb-4"
          onClick={handleReady}
        >
          Готов к следующему раунду
        </button>
      )}

      {isReady && !opponentReady && (
        <div className="text-center mb-4">
          Ожидание готовности соперника...
        </div>
      )}

      <div className="flex justify-center space-x-4 mt-4">
        <button
          className={`w-1/2 py-4 rounded-xl ${playerColor === 'red' ? 'bg-red-600' : 'bg-red-800'}`}
          onClick={() => handleColorSelect('red')}
          disabled={!isReady || !opponentReady || isSpinning}
        >
          Красный
        </button>
        <button
          className={`w-1/2 py-4 rounded-xl ${playerColor === 'black' ? 'bg-gray-800' : 'bg-gray-900'}`}
          onClick={() => handleColorSelect('black')}
          disabled={!isReady || !opponentReady || isSpinning}
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
        </div>
      )}

      {gameStatus === 'FINISHED' && (
        <button
          className="w-full py-4 bg-blue-600 rounded-xl mt-4"
          onClick={() => navigate('/')}
        >
          Вернуться в главное меню
        </button>
      )}
    </div>
  );
};

export default Game;