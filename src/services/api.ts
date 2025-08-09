import axios from 'axios';
import type {
  User,
  ScratchCard,
  DepositResponse,
  DepositHistoryItem,
  WithdrawalRequest,
  WithdrawalHistoryItem,
  RankingItem,
  Referee,
  GameHistoryItem,
  JsonApiSingular,
  JsonApiCollection,
  AdminDashboardStats,
  Game,
  AdminUserListItem,
  AdminDepositListItem,
  AdminWithdrawalListItem,
  AdminGameListItem,
  AdminBonusCode,
  AdminScratchCard,
  Ticket,
  TicketReply,
  MinesGame,
  AdminMinesGameListItem,
  PlinkoGame
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

// ... (funções existentes de auth, profile, scratch_cards)
export const login = (userData: UserLogin) => api.post('/login', { user: userData });
export const register = (userData: UserRegister) => api.post('/signup', { user: userData });
export const logout = () => api.delete('/logout');

export const getProfile = () => api.get<JsonApiSingular<User>>('/api/v1/profile');
export const updateProfile = (profileData: Partial<User>) => api.patch<JsonApiSingular<User>>('/api/v1/profile', { user: profileData });

export const getScratchCards = () => api.get<JsonApiCollection<ScratchCard>>('/api/v1/scratch_cards');


// Jogos
export const createGame = (scratchCardId: string) => api.post('/api/v1/games', { scratch_card_id: scratchCardId });
export const revealGame = (gameId: string) => api.post(`/api/v1/games/${gameId}/reveal`);
// NOVA FUNÇÃO: Histórico de Jogos
export const getGameHistory = () => api.get<JsonApiCollection<GameHistoryItem>>('/api/v1/games');
export const getGameDetails = (gameId: string) => api.get<JsonApiSingular<Game>>(`/api/v1/games/${gameId}`); // NOVA FUNÇÃO


// Depósito
export const createDeposit = (data: { amount_in_cents: number; bonus_code?: string }) => 
  api.post<JsonApiSingular<DepositResponse>>('/api/v1/deposits', { deposit: data });

export const getDepositHistory = () => api.get<JsonApiCollection<DepositHistoryItem>>('/api/v1/deposits');

// Saque
export const createWithdrawal = (withdrawalData: WithdrawalRequest) => 
  api.post('/api/v1/withdrawals', { withdrawal: withdrawalData });
export const getWithdrawalHistory = () => api.get<JsonApiCollection<WithdrawalHistoryItem>>('/api/v1/withdrawals');

// Rankings
export type RankingPeriod = 'daily' | 'weekly' | 'monthly' | 'all_time';
export const getRankings = (period: RankingPeriod) => 
  api.get<{ period: string; ranking: RankingItem[] }>(`/api/v1/rankings?period=${period}`);

// Afiliados/Referências
export const getReferrals = () => api.get<JsonApiCollection<Referee>>('/api/v1/referrals');


export const getAdminDashboardStats = (period: RankingPeriod) =>
  api.get<{ period: string; statistics: AdminDashboardStats }>(`/api/v1/admin/dashboard?period=${period}`);

export const playFreeDailyGame = () => api.post<JsonApiSingular<Game>>('/api/v1/games/play_free_daily');

export const requestPasswordReset = (email: string) => 
  api.post('/password', { user: { email } });

export const resetPassword = (password: string, password_confirmation: string, reset_password_token: string) => 
  api.put('/password', { 
    user: { password, password_confirmation, reset_password_token } 
  });

export const getAdminUserList = () => api.get<JsonApiCollection<AdminUserListItem>>('/api/v1/admin/users');

export const getAdminDepositList = () => api.get<JsonApiCollection<AdminDepositListItem>>('/api/v1/admin/deposits');

export const getAdminWithdrawalList = () => api.get<JsonApiCollection<AdminWithdrawalListItem>>('/api/v1/admin/withdrawals');

export const getAdminGameList = () => api.get<JsonApiCollection<AdminGameListItem>>('/api/v1/admin/games');

export const getAdminBonusCodeList = () => api.get<JsonApiCollection<AdminBonusCode>>('/api/v1/admin/bonus_codes');
export const createAdminBonusCode = (data: Partial<AdminBonusCode>) => 
  api.post<JsonApiSingular<AdminBonusCode>>('/api/v1/admin/bonus_codes', { bonus_code: data });
export const updateAdminBonusCode = (id: number, data: Partial<AdminBonusCode>) => 
  api.put<JsonApiSingular<AdminBonusCode>>(`/api/v1/admin/bonus_codes/${id}`, { bonus_code: data });


export const getAdminScratchCardList = () => api.get<JsonApiCollection<AdminScratchCard>>('/api/v1/admin/scratch_cards');
export const createAdminScratchCard = (data: any) => 
  api.post<JsonApiSingular<AdminScratchCard>>('/api/v1/admin/scratch_cards', { scratch_card: data });
export const updateAdminScratchCard = (id: number, data: any) => 
  api.patch<JsonApiSingular<AdminScratchCard>>(`/api/v1/admin/scratch_cards/${id}`, { scratch_card: data });
export const getAdminScratchCardDetails = (id: number) => api.get<JsonApiSingular<AdminScratchCard>>(`/api/v1/admin/scratch_cards/${id}`);



export const getTickets = () => api.get<JsonApiCollection<Ticket>>('/api/v1/tickets');
export const getTicketDetails = (ticketNumber: string) => api.get<JsonApiSingular<Ticket>>(`/api/v1/tickets/${ticketNumber}`);
export const createTicket = (data: { subject: string, message: string }) => api.post<JsonApiSingular<Ticket>>('/api/v1/tickets', { ticket: data });
export const createTicketReply = (ticketNumber: string, message: string) => api.post<JsonApiSingular<TicketReply>>(`/api/v1/tickets/${ticketNumber}/reply`, { reply: { message } });

export const getAdminTickets = () => api.get<JsonApiCollection<Ticket>>('/api/v1/admin/tickets');
export const getAdminTicketDetails = (ticketNumber: string) => api.get<JsonApiSingular<Ticket>>(`/api/v1/admin/tickets/${ticketNumber}`);
export const createAdminTicketReply = (ticketNumber: string, message: string, close_ticket: boolean) => api.post<JsonApiSingular<TicketReply>>(`/api/v1/admin/tickets/${ticketNumber}/reply`, { reply: { message, close_ticket } });

interface StartGamePayload {
  bet_amount: number;
  mines_count: number;
}

interface RevealTilePayload {
  row: number;
  col: number;
}

interface RevealResponse {
  status: 'safe' | 'game_over';
  game: MinesGame;
}

interface CashoutResponse {
  status: 'cashed_out';
  winnings: number;
  game: MinesGame;
}


export const startGame = (data: StartGamePayload): Promise<{ data: MinesGame }> => {
  return api.post('/api/v1/mines', data);
};

export const revealTile = (data: RevealTilePayload): Promise<{ data: RevealResponse }> => {
  return api.post('/api/v1/mines/reveal', data);
};

export const cashout = (): Promise<{ data: CashoutResponse }> => {
  return api.post('/api/v1/mines/cashout');
};

export const getActiveGame = (): Promise<{ data: MinesGame }> => {
  return api.get('/api/v1/mines/active');
};


export const getAdminMinesGameList = () => api.get<JsonApiCollection<AdminMinesGameListItem>>('/api/v1/admin/mines_games');


interface PlinkoPayload {
  bet_amount: number;
  rows: number;
  risk: 'low' | 'medium' | 'high';
}

// Adicione esta função junto com as outras funções de jogos
export const playPlinko = (data: PlinkoPayload): Promise<{ data: PlinkoGame }> => {
  return api.post('/api/v1/plinko', data);
};

export const getPlinkoMultipliers = (): Promise<{ data: any }> => {
  return api.get('/api/v1/plinko/multipliers');
};



export default api;