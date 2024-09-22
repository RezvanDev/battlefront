// src/components/Footer.tsx
import React from 'react';

const Footer: React.FC = () => {
  const handleDeposit = () => {
    // Здесь будет логика для депозита
  };

  const handleWithdraw = () => {
    // Здесь будет логика для вывода средств
  };

  return (
    <footer className="mt-auto pt-4">
      <div className="flex justify-around">
        <button 
          onClick={handleDeposit}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Deposit
        </button>
        <button 
          onClick={handleWithdraw}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Withdraw
        </button>
      </div>
    </footer>
  );
};

export default Footer;