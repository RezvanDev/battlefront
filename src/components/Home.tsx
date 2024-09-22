// src/components/Home.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import duckImage from '../img/1.png';
import dogImage from '../img/2.png';
import createGameImage from '../img/3.png';

interface HomeProps {
  balance: number;
  onDeposit: () => void;
}

const Home: React.FC<HomeProps> = ({ balance, onDeposit }) => {
  const navigate = useNavigate();

  return (
    <div className="relative flex flex-col h-screen bg-black text-white p-4">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <img src={duckImage} alt="Profile" className="w-[48px] h-[48px] rounded-full mr-3" />
          <div>
            <div className="text-sm text-gray-400">Баланс</div>
            <div className="text-xl font-bold">{balance.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}$</div>
          </div>
        </div>
        <button
          onClick={onDeposit}
          className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium"
          style={{ width: '121px', height: '43px' }}
        >
          Пополнить
        </button>
      </div>
      
      <div className="flex-grow flex flex-col items-center">
        <img
          src={dogImage}
          alt="Game Character"
          className="absolute"
          style={{ width: '114px', height: '114px', top: '180px', left: '130px', borderRadius: '91px' }}
        />
        
        <img
          src={createGameImage}
          alt="Создать игру"
          className="absolute cursor-pointer"
          style={{
            width: '343px',
            height: '111px',
            top: '351px',
            left: '16px',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '16px',
            objectFit: 'cover'
          }}
          onClick={() => navigate('/create-game')}
        />
      </div>
    </div>
  );
};

export default Home;