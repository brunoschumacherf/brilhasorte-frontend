export interface User {
  id: number;
  email: string;
  full_name: string | null;
  cpf: string | null;
  birth_date: string | null;
  phone_number: string | null;
  balance_in_cents: number;
  created_at: string;
  referral_code?: string;
  admin: boolean;
  can_claim_daily_game?: boolean;
}

export interface AdminUserListItem {
    id: number;
    email: string;
    full_name: string | null;
    balance_in_cents: number;
    created_at: string;
    games_count: number;
    deposits_count: number;
}

export interface AdminDepositListItem {
  id: number;
  amount_in_cents: number;
  bonus_in_cents: number;
  status: 'pending' | 'completed' | 'error';
  created_at: string;
  user: {
    id: number;
    full_name: string | null;
    email: string;
  };
}

export interface AdminWithdrawalListItem {
  id: number;
  amount_in_cents: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  pix_key_type: string;
  pix_key: string;
  created_at: string;
  user: {
    id: number;
    full_name: string | null;
    email: string;
  };
}

export interface AdminGameListItem {
  id: number;
  status: 'pending' | 'finished';
  winnings_in_cents: number;
  created_at: string;
  user: {
    id: number;
    full_name: string | null;
  };
  prize: {
    id: number;
    name: string;
  };
  scratch_card: {
    id: number;
    name: string;
  };
}

export interface AdminBonusCode {
  id: number;
  code: string;
  bonus_percentage: number;
  expires_at: string | null;
  max_uses: number;
  uses_count: number;
  is_active: boolean;
  created_at: string;
}

export interface AdminPrize {
  id?: number;
  name: string;
  value_in_cents: number;
  probability: number;
  stock: number;
  image_url?: string | null;
  _destroy?: boolean;
}

export interface AdminScratchCard {
  id: number;
  name: string;
  price_in_cents: number;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  prizes: AdminPrize[];
}

export interface ScratchCard {
  id: number;
  name: string;
  price_in_cents: number;
  description: string | null;
  image_url: string | null;
}

export interface DepositResponse {
  id: string;
  amount_in_cents: number;
  status: 'pending' | 'completed' | 'error';
  created_at: string;
  pix_qr_code_payload: string;
  pix_qr_code_image_base64: string;
}

export interface DepositHistoryItem {
    id: number;
    amount_in_cents: number;
    status: 'pending' | 'completed' | 'error';
    created_at: string;
}

export interface WithdrawalRequest {
  amount_in_cents: number;
  pix_key_type: string;
  pix_key: string;
}

export interface WithdrawalHistoryItem {
  id: number;
  amount_in_cents: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  pix_key_type: string;
  pix_key: string;
  created_at: string;
}

export interface RankingItem {
  full_name: string;
  total_winnings: number;
}

export interface Referee {
  id: number;
  full_name: string | null;
  created_at: string;
  has_deposited: boolean;
}

export interface GameHistoryItem {
  id: number;
  winnings_in_cents: number;
  created_at: string;
  prize: { name: string };
  scratch_card: { name: string };
}

// Tipo atualizado para o prêmio
export interface PrizeAttributes {
  id: number;
  name: string;
  value_in_cents: number;
  image_url: string | null;
  probability: number;
}

// Tipo atualizado para o jogo, incluindo a lista de prêmios
export interface Game {
  status: string;
  scratch_card_prize: boolean;
  id: string;
  type: 'game';
  attributes: {
    id: number;
    status: 'pending' | 'finished';
    game_hash: string;
    created_at: string;
    winnings_in_cents: number;
    scratch_card_prize?: PrizeAttributes[]; // Lista de prêmios possíveis
  };
}

export interface AdminDashboardStats {
  total_deposited_in_cents: number;
  total_won_in_cents: number;
  total_spent_on_games_in_cents: number;
  gross_gaming_revenue_in_cents: number;
  new_users: number;
  total_users: number;
  games_played: number;
}

export interface JsonApiData<T> {
  id: string;
  type: string;
  attributes: T;
  relationships?: any;
}

export interface JsonApiCollection<T, I = any> {
  data: JsonApiData<T>[];
  included?: JsonApiData<I>[];
}

export interface JsonApiSingular<T> {
  included: never[];
  data: JsonApiData<T>;
}