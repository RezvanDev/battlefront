import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { joinGame } from '../api/api';
import axios from 'axios';

const JoinGame: React.FC = () => {
  const [lobbyCode, setLobbyCode] = useState('');
  const navigate = useNavigate();

  const handleJoin = async () => {
    try {
      const telegramId = localStorage.getItem('telegramId');
      if (!telegramId) {
        console.error('TelegramId не найден');
        alert('TelegramId не найден. Пожалуйста, авторизуйтесь заново.');
        return;
      }
      const data = await joinGame(telegramId, lobbyCode);
      if (data.success) {
        navigate(`/waiting-room/${lobbyCode}`);
      } else {
        console.error('Ошибка при присоединении к игре:', data.error);
        alert(data.error || 'Неверный код лобби');
      }
    } catch (error) {
      console.error('Ошибка при присоединении к игре:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('Ответ сервера:', error.response.data);
        alert(`Ошибка: ${error.response.data.error || 'Неизвестная ошибка'}`);
      } else {
        alert('Произошла неизвестная ошибка при присоединении к игре');
      }
    }
  };

  return (
    <div className="relative flex flex-col h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4">
      <h1 className="text-2xl font-bold mb-8 text-center">Войти в игру</h1>
      <div className="flex-grow flex flex-col justify-center items-center">
        <div className="w-full max-w-md bg-[#232f3b] rounded-2xl p-4 mb-4">
          <input
            type="text"
            value={lobbyCode}
            onChange={(e) => setLobbyCode(e.target.value)}
            placeholder="Введите код лобби"
            className="w-full bg-[#1e2327] text-white p-3 rounded-xl"
          />
        </div>
        <button
          onClick={handleJoin}
          className="w-full max-w-md bg-[#3390EC] text-white py-4 rounded-2xl text-lg font-medium"
        >
          Присоединиться к игре
        </button>
      </div>
    </div>
  );
};

export default JoinGame;