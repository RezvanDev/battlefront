import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { spinWheel, getGameStatus, chooseColor } from '../api/api';
import { useTelegram } from '../context/TelegramContext';

const SEGMENTS = 50;
const SEGMENT_DEGREE = 360 / SEGMENTS;

const Game: React.FC = () => {
  const [currentRound, setCurrentRound] = useState(1);
  const [showRoundInfo, setShowRoundInfo] = useState(true);
  const [playerColor, setPlayerColor] = useState<'red' | 'black' | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<'win' | 'lose' | null>(null);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [landedColor, setLandedColor] = useState<'red' | 'black' | null>(null);
  const [gameStatus, setGameStatus] = useState<'WAITING' | 'PLAYING' | 'FINISHED'>('WAITING');
  const [creatorWins, setCreatorWins] = useState(0);
  const [participantWins, setParticipantWins] = useState(0);
  const [isCreatorTurn, setIsCreatorTurn] = useState(true);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isCreator, setIsCreator] = useState(false);

  const { lobbyCode } = useParams<{ lobbyCode: string }>();
  const navigate = useNavigate();
  const { user } = useTelegram();

  const spinIntervalRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const fetchGameStatus = async () => {
      if (!lobbyCode || !user) return;
      try {
        const data = await getGameStatus(lobbyCode);
        setGameStatus(data.game.status);
        setCreatorWins(data.game.creatorWins);
        setParticipantWins(data.game.participantWins);
        setCurrentRound(data.game.currentRound);
        setIsCreatorTurn(data.game.currentRound % 2 !== 0);
        setPlayerColor(data.game.creatorColor);
        setIsCreator(data.game.creator.id === user.id);
        
        if (data.game.status === 'FINISHED') {
          navigate(`/waiting-results/${lobbyCode}`);
        }
      } catch (error) {
        console.error('Error fetching game status:', error);
      }
    };

    fetchGameStatus();
    const interval = setInterval(fetchGameStatus, 5000);

    return () => clearInterval(interval);
  }, [lobbyCode, user, navigate]);

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
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            handleStop();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isSpinning]);

  const spin = () => {
    setIsSpinning(true);
    setTimeLeft(10);
    let angle = rotationAngle;
    spinIntervalRef.current = window.setInterval(() => {
      angle += 10;
      setRotationAngle(angle % 360);
    }, 20);
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

  const handleStop = async () => {
    if (!user || !lobbyCode) return;
    if (spinIntervalRef.current) {
      clearInterval(spinIntervalRef.current);
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsSpinning(false);
    
    const finalAngle = (360 - (rotationAngle % 360)) % 360;
    const segment = Math.floor(finalAngle / SEGMENT_DEGREE);
    const isRed = segment % 2 === 0;
    const finalColor = isRed ? 'red' : 'black';
    
    setLandedColor(finalColor);
    
    try {
      const data = await spinWheel(user.id.toString(), lobbyCode);
      const { isWin, updatedGame } = data.result;
      
      setResult(isWin ? 'win' : 'lose');
      setCreatorWins(updatedGame.creatorWins);
      setParticipantWins(updatedGame.participantWins);
      setCurrentRound(updatedGame.currentRound);
      setIsCreatorTurn(updatedGame.currentRound % 2 !== 0);

      if (updatedGame.status === 'FINISHED') {
        navigate(`/waiting-results/${lobbyCode}`);
      } else {
        // Автоматический переход к следующему раунду через 3 секунды
        setTimeout(() => {
          setShowRoundInfo(true);
          setResult(null);
          setRotationAngle(0);
          setLandedColor(null);
        }, 3000);
      }
    } catch (error) {
      console.error('Error updating game status:', error);
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

  const isUserTurn = (isCreator && isCreatorTurn) || (!isCreator && !isCreatorTurn);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4">
      <div className="text-center mb-4">
        <div className="text-2xl font-bold">Раунд {currentRound}</div>
        <div className="text-xl mt-2">Создатель: {creatorWins} | Участник: {participantWins}</div>
        <div className="text-xl mt-2">
          {isUserTurn ? 'Ваш ход' : 'Ход противника'}
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

      {isCreator && currentRound === 1 && playerColor === null && (
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 mt-4">
          <button
            className="w-full sm:w-1/2 py-4 rounded-xl bg-red-600"
            onClick={() => handleColorSelect('red')}
          >
            Красный
          </button>
          <button
            className="w-full sm:w-1/2 py-4 rounded-xl bg-gray-800"
            onClick={() => handleColorSelect('black')}
          >
            Черный
          </button>
        </div>
      )}

      {isUserTurn && !isSpinning && playerColor !== null && (
        <button
          className="mt-4 w-full py-4 bg-blue-600 rounded-xl"
          onClick={spin}
        >
          Крутить колесо
        </button>
      )}

      {isUserTurn && isSpinning && (
        <div className="mt-4 text-center">
          <div className="text-2xl font-bold mb-2">
            Осталось времени: {timeLeft} сек
          </div>
          <button
            className="mt-4 w-full py-4 bg-blue-600 rounded-xl"
            onClick={handleStop}
          >
            Остановить
          </button>
        </div>
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