import React from 'react';
import { BlockedSite, FocusSession, ProductivityStat, User } from '../../types';
import { 
  Timer, 
  Target, 
  ShieldCheck, 
  Flame, 
  ArrowRight, 
  Clock, 
  Calendar, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface DashboardPageProps {
  user: User;
  sessions: FocusSession[];
  blockedSites: BlockedSite[];
  stats: ProductivityStat[];
  onOpenTimer: () => void;
  onOpenBlocker: () => void;
  onOpenHistory: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  user,
  sessions,
  blockedSites,
  stats,
  onOpenTimer,
  onOpenBlocker,
  onOpenHistory,
}) => {
  // Compute today's metrics
  const todayStr = '2026-10-06';
  const todayStat = stats.find(s => s.date === todayStr) || {
    date: todayStr,
    total_focus_minutes: 0,
    completed_sessions_count: 0,
    interrupted_sessions_count: 0,
    distraction_attempts_blocked: 0,
  };

  const todaySessions = sessions.filter(s => s.started_at.startsWith(todayStr));
  const todayMinutes = todaySessions.reduce((acc, s) => acc + (s.status === 'completed' ? s.actual_duration : 0), 0);
  const todayCompletedCount = todaySessions.filter(s => s.status === 'completed').length;

  const totalAllTimeMinutes = sessions.reduce((acc, s) => acc + s.actual_duration, 0);
  const totalCompletedSessions = sessions.filter(s => s.status === 'completed').length;
  const activeBlockedSitesCount = blockedSites.filter(b => b.is_active).length;
  const totalPreventedAllTime = blockedSites.reduce((acc, b) => acc + b.attempts_prevented, 0);

  // Daily target calculation (e.g. 120 mins)
  const dailyTargetMinutes = 120;
  const targetPercent = Math.min(100, Math.round((todayMinutes / dailyTargetMinutes) * 100));

  const recentSessions = [...sessions].sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime()).slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Productivity Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Welcome back, {user.username}. Track your focus sessions and stay shielded from online distractions.
          </p>
        </div>
        <button
          onClick={onOpenTimer}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-all shadow-sm hover:shadow active:scale-[0.98] whitespace-nowrap"
        >
          <Timer className="w-4 h-4" />
          <span>Launch Focus Timer</span>
          <ArrowRight className="w-4 h-4 ml-0.5" />
        </button>
      </div>

      {/* 4 Stat Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Today Focus Time */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Focus</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 font-mono tabular-nums">
              {todayMinutes}
            </span>
            <span className="text-sm font-medium text-slate-500">minutes</span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500" 
                style={{ width: `${targetPercent}%` }}
              ></div>
            </div>
            <span className="text-xs font-mono text-slate-500 tabular-nums">{targetPercent}%</span>
          </div>
        </div>

        {/* Completed Sessions */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed Sessions</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 font-mono tabular-nums">
              {todayCompletedCount}
            </span>
            <span className="text-sm font-medium text-slate-500">today</span>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            {totalCompletedSessions} total all-time sessions
          </p>
        </div>

        {/* Distractions Blocked */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Distractions Blocked</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 font-mono tabular-nums">
              {todayStat.distraction_attempts_blocked}
            </span>
            <span className="text-sm font-medium text-slate-500">intercepted</span>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            {totalPreventedAllTime} temptations defended
          </p>
        </div>

        {/* Focus Streak */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Study Streak</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 font-mono tabular-nums">
              6
            </span>
            <span className="text-sm font-medium text-slate-500">days in a row</span>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            {Math.round(totalAllTimeMinutes / 60)} hours total study logged
          </p>
        </div>

      </div>

      {/* Distraction Shield Active Banner */}
      <div className="bg-gradient-to-r from-indigo-50/80 via-white to-slate-50 rounded-xl border border-indigo-100 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Distraction Shield is Armed and Ready
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Currently actively monitoring <strong className="text-slate-900">{activeBlockedSitesCount} distracting websites</strong> (Instagram, YouTube, Reddit, TikTok, etc.).
            </p>
          </div>
        </div>

        <button
          onClick={onOpenBlocker}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 rounded-lg text-xs font-semibold shadow-xs transition-colors whitespace-nowrap self-start md:self-auto"
        >
          <span>Manage Block List</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>

      {/* Recent Sessions Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Recent Focus Sessions
            </h2>
            <p className="text-xs text-slate-500">
              Your latest concentration milestones and study topics
            </p>
          </div>
          <button
            onClick={onOpenHistory}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentSessions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/70 border-b border-slate-200 text-xs font-medium text-slate-500">
                <tr>
                  <th className="py-3 px-4">Session Topic / Task</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentSessions.map(session => (
                  <tr key={session.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">
                        {session.notes || 'Unspecified Concentration Session'}
                      </div>
                      <div className="text-xs text-slate-500 capitalize">
                        {session.session_type.replace('_', ' ')}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-500 tabular-nums">
                      {session.started_at}
                    </td>
                    <td className="py-3 px-4 font-mono text-sm font-semibold text-slate-900 tabular-nums">
                      {session.actual_duration}m
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${
                        session.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {session.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-sm text-slate-500 mb-3">No focus sessions recorded yet today.</p>
            <button
              onClick={onOpenTimer}
              className="text-xs font-semibold px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Start Your First Session
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
