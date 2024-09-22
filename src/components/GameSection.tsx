// src/components/GameSection.tsx
import React from 'react';

interface GameSectionProps {
  game: any;
}

const GameSection: React.FC<GameSectionProps> = ({ game }) => {
  return (
    <section className="bg-white p-4 rounded-lg mb-4">
      <h2 className="text-xl font-semibold mb-4">Game #{game.id}</h2>
      <div className="mb-4">
        <p>Opponent: {game.opponent}</p>
        <p>Stake: {game.stake}</p>
        <p>Status: {game.status}</p>
      </div>
      {/* Здесь будет компонент колеса и кнопка для вращения */}
      <button className="bg-green-500 text-white px-4 py-2 rounded">Spin Wheel</button>
    </section>
  );
};

export default GameSection;