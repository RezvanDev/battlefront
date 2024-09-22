// src/components/Home.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import duckImage from '../img/1.png';
import dogImage from '../img/2.png';

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
          style={{ width: '114px', height: '114px', top: '222px', left: '130px', borderRadius: '91px' }}
        />
        
        <div 
          className="absolute bg-gray-800 rounded-2xl border border-gray-700 flex items-center"
          style={{ width: '343px', height: '111px', top: '351px', left: '30px', padding: '16px' }}
        >
          <button 
            onClick={() => navigate('/create-game')}
            className="w-full h-full flex items-center justify-between"
          >
            <span className="flex items-center">
              <span className="mr-6 text-2xl text-yellow-400">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 7.5V12.5C21 16.642 17.642 20 13.5 20C9.358 20 6 16.642 6 12.5V4.5C6 4.224 6.224 4 6.5 4H11.5C15.642 4 19 7.358 19 11.5V14.5C19 14.776 18.776 15 18.5 15H16.5C16.224 15 16 14.776 16 14.5V11.5C16 9.019 13.981 7 11.5 7H9V12.5C9 14.981 11.019 17 13.5 17C15.981 17 18 14.981 18 12.5V7.5C18 7.224 18.224 7 18.5 7H20.5C20.776 7 21 7.224 21 7.5Z" fill="currentColor"/>
                </svg>
              </span>
              <span className="text-xl font-semibold">Создать игру!</span>
            </span>
            <span className="text-2xl">&gt;</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;