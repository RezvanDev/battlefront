import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBalance } from '../api/api';
import duckImage from '../img/1.png';
import dogImage from '../img/2.png';
import GameImage from '../img/Vector.png';

interface HomeProps {
  initialBalance?: number;
  onDeposit: () => void;
}

const Home: React.FC<HomeProps> = ({ initialBalance = 0, onDeposit }) => {
  const [balance, setBalance] = useState(initialBalance);
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

  return (
    <div className="relative flex flex-col h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <img src={duckImage} alt="Profile" className="w-12 h-12 rounded-full mr-3" />
          <div>
            <div className="text-sm text-gray-400">Баланс</div>
            <div className="text-xl font-bold">{balance.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}$</div>
          </div>
        </div>
        <button
          onClick={onDeposit}
          className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-medium"
        >
          Пополнить
        </button>
      </div>
      <div className="flex-grow flex flex-col items-center justify-center">
        <img
          src={dogImage}
          alt="Game Character"
          className="w-32 h-32 mb-12"
        />
        <div
          className="w-full max-w-sm bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl border border-gray-700 p-4 mb-4"
          style={{height: '80px'}}
        >
          <button
            onClick={() => navigate('/invite-game')}
            className="w-full h-full flex items-center justify-between"
          >
            <span className="flex items-center">
              <img src={GameImage} alt="Game" className="w-10 h-10 mr-4" />
              <span className="text-xl font-semibold">Создать игру!</span>
            </span>
            <span className="text-2xl">&gt;</span>
          </button>
        </div>
        <div
          className="w-full max-w-sm bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl border border-gray-700 p-4"
          style={{height: '80px'}}
        >
          <button
            onClick={() => navigate('/join-game')}
            className="w-full h-full flex items-center justify-between"
          >
            <span className="flex items-center">
              <img src={GameImage} alt="Game" className="w-10 h-10 mr-4" />
              <span className="text-xl font-semibold">Войти в игру</span>
            </span>
            <span className="text-2xl">&gt;</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;