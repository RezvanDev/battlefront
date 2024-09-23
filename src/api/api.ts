// src/api/api.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const createGame = async (telegramId: string, bet: number) => {
    const response = await api.post(`/game/${telegramId}/create`, { bet });
    return response.data;
  };

export const joinGame = async (telegramId: string, lobbyCode: string) => {
  const response = await api.post(`/game/${telegramId}/join`, { lobbyCode });
  return response.data;
};

export const getGameStatus = async (lobbyCode: string) => {
  const response = await api.get(`/game/${lobbyCode}/status`);
  return response.data;
};

export const spinWheel = async (telegramId: string, lobbyCode: string, bet: number) => {
  const response = await api.post(`/game/${telegramId}/${lobbyCode}/spin`, { bet });
  return response.data;
};

export const getBalance = async (telegramId: string) => {
  const response = await api.get(`/users/${telegramId}/balance`);
  return response.data;
};

export const updateBalance = async (telegramId: string, amount: number, operation: 'add' | 'subtract') => {
  const response = await api.post(`/users/${telegramId}/balance`, null, {
    params: { amount, operation }
  });
  return response.data;
};

export default api;