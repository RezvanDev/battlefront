// src/components/InviteGame.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createGame, getBalance } from '../api/api';

const InviteGame: React.FC = () => {
  const [inviteLink, setInviteLink] = useState('');
  const [lobbyCode, setLobbyCode] = useState('');
  const [bet, setBet] = useState(10); // Минимальная ставка по умолчанию
  const [balance, setBalance] = useState(0);
  const [isCreatingGame, setIsCreatingGame] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBalance = async () => {
      const telegramId = localStorage.getItem('telegramId');
      if (telegramId) {
        try {
          const data = await getBalance(telegramId);
          setBalance(data.balance);
        } catch (error) {
          console.error('Error fetching balance:', error);
        }
      }
    };
    fetchBalance();
  }, []);

  const initGame = async () => {
    setIsCreatingGame(true);
    try {
      const telegramId = localStorage.getItem('telegramId');
      if (!telegramId) {
        console.error('TelegramId не найден');
        return;
      }
      const data = await createGame(telegramId, bet);
      setLobbyCode(data.lobbyCode);
      setInviteLink(`${window.location.origin}/join-game/${data.lobbyCode}`);
    } catch (error) {
      console.error('Ошибка при создании игры:', error);
    } finally {
      setIsCreatingGame(false);
    }
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink).then(() => {
      console.log('Ссылка скопирована');
    }, (err) => {
      console.error('Не удалось скопировать: ', err);
    });
  };

  const sendInvite = () => {
    // Здесь будет логика отправки приглашения
    console.log('Отправка приглашения');
  };

  const joinWaitingRoom = () => {
    navigate(`/waiting-room/${lobbyCode}`);
  };

  return (
    <div className="relative flex flex-col h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4">
      <h1 className="text-2xl font-bold mb-8 text-center">Создать игру</h1>
      <div className="flex-grow flex flex-col justify-center items-center">
        <div className="w-full max-w-md bg-[#232f3b] rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between bg-[#1e2327] rounded-xl p-3 mb-2">
            <span className="text-[#4CAF50]">Ваш баланс</span>
            <span className="text-[#4CAF50]">{balance}$</span>
          </div>
        </div>
        <div className="w-full max-w-md bg-[#232f3b] rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between bg-[#1e2327] rounded-xl p-3 mb-2">
            <span className="text-[#4CAF50]">Ставка</span>
            <input
              type="number"
              value={bet}
              onChange={(e) => setBet(Math.max(10, Math.min(balance, Number(e.target.value))))}
              className="bg-[#1e2327] text-[#4CAF50] p-1 rounded w-24 text-right"
            />
          </div>
        </div>
        {!lobbyCode ? (
          <button
            onClick={initGame}
            disabled={isCreatingGame || bet > balance}
            className={`w-full max-w-md bg-[#3390EC] text-white py-4 rounded-2xl text-lg font-medium mb-4 ${
              (isCreatingGame || bet > balance) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isCreatingGame ? 'Создание игры...' : 'Создать игру'}
          </button>
        ) : (
          <>
            <div className="w-full max-w-md bg-[#232f3b] rounded-2xl p-4 mb-4">
              <div className="flex items-center justify-between bg-[#1e2327] rounded-xl p-3 mb-2">
                <span className="text-[#4CAF50]">Ссылка</span>
                <button onClick={copyToClipboard} className="text-[#4CAF50]">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 9H11C9.89543 9 9 9.89543 9 11V20C9 21.1046 9.89543 22 11 22H20C21.1046 22 22 21.1046 22 20V11C22 9.89543 21.1046 9 20 9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5 15H4C3.46957 15 2.96086 14.7893 2.58579 14.4142C2.21071 14.0391 2 13.5304 2 13V4C2 3.46957 2.21071 2.96086 2.58579 2.58579C2.96086 2.21071 3.46957 2 4 2H13C13.5304 2 14.0391 2.21071 14.4142 2.58579C14.7893 2.96086 15 3.46957 15 4V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
              <p className="text-[#4CAF50] text-sm break-all">{inviteLink}</p>
            </div>
            <div className="w-full max-w-md bg-[#232f3b] rounded-2xl p-4 mb-4">
              <div className="flex items-center justify-between bg-[#1e2327] rounded-xl p-3 mb-2">
                <span className="text-[#4CAF50]">Код лобби</span>
                <button onClick={() => navigator.clipboard.writeText(lobbyCode)} className="text-[#4CAF50]">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 9H11C9.89543 9 9 9.89543 9 11V20C9 21.1046 9.89543 22 11 22H20C21.1046 22 22 21.1046 22 20V11C22 9.89543 21.1046 9 20 9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5 15H4C3.46957 15 2.96086 14.7893 2.58579 14.4142C2.21071 14.0391 2 13.5304 2 13V4C2 3.46957 2.21071 2.96086 2.58579 2.58579C2.96086 2.21071 3.46957 2 4 2H13C13.5304 2 14.0391 2.21071 14.4142 2.58579C14.7893 2.96086 15 3.46957 15 4V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
              <p className="text-[#4CAF50] text-sm">{lobbyCode}</p>
            </div>
            <button
              onClick={joinWaitingRoom}
              className="w-full max-w-md bg-[#3390EC] text-white py-4 rounded-2xl text-lg font-medium mb-4"
            >
              Войти в комнату ожидания
            </button>
            <button
              onClick={sendInvite}
              className="w-full max-w-md bg-[#3390EC] text-white py-4 rounded-2xl text-lg font-medium"
            >
              Пригласить
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default InviteGame;