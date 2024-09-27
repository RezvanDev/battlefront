import React, { createContext, useContext, useState, useEffect } from 'react';

interface TelegramUser {
  id: number;
  username?: string;
}

interface TelegramContextType {
  tg: any;
  user: TelegramUser | null;
  isLoading: boolean;
}

const TelegramContext = createContext<TelegramContextType | undefined>(undefined);

export const TelegramProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tg, setTg] = useState<any>(null);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initTelegram = () => {
      const telegram = (window as any).Telegram?.WebApp;
      if (telegram) {
        setTg(telegram);
        if (telegram.initDataUnsafe?.user) {
          setUser({
            id: telegram.initDataUnsafe.user.id,
            username: telegram.initDataUnsafe.user.username,
          });
        } else {
          console.warn('Telegram user data not available');
          // Используем mock-данные, если реальные данные недоступны
          setUser({
            id: 12345,
            username: 'johndoe'
          });
        }
      } else {
        console.warn('Telegram WebApp not available');
        // Используем mock-данные, если Telegram WebApp недоступен
        setUser({
          id: 12345,
          username: 'johndoe'
        });
      }
      setIsLoading(false);
    };

    // Попытка инициализации через 1 секунду, если Telegram WebApp не загрузился сразу
    const timeoutId = setTimeout(initTelegram, 1000);
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <TelegramContext.Provider value={{ tg, user, isLoading }}>
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