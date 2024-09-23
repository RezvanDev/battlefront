// src/components/Deposit.tsx
import React from 'react';

interface DepositOption {
  id: string;
  name: string;
  icon: string;
}

const depositOptions: DepositOption[] = [
  { 
    id: 'ton', 
    name: 'TON', 
    icon: '▼' // Используем символ треугольника вместо SVG
  },
  { 
    id: 'solana', 
    name: 'Solana', 
    icon: '◆' // Используем символ ромба вместо SVG
  },
];

const Deposit: React.FC = () => {
  const handleDeposit = (optionId: string) => {
    console.log(`Depositing with ${optionId}`);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4 justify-center ">
      <div className="space-y-4">
        {depositOptions.map((option, index) => (
          <button
            key={option.id}
            onClick={() => handleDeposit(option.id)}
            className={`w-full py-4 rounded-2xl text-lg font-medium flex items-center justify-between px-4 ${
              index === 0 ? 'bg-blue-500 text-white' : 'bg-white text-black'
            }`}
          >
            <span className="flex items-center">
              <span className="mr-3 text-2xl">{option.icon}</span>
              {option.name}
            </span>
            <span className="text-2xl">&gt;</span>
          </button>
        ))}
        <button
          onClick={() => {}}
          className="w-full bg-gray-800 text-white py-4 rounded-2xl text-lg font-medium flex items-center justify-between px-4"
        >
          <span className="flex items-center">
            <span className="mr-3 text-blue-500 text-2xl">★</span>
            Выбрать другой токен
          </span>
          <span className="text-2xl">&gt;</span>
        </button>
      </div>
    </div>
  );
};

export default Deposit;