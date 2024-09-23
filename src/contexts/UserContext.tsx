import React, { createContext, useState, useContext, useEffect } from 'react';
import apiClient from '../api/apiClient';

interface User {
  id: number;
  telegramId: number;
  firstName: string;
  lastName: string;
  username: string;
  balance: number;
}

interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  loading: boolean;
  error: string | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

declare global {
  interface Window {
    Telegram: {
      WebApp: {
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
          };
        };
      };
    };
  }
}

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const initData = window.Telegram?.WebApp?.initData;
        const initDataUnsafe = window.Telegram?.WebApp?.initDataUnsafe;
        
        if (!initData || !initDataUnsafe.user) {
          throw new Error('Telegram WebApp data not found');
        }

        const response = await apiClient.post('/auth/telegram', { 
          initData,
          user: initDataUnsafe.user
        });

        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user:', error);
        setError('Failed to authenticate user');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading, error }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};