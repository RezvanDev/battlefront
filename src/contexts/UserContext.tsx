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
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const fetchUser = async () => {
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const response = await apiClient.get('/users/me');
            setUser(response.data);
          } catch (error) {
            console.error('Error fetching user:', error);
            localStorage.removeItem('token');
          }
        }
        setLoading(false);
      };
  
      fetchUser();
    }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
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