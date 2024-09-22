// src/components/Deposit.tsx
import React from 'react';


interface DepositOption {
  id: string;
  name: string;
  icon: string;
}

const depositOptions: DepositOption[] = [
  { id: 'ton', name: 'TON', icon: '💎' },
  { id: 'solana', name: 'Solana', icon: '◎' },
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
          <span className="mr-3">⭐</span>
          Выбрать другой токен
        </button>
      </div>
    </div>
  );
};

export default Deposit;