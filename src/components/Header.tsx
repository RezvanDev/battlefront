// src/components/Header.tsx
import React from 'react';

interface HeaderProps {
  user: any;
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  return (
    <header className="bg-blue-600 text-white p-4 rounded-lg mb-4">
      <h1 className="text-2xl font-bold">Battle Wheel</h1>
      {user && (
        <div className="mt-2">
          <span className="font-semibold">{user.username}</span>
          {/* Здесь мы можем добавить баланс пользователя, когда у нас будет эта информация */}
        </div>
      )}
    </header>
  );
};

export default Header;