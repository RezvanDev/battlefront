import React, { createContext, useContext, useState, useEffect } from 'react';

export interface TelegramUser {
  id: number;
  username?: string;
}

interface TelegramContextType {
  tg: any;
  user: TelegramUser | null;
}

const TelegramContext = createContext<TelegramContextType | undefined>(undefined);

export const TelegramProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tg, setTg] = useState<any>(null);
  const [user, setUser] = useState<TelegramUser | null>(null);

  useEffect(() => {
    const telegram = (window as any).Telegram?.WebApp;
    if (telegram) {
      setTg(telegram);
      if (telegram.initDataUnsafe?.user) {
        setUser({
          id: telegram.initDataUnsafe.user.id,
          username: telegram.initDataUnsafe.user.username,
        });
      }
    }
  }, []);

  return (
    <TelegramContext.Provider value={{ tg, user }}>
      {children}
    </TelegramContext.Provider>
  );
};

export const useTelegram = () => {
  const context = useContext(TelegramContext);
  if (context === undefined) {
    throw new Error('useTelegram must be used within a TelegramProvider');
  }
  return context;
};