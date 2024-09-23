import apiClient from './apiClient';

export const createGame = async (creatorId: number, bet: number) => {
  try {
    const response = await apiClient.post('/games', { creatorId, bet });
    return response.data;
  } catch (error) {
    console.error('Error creating game:', error);
    throw error;
  }
};

export const joinGame = async (gameId: string, playerId: number) => {
  try {
    const response = await apiClient.post(`/games/${gameId}/join`, { playerId });
    return response.data;
  } catch (error) {
    console.error('Error joining game:', error);
    throw error;
  }
};

export const spinWheel = async (gameId: string, playerId: number, color: 'red' | 'black') => {
  try {
    const response = await apiClient.post(`/games/${gameId}/spin`, { playerId, color });
    return response.data;
  } catch (error) {
    console.error('Error spinning wheel:', error);
    throw error;
  }
};

export const finishRound = async (gameId: string, winnerId: number) => {
  try {
    const response = await apiClient.post(`/games/${gameId}/finish-round`, { winnerId });
    return response.data;
  } catch (error) {
    console.error('Error finishing round:', error);
    throw error;
  }
};

export const finishGame = async (gameId: string) => {
  try {
    const response = await apiClient.post(`/games/${gameId}/finish`);
    return response.data;
  } catch (error) {
    console.error('Error finishing game:', error);
    throw error;
  }
};