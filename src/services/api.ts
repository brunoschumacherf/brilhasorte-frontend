import axios from 'axios';
import type {
  User,
  ScratchCard,
  DepositResponse,
  DepositHistoryItem,
  WithdrawalRequest,
  WithdrawalHistoryItem,
  JsonApiSingular,
  JsonApiCollection
} from '../types';

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

type UserLogin = Pick<User, 'email'> & { password: any };
type UserRegister = Omit<User, 'id' | 'balance_in_cents' | 'created_at'> & { password: any, password_confirmation: any };

export const login = (userData: UserLogin) => api.post('/login', { user: userData });
export const register = (userData: UserRegister) => api.post('/signup', { user: userData });
export const logout = () => api.delete('/logout');

export const getProfile = () => api.get<JsonApiSingular<User>>('/api/v1/profile');
export const updateProfile = (profileData: Partial<User>) => api.patch<JsonApiSingular<User>>('/api/v1/profile', { user: profileData });

export const getScratchCards = () => api.get<JsonApiCollection<ScratchCard>>('/api/v1/scratch_cards');

export const createGame = (scratchCardId: string) => api.post('/api/v1/games', { scratch_card_id: scratchCardId });
export const revealGame = (gameId: string) => api.post(`/api/v1/games/${gameId}/reveal`);

export const createDeposit = (amount_in_cents: number) => 
  api.post<JsonApiSingular<DepositResponse>>('/api/v1/deposits', { 
    deposit: { amount_in_cents } 
  });
export const getDepositHistory = () => api.get<JsonApiCollection<DepositHistoryItem>>('/api/v1/deposits');

export const createWithdrawal = (withdrawalData: WithdrawalRequest) => 
  api.post('/api/v1/withdrawals', { withdrawal: withdrawalData });
export const getWithdrawalHistory = () => api.get<JsonApiCollection<WithdrawalHistoryItem>>('/api/v1/withdrawals');


export default api;