// src/App.tsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import Home from './components/Home';
import Deposit from './components/Deposit';

const App: React.FC = () => {
  const [balance, setBalance] = useState(10000); // Начальный баланс

  const AppContent: React.FC = () => {
    const navigate = useNavigate();

    const handleDeposit = () => {
      navigate('/deposit');
    };

    return (
      <Routes>
        <Route path="/" element={<Home balance={balance} onDeposit={handleDeposit} />} />
        <Route path="/deposit" element={<Deposit />} />
      </Routes>
    );
  };

  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;