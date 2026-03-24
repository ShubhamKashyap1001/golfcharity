// ============================================================
// Global Types for Golf Charity Platform
// ============================================================

export type UserRole = 'subscriber' | 'admin';
export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'lapsed';
export type SubscriptionPlan = 'monthly' | 'yearly';
export type DrawStatus = 'pending' | 'simulated' | 'published';
export type DrawLogic = 'random' | 'algorithmic';
export type WinnerStatus = 'pending_verification' | 'approved' | 'rejected' | 'paid';
export type MatchType = 'three_match' | 'four_match' | 'five_match';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: UserRole;
  phone?: string;
  country: string;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  amount_pence: number;
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface Charity {
  id: string;
  name: string;
  description: string;
  short_description?: string;
  logo_url?: string;
  banner_url?: string;
  website_url?: string;
  registered_number?: string;
  category?: string;
  is_active: boolean;
  is_featured: boolean;
  total_raised: number;
  created_at: string;
  updated_at: string;
}

export interface CharityEvent {
  id: string;
  charity_id: string;
  title: string;
  description?: string;
  event_date?: string;
  location?: string;
  image_url?: string;
  created_at: string;
}

export interface UserCharity {
  id: string;
  user_id: string;
  charity_id: string;
  donation_percentage: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  charity?: Charity;
}

export interface GolfScore {
  id: string;
  user_id: string;
  score: number;
  score_date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Draw {
  id: string;
  draw_month: number;
  draw_year: number;
  status: DrawStatus;
  logic: DrawLogic;
  winning_numbers: number[];
  simulated_numbers?: number[];
  total_pool: number;
  jackpot_pool: number;
  four_match_pool: number;
  three_match_pool: number;
  jackpot_rollover: number;
  published_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface DrawEntry {
  id: string;
  draw_id: string;
  user_id: string;
  entry_numbers: number[];
  created_at: string;
  draw?: Draw;
}

export interface Winner {
  id: string;
  draw_id: string;
  user_id: string;
  match_type: MatchType;
  matched_numbers: number[];
  prize_amount: number;
  status: WinnerStatus;
  proof_url?: string;
  admin_notes?: string;
  verified_by?: string;
  verified_at?: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
  profile?: Profile;
  draw?: Draw;
}

export interface CharityDonation {
  id: string;
  user_id: string;
  charity_id: string;
  amount: number;
  is_subscription_contribution: boolean;
  stripe_payment_intent_id?: string;
  created_at: string;
  charity?: Charity;
}

export interface DashboardStats {
  subscription: Subscription | null;
  scores: GolfScore[];
  activeCharity: UserCharity | null;
  totalWinnings: number;
  pendingWinnings: number;
  recentWinners: Winner[];
  upcomingDraw: Draw | null;
}

export interface AdminStats {
  totalUsers: number;
  activeSubscribers: number;
  totalPrizePool: number;
  totalCharityContributions: number;
  monthlyRevenue: number;
  pendingVerifications: number;
}
