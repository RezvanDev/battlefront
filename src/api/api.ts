import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://c384-202-79-184-241.ngrok-free.app/api';

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

export const spinWheel = async (telegramId: string, lobbyCode: string, selectedColor: 'red' | 'black') => {
  const response = await api.post(`/game/${telegramId}/${lobbyCode}/spin`, { selectedColor });
  return response.data;
};

export const getBalance = async (telegramId: string) => {
  const url = `/users/${telegramId}/balance`;
  console.log(`Запрос баланса для пользователя ${telegramId}. URL: ${API_URL}${url}`);
  try {
    const response = await api.get(url);
    console.log('Ответ сервера:', response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Ошибка при загрузке баланса:', error.response?.data || error.message);
      console.error('Статус ошибки:', error.response?.status);
      console.error('Заголовки ответа:', error.response?.headers);
      return {
        success: false,
        error: error.response?.data?.error || 'Ошибка при загрузке баланса',
        status: error.response?.status,
      };
    }
    console.error('Неожиданная ошибка:', error);
    return { success: false, error: 'Неизвестная ошибка' };
  }
};

export const updateBalance = async (telegramId: string, amount: number, operation: 'add' | 'subtract') => {
  const response = await api.post(`/users/${telegramId}/balance`, null, {
    params: { amount, operation }
  });
  return response.data;
};

export default api;