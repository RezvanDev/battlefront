import React from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import Home from './components/Home';
import Deposit from './components/Deposit';
import InviteGame from './components/InviteGame';
import WaitingRoom from './components/WaitingRoom';
import Game from './components/Game';

const App: React.FC = () => {
  return (
    <UserProvider>
      <Router>
        <AppContent />
      </Router>
    </UserProvider>
  );
};

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const handleDeposit = () => {
    navigate('/deposit');
  };

  return (
    <Routes>
      <Route path="/" element={<Home onDeposit={handleDeposit} />} />
      <Route path="/deposit" element={<Deposit />} />
      <Route path="/invite-game" element={<InviteGame />} />
      <Route path="/waiting-room" element={<WaitingRoom />} />
      <Route path="/game" element={<Game />} />
      <Route path="/join/:gameId" element={<WaitingRoom />} />
    </Routes>
  );
};

export default App;