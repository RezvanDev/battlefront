import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { createGame } from '../api/gameService';

const InviteGame: React.FC = () => {
  const [inviteLink, setInviteLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useUser();

  const handleCreateGame = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const bet = 100; // Здесь можно добавить логику для выбора ставки
      const game = await createGame(user.id, bet);
      setInviteLink(`${window.location.origin}/join/${game.id}`);
      navigate('/waiting-room', { state: { gameId: game.id } });
    } catch (error) {
      console.error('Error creating game:', error);
      // Здесь можно добавить отображение ошибки пользователю
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink).then(() => {
      console.log('Ссылка скопирована');
    }, (err) => {
      console.error('Не удалось скопировать: ', err);
    });
  };

  return (
    <div className="relative flex flex-col h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4">
      <h1 className="text-2xl font-bold mb-8 text-center">Пригласить в игру</h1>
      <div className="flex-grow flex flex-col justify-center items-center">
        {!inviteLink ? (
          <button
            onClick={handleCreateGame}
            disabled={isLoading}
            className="w-full max-w-md bg-[#3390EC] text-white py-4 rounded-2xl text-lg font-medium"
          >
            {isLoading ? 'Создание игры...' : 'Создать игру'}
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
              <p className="text-[#4CAF50] text-sm">Скопируйте и отправьте другу</p>
            </div>
            <p className="text-center mb-4">Ожидание игрока...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default InviteGame;