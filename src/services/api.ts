import axios from 'axios';
import type { AxiosResponse } from 'axios'; 

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
  AdminMinesGameListItem,
  PlinkoGame,
  AdminPlinkoGameListItem,
  GameApiResponse,
  RevealApiResponse,
  CashoutApiResponse,
  TowerGame,
  LimboGame,
  DoubleGameRound
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

// --- Autenticação e Perfil ---
export const login = (userData: UserLogin) => api.post('/login', { user: userData });
export const register = (userData: UserRegister) => api.post('/signup', { user: userData });
export const logout = () => api.delete('/logout');
export const requestPasswordReset = (email: string) => api.post('/password', { user: { email } });
export const resetPassword = (password: string, password_confirmation: string, reset_password_token: string) => 
  api.put('/password', { user: { password, password_confirmation, reset_password_token } });

export const getProfile = () => api.get<JsonApiSingular<User>>('/api/v1/profile');
export const updateProfile = (profileData: Partial<User>) => api.patch<JsonApiSingular<User>>('/api/v1/profile', { user: profileData });

// --- Jogos (Usuário) ---
export const getScratchCards = () => api.get<JsonApiCollection<ScratchCard>>('/api/v1/scratch_cards');
export const createGame = (scratchCardId: string) => api.post('/api/v1/games', { scratch_card_id: scratchCardId });
export const revealGame = (gameId: string) => api.post(`/api/v1/games/${gameId}/reveal`);
export const getGameHistory = () => api.get<JsonApiCollection<GameHistoryItem>>('/api/v1/games');
export const getGameDetails = (gameId: string) => api.get<JsonApiSingular<Game>>(`/api/v1/games/${gameId}`);
export const playFreeDailyGame = () => api.post<JsonApiSingular<Game>>('/api/v1/games/play_free_daily');

// --- Depósito e Saque ---
export const createDeposit = (data: { amount_in_cents: number; bonus_code?: string }) => 
  api.post<JsonApiSingular<DepositResponse>>('/api/v1/deposits', { deposit: data });
export const getDepositHistory = () => api.get<JsonApiCollection<DepositHistoryItem>>('/api/v1/deposits');
export const createWithdrawal = (withdrawalData: WithdrawalRequest) => 
  api.post('/api/v1/withdrawals', { withdrawal: withdrawalData });
export const getWithdrawalHistory = () => api.get<JsonApiCollection<WithdrawalHistoryItem>>('/api/v1/withdrawals');

// --- Social e Outros ---
export type RankingPeriod = 'daily' | 'weekly' | 'monthly' | 'all_time';
export const getRankings = (period: RankingPeriod) => 
  api.get<{ period: string; ranking: RankingItem[] }>(`/api/v1/rankings?period=${period}`);
export const getReferrals = () => api.get<JsonApiCollection<Referee>>('/api/v1/referrals');

// --- Tickets de Suporte ---
export const getTickets = () => api.get<JsonApiCollection<Ticket>>('/api/v1/tickets');
export const getTicketDetails = (ticketNumber: string) => api.get<JsonApiSingular<Ticket>>(`/api/v1/tickets/${ticketNumber}`);
export const createTicket = (data: { subject: string, message: string }) => api.post<JsonApiSingular<Ticket>>('/api/v1/tickets', { ticket: data });
export const createTicketReply = (ticketNumber: string, message: string) => api.post<JsonApiSingular<TicketReply>>(`/api/v1/tickets/${ticketNumber}/reply`, { reply: { message } });

// --- Jogo Mines ---
interface StartGamePayload { bet_amount: number; mines_count: number; }
interface RevealTilePayload { row: number; col: number; }


export const startGame = (data: StartGamePayload): Promise<AxiosResponse<GameApiResponse>> => 
  api.post('/api/v1/mines', data);

export const revealTile = (data: RevealTilePayload): Promise<AxiosResponse<RevealApiResponse>> => 
  api.post('/api/v1/mines/reveal', data);

export const cashout = (): Promise<AxiosResponse<CashoutApiResponse>> => 
  api.post('/api/v1/mines/cashout');

export const getActiveGame = (): Promise<AxiosResponse<GameApiResponse>> => 
  api.get('/api/v1/mines/active');

// --- Jogo Plinko ---
interface PlinkoPayload { bet_amount: number; rows: number; risk: 'low' | 'medium' | 'high'; }
export const playPlinko = (data: PlinkoPayload): Promise<{ data: PlinkoGame }> => api.post('/api/v1/plinko', data);
export const getPlinkoMultipliers = (): Promise<{ data: any }> => api.get('/api/v1/plinko/multipliers');


// -----------------------------------------------------------------------------
// --- PAINEL DE ADMINISTRAÇÃO ---
// -----------------------------------------------------------------------------

export const getAdminDashboardStats = (period: RankingPeriod) =>
  api.get<{ period: string; statistics: AdminDashboardStats }>(`/api/v1/admin/dashboard?period=${period}`);

