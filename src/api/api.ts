import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://9aeb-185-213-229-168.ngrok-free.app/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
  withCredentials: true,
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

export const spinWheel = async (telegramId: string, lobbyCode: string) => {
  const response = await api.post(`/game/${telegramId}/${lobbyCode}/spin`);
  return response.data;
};

export const chooseColor = async (telegramId: string, lobbyCode: string, selectedColor: 'red' | 'black') => {
  const response = await api.post(`/game/${telegramId}/${lobbyCode}/choose-color`, { selectedColor });
  return response.data;
};

export const getBalance = async (telegramId: string) => {
  const response = await api.get(`/users/${telegramId}/balance`);
  return response.data;
};

export default api;