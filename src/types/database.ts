export type TaskStatus = 'analyzing' | 'approved' | 'rejected' | 'paid';

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  created_at: string;
}

export interface Team {
  id: string;
  name: string;
  invite_code: string;
  owner_id: string;
  weekly_goal_brl: number;
  weekly_goal_hours: number;
  daily_goal_hours?: number;
  usd_to_brl_rate: number;
  payout_cutoff_day: string;
  created_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  nickname: string;
  role: 'owner' | 'member';
  is_active: boolean;
  created_at: string;
}

export interface Intermediary {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  current_rate_usd: number;
  promo_rate_usd: number | null;
  bonus_required_hours?: number;
  bonus_condition_text?: string;
  active_promotion: string | null;
  payout_frequency: string;
  payout_methods: string;
  cutoff_day: string;
  is_active: boolean;
  last_checked_at: string;
}

export interface Category {
  id: string;
  team_id: string | null;
  name: string;
  icon: string;
  is_favorite: boolean;
}

export interface Task {
  id: string;
  team_id: string;
  member_id: string;
  intermediary_id: string | null;
  category_name: string;
  duration_minutes: number;
  rate_usd: number;
  usd_to_brl_rate: number;
  calculated_usd: number;
  calculated_brl: number;
  status: TaskStatus;
  rejection_reason: string | null;
  external_task_code: string | null;
  task_date: string;
  notes: string | null;
  created_at: string;
  // Joins
  member?: TeamMember;
  intermediary?: Intermediary;
}

export interface RateReport {
  id: string;
  intermediary_id: string;
  reported_by: string | null;
  reported_rate_usd: number;
  promo_details: string | null;
  proof_notes: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface HouseholdAnswers {
  hasDishwasher: boolean;
  cooksDaily: boolean;
  hasWashingMachine: boolean;
  hasIron: boolean;
  housingType: 'casa' | 'apartamento';
  hasYard: boolean;
  hasVacuum: boolean;
  hasMop: boolean;
  hasPet: boolean;
  hasPlants: boolean;
  hasVehicle: boolean;
  hasCommercialAccess: boolean;
  doesGroceryShopping?: boolean;
  refuelsVehicle?: boolean;
  worksInHotelOrLaundry?: boolean;
  hasPressureWasher?: boolean;
  hasPool?: boolean;
  hasLawnOrGarden?: boolean;
  hasHomeGym?: boolean;
  hasKidsToys?: boolean;
  hasToolsDIY?: boolean;
  hasWorkDesk?: boolean;
  hasGarageStorage?: boolean;
  hasDog?: boolean;
  hasCat?: boolean;
  preparesCoffeeOrTea?: boolean;
  recordsWithPartner?: boolean;
  doesHandWashClothes?: boolean;
}

export interface RoutineTask {
  id: string;
  title: string;
  categoryName: string;
  frequency: 'daily' | 'weekly';
  recommendedMinutes: number;
  timesPerWeek: number;
  description: string;
  antiRejectionTips: string[];
  icon: string;
  badge?: string;
}

export interface HouseholdProfile {
  id: string;
  user_id: string;
  team_id: string | null;
  answers: HouseholdAnswers;
  completed_tasks: Record<string, string[]>;
  created_at: string;
  updated_at: string;
}