// --- Listagens com Paginação ---
export const getAdminUserList = (page = 1) => api.get<JsonApiCollection<AdminUserListItem>>(`/api/v1/admin/users?page=${page}`);
export const getAdminDepositList = (page = 1) => api.get<JsonApiCollection<AdminDepositListItem>>(`/api/v1/admin/deposits?page=${page}`);
export const getAdminWithdrawalList = (page = 1) => api.get<JsonApiCollection<AdminWithdrawalListItem>>(`/api/v1/admin/withdrawals?page=${page}`);
export const getAdminGameList = (page = 1) => api.get<JsonApiCollection<AdminGameListItem>>(`/api/v1/admin/games?page=${page}`);
export const getAdminMinesGameList = (page = 1) => api.get<JsonApiCollection<AdminMinesGameListItem>>(`/api/v1/admin/mines_games?page=${page}`);
export const getAdminPlinkoGameList = (page = 1) => api.get<JsonApiCollection<AdminPlinkoGameListItem>>(`/api/v1/admin/plinko_games?page=${page}`);
export const getAdminBonusCodeList = (page = 1) => api.get<JsonApiCollection<AdminBonusCode>>(`/api/v1/admin/bonus_codes?page=${page}`);
export const getAdminScratchCardList = (page = 1) => api.get<JsonApiCollection<AdminScratchCard>>(`/api/v1/admin/scratch_cards?page=${page}`);
export const getAdminTickets = (page = 1) => api.get<JsonApiCollection<Ticket>>(`/api/v1/admin/tickets?page=${page}`);

// --- Códigos de Bônus ---
export const createAdminBonusCode = (data: Partial<AdminBonusCode>) => 
  api.post<JsonApiSingular<AdminBonusCode>>('/api/v1/admin/bonus_codes', { bonus_code: data });
export const updateAdminBonusCode = (id: number, data: Partial<AdminBonusCode>) => 
  api.put<JsonApiSingular<AdminBonusCode>>(`/api/v1/admin/bonus_codes/${id}`, { bonus_code: data });

// --- Raspadinhas ---
export const createAdminScratchCard = (data: any) => 
  api.post<JsonApiSingular<AdminScratchCard>>('/api/v1/admin/scratch_cards', { scratch_card: data });
export const updateAdminScratchCard = (id: number, data: any) => 
  api.patch<JsonApiSingular<AdminScratchCard>>(`/api/v1/admin/scratch_cards/${id}`, { scratch_card: data });
export const getAdminScratchCardDetails = (id: number) => api.get<JsonApiSingular<AdminScratchCard>>(`/api/v1/admin/scratch_cards/${id}`);

// --- Tickets de Suporte (Admin) ---
export const getAdminTicketDetails = (ticketNumber: string) => api.get<JsonApiSingular<Ticket>>(`/api/v1/admin/tickets/${ticketNumber}`);
export const createAdminTicketReply = (ticketNumber: string, message: string, close_ticket: boolean) => 
  api.post<JsonApiSingular<TicketReply>>(`/api/v1/admin/tickets/${ticketNumber}/reply`, { reply: { message, close_ticket } });


export const approveAdminWithdrawal = (withdrawalId: string) =>
  api.patch(`/api/v1/admin/withdrawals/${withdrawalId}/approve`);


export const createTowerGame = (difficulty: string, bet_amount_in_cents: number) =>
  api.post<JsonApiSingular<TowerGame>>('/api/v1/tower_games', {
    tower_game: { difficulty, bet_amount_in_cents },
  });

export const playTowerGame = (gameId: number, choice_index: number) =>
  api.post<JsonApiSingular<TowerGame>>(`/api/v1/tower_games/${gameId}/play`, { choice_index });

export const cashOutTowerGame = (gameId: number) =>
  api.post<JsonApiSingular<TowerGame>>(`/api/v1/tower_games/${gameId}/cash_out`);

export const getActiveTowerGame = () =>
  api.get<JsonApiSingular<TowerGame>>('/api/v1/tower_games/active_game');

export const getTowerGameConfig = () => api.get('/api/v1/game_settings/tower');

export const playGameLimbo = (bet_amount_in_cents: number, target_multiplier: number) =>
  api.post<JsonApiSingular<LimboGame>>('/api/v1/limbo_games', {
    limbo_game: { bet_amount_in_cents, target_multiplier },
  });

export const placeDoubleBet = (bet_amount_in_cents: number, color: 'black' | 'red' | 'white') =>
  api.post('/api/v1/double_games/place_bet', { bet_amount_in_cents, color });

export const triggerDoubleDraw = () => api.post('/api/v1/double_games/trigger_draw');

export const getLimboHistory = () =>
  api.get<JsonApiCollection<LimboGame>>('/api/v1/limbo_games/history');

export const getDoubleHistory = () => api.get<JsonApiCollection<DoubleGameRound>>('/api/v1/double_games/history');

export const getAdminTowerGames = (page = 1) => api.get<JsonApiCollection<TowerGame>>(`/api/v1/admin/tower_games?page=${page}`);
export const getAdminLimboGames = (page = 1) => api.get<JsonApiCollection<LimboGame>>(`api/v1/admin/limbo_games?page=${page}`);
export const getAdminDoubleGames = (page = 1) => api.get<JsonApiCollection<DoubleGameRound>>(`/api/v1/admin/double_games?page=${page}`);

export default api;