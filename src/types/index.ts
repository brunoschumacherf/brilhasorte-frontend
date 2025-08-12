import type { Key, ReactNode } from "react";

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
    attributes: any;
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
  attributes: any;
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
  attributes: any;
  relationships: any;
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
  attributes: any;
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
  attributes: any;
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
  user_id: Key | null | undefined;
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
  [x: string]: any;
  id: number;
  winnings_in_cents: number;
  created_at: string;
  prize: { name: string };
  scratch_card: { name: string };
}

export interface PrizeAttributes {
  id: number;
  name: string;
  value_in_cents: number;
  image_url: string | null;
  probability: number;
}

export interface Game {
  scratch_card_prizes: any;
  scratch_card_rules: string;
  scratch_card_title: string;
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
    scratch_card_prize?: PrizeAttributes[];
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

export interface Ticket {
  id: number;
  ticket_number: string;
  subject: string;
  status: 'open' | 'client_reply' | 'admin_reply' | 'closed';
  created_at: string;
}

export interface TicketReply {
  id: number;
  message: string;
  created_at: string;
  user: {
    id: number | undefined;
    admin: any;
    full_name: string;
  };
}


export interface RevealedTile {
  row: number;
  col: number;
}


export interface MinesGame {
  data(data: any): unknown;
  id: number;
  bet_amount: number;
  mines_count: number;
  state: 'active' | 'busted' | 'cashed_out';
  revealed_tiles: RevealedTile[];
  payout_multiplier: string;
  grid_reveal?: TileValue[][];
  created_at: string;
  updated_at: string;
  next_multiplier: string;
}


export interface AdminMinesGameListItem {
  attributes: any;
  relationships: any;
  id: string;
  bet_amount: number;
  mines_count: number;
  state: 'active' | 'busted' | 'cashed_out';
  payout_multiplier: string;
  created_at: string;
  user: {
    data: {
      id: string;
      type: 'user';
      attributes: {
        email: string;
      }
    }
  }
}

export interface PlinkoGame {
  id: number;
  bet_amount: number;
  rows: number;
  risk: 'low' | 'medium' | 'high';
  path: ('L' | 'R')[];
  multiplier: string;
  winnings: number;
  created_at: string;
}

export interface AdminPlinkoGameListItem {
  created_at: string | number | Date;
  multiplier: ReactNode;
  risk: string;
  winnings: number;
  bet_amount: number;
  rows: ReactNode;
  id: string;
  type: 'plinko_game';
  attributes: {
    bet_amount: number;
    rows: number;
    risk: 'low' | 'medium' | 'high';
    multiplier: string;
    winnings: number;
    created_at: string;
  };
  relationships: {
    user: {
      data: {
        id: string;
        type: 'user';
      }
    }
  }
}

export interface WithdrawalRequest {
  amount_in_cents: number;
}


export interface MinesGameAttributes {
  id: number;
  bet_amount: number;
  mines_count: number;
  state: 'active' | 'busted' | 'cashed_out' | 'idle';
  payout_multiplier: string;
  next_multiplier?: string;
  revealed_tiles: RevealedTile[];
  grid_reveal?: TileValue[][];
  winnings?: number;
}

export interface RevealedTile {
  row: number;
  col: number;
}

export type TileValue = 'mine' | 'diamond';

export interface ApiResponseData {
  id: string;
  type: string;
  attributes: MinesGameAttributes;
}

export interface GameApiResponse {
  data: ApiResponseData;
}

export interface RevealApiResponse {
  status: 'safe' | 'game_over';
  payload: JsonApiPayload<MinesGameAttributes>;
}
export interface JsonApiData<T> {
  id: string;
  type: string;
  attributes: T;
}

export interface JsonApiPayload<T> {
  data: JsonApiData<T>;
}

export interface MinesGamePayload {
  data: {
    id: string;
    type: string;
    attributes: MinesGameAttributes;
  };
}

export interface CashoutApiResponse {
  status: string;
  winnings: number;
  payload: MinesGamePayload;
}

export interface TowerGame {
  id: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert' | 'legendary';
  bet_amount_in_cents: number;
  status: 'active' | 'cashed_out' | 'lost';
  current_level: number;
  payout_multiplier: number;
  winnings_in_cents: number;
  created_at: string;
  current_winnings: number;
  next_potential_winnings?: number;
  revealed_level?: ('diamond' | 'bomb')[];
  player_choices: number[];
}


export interface LimboGame {
  id: number;
  bet_amount_in_cents: number;
  target_multiplier: number;
  result_multiplier: number;
  winnings_in_cents: number;
  status: 'won' | 'lost';
  created_at: string;
}
