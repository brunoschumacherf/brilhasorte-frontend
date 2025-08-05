export interface User {
  id: number;
  email: string;
  full_name: string | null;
  cpf: string | null;
  birth_date: string | null;
  phone_number: string | null;
  balance_in_cents: number;
  created_at: string;
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

// NOVO TIPO: Item da lista de ranking
export interface RankingItem {
  full_name: string;
  total_winnings: number;
}

// Tipos genéricos para a resposta da API JSON:API
export interface JsonApiData<T> {
  id: string;
  type: string;
  attributes: T;
}

export interface JsonApiCollection<T> {
  data: JsonApiData<T>[];
}

export interface JsonApiSingular<T> {
  data: JsonApiData<T>;
}