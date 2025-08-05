import axios from 'axios';
import type { User, ScratchCard, DepositResponse, JsonApiSingular, JsonApiCollection } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Tipos para os parâmetros das funções
type UserLogin = Pick<User, 'email'> & { password: any };
type UserRegister = Omit<User, 'id' | 'balance_in_cents' | 'created_at'> & { password: any, password_confirmation: any };

// Autenticação
export const login = (userData: UserLogin) => api.post('/login', { user: userData });
export const register = (userData: UserRegister) => api.post('/signup', { user: userData });
export const logout = () => api.delete('/logout');

// Perfil
export const getProfile = () => api.get<JsonApiSingular<User>>('/api/v1/profile');
export const updateProfile = (profileData: Partial<User>) => api.patch<JsonApiSingular<User>>('/api/v1/profile', { user: profileData });

// Raspadinhas
export const getScratchCards = () => api.get<JsonApiCollection<ScratchCard>>('/api/v1/scratch_cards');

// Jogos
export const createGame = (scratchCardId: string) => api.post('/api/v1/games', { scratch_card_id: scratchCardId });
export const revealGame = (gameId: string) => api.post(`/api/v1/games/${gameId}/reveal`);

// NOVA FUNÇÃO: Depósito
export const createDeposit = (amount_in_cents: number) => 
  api.post<JsonApiSingular<DepositResponse>>('/api/v1/deposits', { 
    deposit: { amount_in_cents } 
  });

export default api;