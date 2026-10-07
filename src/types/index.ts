export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

export type SessionType = 'focus' | 'short_break' | 'long_break';
export type SessionStatus = 'completed' | 'interrupted' | 'abandoned';

export interface FocusSession {
  id: number;
  user_id: number;
  session_type: SessionType;
  target_duration: number; // minutes
  actual_duration: number; // minutes
  status: SessionStatus;
  notes?: string;
  started_at: string;
  completed_at: string;
}

export interface BlockedSite {
  id: number;
  user_id: number;
  domain_name: string;
  category: string;
  is_active: boolean;
  created_at: string;
  attempts_prevented: number;
}

export interface ProductivityStat {
  date: string; // YYYY-MM-DD
  total_focus_minutes: number;
  completed_sessions_count: number;
  interrupted_sessions_count: number;
  distraction_attempts_blocked: number;
}

export interface UserSettings {
  focus_duration: number; // default 25 mins
  short_break_duration: number; // default 5 mins
  long_break_duration: number; // default 15 mins
  long_break_interval: number; // every 4 sessions
  daily_goal_minutes: number; // e.g. 120 mins
  sound_enabled: boolean;
  strict_mode: boolean; // cannot disable sites during focus
  auto_start_breaks: boolean;
}

export type PageView = 
  | 'dashboard'
  | 'timer'
  | 'blocker'
  | 'history'
  | 'statistics'
  | 'settings'
  | 'code_hub'
  | 'login'
  | 'register';
