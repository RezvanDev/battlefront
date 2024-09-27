import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://8d48-202-79-184-241.ngrok-free.app/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
  withCredentials: true,
});

export const createGame = async (telegramId: string, bet: number) => {
  try {
    const response = await api.post(`/game/${telegramId}/create`, { bet });
    return response.data;
  } catch (error) {
    console.error('Ошибка при создании игры:', error);
    throw error;
  }
};

export const joinGame = async (telegramId: string, lobbyCode: string) => {
  try {
    const response = await api.post(`/game/${telegramId}/join`, { lobbyCode });
    return response.data;
  } catch (error) {
    console.error('Ошибка при присоединении к игре:', error);
    throw error;
  }
};

export const getGameStatus = async (lobbyCode: string) => {
  try {
    const response = await api.get(`/game/${lobbyCode}/status`);
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении статуса игры:', error);
    throw error;
  }
};

export const chooseColor = async (telegramId: string, lobbyCode: string, selectedColor: 'red' | 'black') => {
  try {
    const response = await api.post(`/game/${telegramId}/${lobbyCode}/choose-color`, { selectedColor });
    return response.data;
  } catch (error) {
    console.error('Ошибка при выборе цвета:', error);
    throw error;
  }
};

export const getBalance = async (telegramId: string) => {
  try {
    const response = await api.get(`/users/${telegramId}/balance`);
    return response.data;
  } catch (error) {
    console.error('Ошибка при загрузке баланса:', error);
    throw error;
  }
};

export default api;