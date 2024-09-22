// src/components/Deposit.tsx
import React from 'react';

interface DepositOption {
  id: string;
  name: string;
  icon: React.ReactNode;
}

const depositOptions: DepositOption[] = [
  { 
    id: 'ton', 
    name: 'TON', 
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
  },
  { 
    id: 'solana', 
    name: 'Solana', 
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 14L16 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 8H10V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 16H16V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
  },
];

const Deposit: React.FC = () => {
  const handleDeposit = (optionId: string) => {
    // Здесь будет логика для обработки депозита
    console.log(`Depositing with ${optionId}`);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-[#1e2327] to-[#15191c] text-white p-4">
      <h1 className="text-2xl font-bold mb-8">Пополнить баланс</h1>
      <div className="space-y-4">
        {depositOptions.map((option, index) => (
          <button
            key={option.id}
            onClick={() => handleDeposit(option.id)}
            className={`w-full py-4 rounded-2xl text-lg font-medium flex items-center px-4 ${
              index === 0 ? 'bg-[#3390ec] text-white' : 'bg-white text-black'
            }`}
          >
            <span className="mr-3">{option.icon}</span>
            {option.name}
          </button>
        ))}
        <button
          onClick={() => {/* Логика для выбора другого токена */}}
          className="w-full bg-[#232f3b] text-white py-4 rounded-2xl text-lg font-medium flex items-center px-4"
        >
          <span className="mr-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="#3390EC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          Выбрать другой токен
        </button>
      </div>
    </div>
  );
};

export default Deposit;