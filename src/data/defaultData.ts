import { BlockedSite, FocusSession, ProductivityStat, User, UserSettings } from '../types';

export const initialUser: User = {
  id: 1,
  username: 'Alex Student',
  email: 'alex.student@college.edu',
  created_at: '2026-09-15 09:00:00'
};

export const initialSettings: UserSettings = {
  focus_duration: 25,
  short_break_duration: 5,
  long_break_duration: 15,
  long_break_interval: 4,
  daily_goal_minutes: 120,
  sound_enabled: true,
  strict_mode: true,
  auto_start_breaks: false
};

export const initialBlockedSites: BlockedSite[] = [
  {
    id: 1,
    user_id: 1,
    domain_name: 'instagram.com',
    category: 'Social Media',
    is_active: true,
    created_at: '2026-09-15 10:00:00',
    attempts_prevented: 14
  },
  {
    id: 2,
    user_id: 1,
    domain_name: 'youtube.com',
    category: 'Entertainment',
    is_active: true,
    created_at: '2026-09-15 10:05:00',
    attempts_prevented: 22
  },
  {
    id: 3,
    user_id: 1,
    domain_name: 'reddit.com',
    category: 'Social Media',
    is_active: true,
    created_at: '2026-09-16 11:20:00',
    attempts_prevented: 9
  },
  {
    id: 4,
    user_id: 1,
    domain_name: 'tiktok.com',
    category: 'Social Media',
    is_active: true,
    created_at: '2026-09-16 14:10:00',
    attempts_prevented: 18
  },
  {
    id: 5,
    user_id: 1,
    domain_name: 'twitter.com',
    category: 'Social Media',
    is_active: true,
    created_at: '2026-09-18 08:30:00',
    attempts_prevented: 6
  },
  {
    id: 6,
    user_id: 1,
    domain_name: 'netflix.com',
    category: 'Entertainment',
    is_active: true,
    created_at: '2026-09-20 16:45:00',
    attempts_prevented: 4
  },
  {
    id: 7,
    user_id: 1,
    domain_name: 'facebook.com',
    category: 'Social Media',
    is_active: true,
    created_at: '2026-09-20 17:00:00',
    attempts_prevented: 7
  }
];

export const initialSessions: FocusSession[] = [
  {
    id: 101,
    user_id: 1,
    session_type: 'focus',
    target_duration: 25,
    actual_duration: 25,
    status: 'completed',
    notes: 'Operating Systems Chapter 3: Process Scheduling',
    started_at: '2026-10-06 09:15:00',
    completed_at: '2026-10-06 09:40:00'
  },
  {
    id: 102,
    user_id: 1,
    session_type: 'focus',
    target_duration: 25,
    actual_duration: 25,
    status: 'completed',
    notes: 'Database Management Systems SQL Queries Lab',
    started_at: '2026-10-06 10:00:00',
    completed_at: '2026-10-06 10:25:00'
  },
  {
    id: 103,
    user_id: 1,
    session_type: 'focus',
    target_duration: 25,
    actual_duration: 18,
    status: 'interrupted',
    notes: 'Computer Networks Socket Programming',
    started_at: '2026-10-06 11:10:00',
    completed_at: '2026-10-06 11:28:00'
  },
  {
    id: 104,
    user_id: 1,
    session_type: 'focus',
    target_duration: 25,
    actual_duration: 25,
    status: 'completed',
    notes: 'Final Year Project Documentation & Architecture',
    started_at: '2026-10-06 14:00:00',
    completed_at: '2026-10-06 14:25:00'
  },
  {
    id: 105,
    user_id: 1,
    session_type: 'focus',
    target_duration: 30,
    actual_duration: 30,
    status: 'completed',
    notes: 'Machine Learning Model Evaluation and Confusion Matrix',
    started_at: '2026-10-05 15:30:00',
    completed_at: '2026-10-05 16:00:00'
  },
  {
    id: 106,
    user_id: 1,
    session_type: 'focus',
    target_duration: 25,
    actual_duration: 25,
    status: 'completed',
    notes: 'Software Engineering Agile Sprint Review',
    started_at: '2026-10-05 16:15:00',
    completed_at: '2026-10-05 16:40:00'
  },
  {
    id: 107,
    user_id: 1,
    session_type: 'focus',
    target_duration: 25,
    actual_duration: 25,
    status: 'completed',
    notes: 'Python Flask Backend Routes Implementation',
    started_at: '2026-10-04 10:00:00',
    completed_at: '2026-10-04 10:25:00'
  },
  {
    id: 108,
    user_id: 1,
    session_type: 'focus',
    target_duration: 25,
    actual_duration: 25,
    status: 'completed',
    notes: 'Data Structures Binary Search Tree Traversals',
    started_at: '2026-10-04 11:00:00',
    completed_at: '2026-10-04 11:25:00'
  }
];

export const initialProductivityStats: ProductivityStat[] = [
  {
    date: '2026-10-01',
    total_focus_minutes: 75,
    completed_sessions_count: 3,
    interrupted_sessions_count: 1,
    distraction_attempts_blocked: 11
  },
  {
    date: '2026-10-02',
    total_focus_minutes: 100,
    completed_sessions_count: 4,
    interrupted_sessions_count: 0,
    distraction_attempts_blocked: 8
  },
  {
    date: '2026-10-03',
    total_focus_minutes: 125,
    completed_sessions_count: 5,
    interrupted_sessions_count: 1,
    distraction_attempts_blocked: 14
  },
  {
    date: '2026-10-04',
    total_focus_minutes: 90,
    completed_sessions_count: 3,
    interrupted_sessions_count: 0,
    distraction_attempts_blocked: 7
  },
  {
    date: '2026-10-05',
    total_focus_minutes: 110,
    completed_sessions_count: 4,
    interrupted_sessions_count: 1,
    distraction_attempts_blocked: 12
  },
  {
    date: '2026-10-06',
    total_focus_minutes: 93,
    completed_sessions_count: 3,
    interrupted_sessions_count: 1,
    distraction_attempts_blocked: 9
  }
];
