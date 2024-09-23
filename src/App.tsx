import React from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import Home from './components/Home';
import Deposit from './components/Deposit';
import InviteGame from './components/InviteGame';
import JoinGame from './components/JoinGame';
import WaitingRoom from './components/WaitingRoom';
import Game from './components/Game';

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

const AppContent: React.FC = () => {
  const navigate = useNavigate();

  const handleDeposit = () => {
    navigate('/deposit');
  };

  return (
    <Routes>
      <Route path="/" element={<Home initialBalance={10000} onDeposit={handleDeposit} />} />
      <Route path="/deposit" element={<Deposit />} />
      <Route path="/invite-game" element={<InviteGame />} />
      <Route path="/join-game" element={<JoinGame />} />
      <Route path="/waiting-room/:lobbyCode" element={<WaitingRoom />} />
      <Route path="/game/:lobbyCode" element={<Game />} />
    </Routes>
  );
};

export default App;