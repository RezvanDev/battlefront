import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://da05-185-213-230-172.ngrok-free.app/api';

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
    console.log('Игра создана:', response.data);
    return response.data;
  } catch (error) {
    console.error('Ошибка при создании игры:', error);
    throw error;
  }
};

export const joinGame = async (telegramId: string, lobbyCode: string) => {
  console.log(`Попытка присоединиться к игре. TelegramId: ${telegramId}, LobbyCode: ${lobbyCode}`);
  try {
    const response = await api.post(`/game/${telegramId}/join`, { lobbyCode });
    console.log('Ответ сервера при присоединении к игре:', response.data);
    return response.data;
  } catch (error) {
    console.error('Ошибка при присоединении к игре:', error);
    throw error;
  }
};

export const chooseColor = async (telegramId: string, lobbyCode: string, selectedColor: 'red' | 'black') => {
  try {
    const response = await api.post(`/game/${telegramId}/${lobbyCode}/choose-color`, { selectedColor });
    console.log('Цвет выбран:', response.data);
    return response.data;
  } catch (error) {
    console.error('Ошибка при выборе цвета:', error);
    throw error;
  }
};

export const spinWheel = async (telegramId: string, lobbyCode: string) => {
  try {
    const response = await api.post(`/game/${telegramId}/${lobbyCode}/spin`);
    console.log('Колесо провернуто:', response.data);
    return response.data;
  } catch (error) {
    console.error('Ошибка при вращении колеса:', error);
    throw error;
  }
};

export const getGameStatus = async (lobbyCode: string) => {
  try {
    const response = await api.get(`/game/${lobbyCode}/status`);
    console.log('Статус игры получен:', response.data);
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении статуса игры:', error);
    throw error;
  }
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
  try {
    const response = await api.post(`/users/${telegramId}/balance`, null, {
      params: { amount, operation }
    });
    console.log('Баланс обновлен:', response.data);
    return response.data;
  } catch (error) {
    console.error('Ошибка при обновлении баланса:', error);
    throw error;
  }
};

export default api;