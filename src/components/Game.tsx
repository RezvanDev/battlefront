import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { spinWheel, getGameStatus, chooseColor } from '../api/api';
import { useTelegram } from '../context/TelegramContext';

const SEGMENTS = 50;
const SEGMENT_DEGREE = 360 / SEGMENTS;
const TIME_LIMIT = 10000; // 10 секунд

const Game: React.FC = () => {
  const [gameStatus, setGameStatus] = useState<'WAITING' | 'PLAYING' | 'FINISHED'>('WAITING');
  const [currentRound, setCurrentRound] = useState(1);
  const [showRoundInfo, setShowRoundInfo] = useState(true);
  const [playerColor, setPlayerColor] = useState<'red' | 'black' | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<'win' | 'lose' | null>(null);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [landedColor, setLandedColor] = useState<'red' | 'black' | null>(null);
  const [isCreator, setIsCreator] = useState(false);
  const [isUserTurn, setIsUserTurn] = useState(false);
  const [creatorWins, setCreatorWins] = useState(0);
  const [participantWins, setParticipantWins] = useState(0);

  const { lobbyCode } = useParams<{ lobbyCode: string }>();
  const navigate = useNavigate();
  const { user } = useTelegram();

  const spinIntervalRef = useRef<number | null>(null);
  const timeIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    const fetchGameStatus = async () => {
      if (!lobbyCode || !user) return;
      try {
        const data = await getGameStatus(lobbyCode);
        updateGameState(data.game);
      } catch (error) {
        console.error('Error fetching game status:', error);
      }
    };

    fetchGameStatus();
    const interval = setInterval(fetchGameStatus, 1000);

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

  const updateGameState = (game: any) => {
    setGameStatus(game.status);
    setCurrentRound(game.currentRound);
    setCreatorWins(game.creatorWins);
    setParticipantWins(game.participantWins);
    setIsCreator(game.creator.id === user?.id);
    setIsUserTurn(game.currentTurn === (isCreator ? 'creator' : 'participant'));

    if (game.status === 'FINISHED') {
      navigate(`/waiting-results/${lobbyCode}`);
    }
  };

  const handleColorSelect = async (color: 'red' | 'black') => {
    if (!user || !lobbyCode) return;
    try {
      await chooseColor(user.id.toString(), lobbyCode, color);
      setPlayerColor(color);
    } catch (error) {
      console.error('Error selecting color:', error);
    }
  };

  const spin = () => {
    setIsSpinning(true);
    setTimeLeft(TIME_LIMIT);
    let angle = rotationAngle;
    spinIntervalRef.current = window.setInterval(() => {
      angle += 10;
      setRotationAngle(angle % 360);
    }, 20);
  };

  const handleStop = async () => {
    if (!user || !lobbyCode) return;
    if (spinIntervalRef.current) {
      clearInterval(spinIntervalRef.current);
    }
    setIsSpinning(false);
    
    try {
      const result = await spinWheel(user.id.toString(), lobbyCode);
      const { isWin, wheelColor, updatedGame } = result.result;
      
      setLandedColor(wheelColor);
      setResult(isWin ? 'win' : 'lose');
      updateGameState(updatedGame);

      setTimeout(() => {
        setResult(null);
        setLandedColor(null);
        setPlayerColor(null);
        setShowRoundInfo(true);
      }, 3000);
    } catch (error) {
      console.error('Error spinning wheel:', error);
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
        <div className="text-4xl font-bold mb-4">Раунд {currentRound}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4">
      <div className="text-center mb-4">
        <div className="text-2xl font-bold">Раунд {currentRound}</div>
        <div className="text-xl mt-2">Создатель: {creatorWins} | Участник: {participantWins}</div>
        <div className="text-xl mt-2">
          {isUserTurn ? 'Ваш ход' : 'Ход противника'}
        </div>
        <div className="text-xl mt-2">Время: {(timeLeft / 1000).toFixed(1)} сек</div>
        {playerColor && (
          <div className="text-xl mt-2">
            Ваш цвет: <span className={playerColor === 'red' ? 'text-red-500' : 'text-gray-300'}>{playerColor}</span>
          </div>
        )}
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

      {isUserTurn && !playerColor && (
        <div className="flex justify-center space-x-4 mt-4">
          <button
            className="w-1/2 py-4 rounded-xl bg-red-800"
            onClick={() => handleColorSelect('red')}
          >
            Красный
          </button>
          <button
            className="w-1/2 py-4 rounded-xl bg-gray-900"
            onClick={() => handleColorSelect('black')}
          >
            Черный
          </button>
        </div>
      )}

      {isUserTurn && playerColor && !isSpinning && (
        <button
          className="mt-4 w-full py-4 bg-blue-600 rounded-xl"
          onClick={spin}
        >
          Крутить колесо
        </button>
      )}

      {isUserTurn && isSpinning && (
        <button
          className="mt-4 w-full py-4 bg-blue-600 rounded-xl"
          onClick={handleStop}
        >
          Остановить
        </button>
      )}

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
    </div>
  );
};

export default Game;