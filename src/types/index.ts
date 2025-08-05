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
}

export interface ScratchCard {
  id: string;
  type: 'scratch_card';
  attributes: {
    id: number;
    name: string;
    price_in_cents: number;
    description: string | null;
    image_url: string | null;
  };
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

// NOVO TIPO: Item do histórico de jogos
export interface GameHistoryItem {
  id: number;
  winnings_in_cents: number;
  created_at: string;
  // A API aninha os dados do prêmio e da raspadinha dentro do histórico
  prize: { name: string };
  scratch_card: { name: string };
}


// Tipos genéricos para a resposta da API JSON:API
export interface JsonApiData<T> {
  id: string;
  type: string;
  attributes: T;
  // Adicionando relationships para o histórico de jogos
  relationships?: {
    prize: { data: { id: string, type: 'prize' } };
    scratch_card: { data: { id: string, type: 'scratch_card' } };
  };
}

export interface JsonApiCollection<T, I = any> {
  data: JsonApiData<T>[];
  included?: JsonApiData<I>[];
}

export interface JsonApiSingular<T> {
  data: JsonApiData<T>;
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