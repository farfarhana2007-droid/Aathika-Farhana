import React from 'react';
import { FocusSession, ProductivityStat } from '../../types';
import { 
  BarChart3, 
  TrendingUp, 
  ShieldCheck, 
  Target, 
  Award, 
  Calendar,
  Clock
} from 'lucide-react';

interface StatisticsPageProps {
  stats: ProductivityStat[];
  sessions: FocusSession[];
}

export const StatisticsPage: React.FC<StatisticsPageProps> = ({
  stats,
  sessions,
}) => {
  // Sort stats by date ascending for charts
  const sortedStats = [...stats].sort((a, b) => a.date.localeCompare(b.date));
  const maxMinutes = Math.max(...sortedStats.map(s => s.total_focus_minutes), 140);

  const totalWeeklyMinutes = sortedStats.reduce((acc, s) => acc + s.total_focus_minutes, 0);
  const totalWeeklySessions = sortedStats.reduce((acc, s) => acc + s.completed_sessions_count, 0);
  const totalWeeklyDistractions = sortedStats.reduce((acc, s) => acc + s.distraction_attempts_blocked, 0);

  const completedCount = sessions.filter(s => s.status === 'completed').length;
  const totalCount = sessions.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Day name formatter
  const formatDay = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Productivity Statistics & Trends
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Empirical tracking of your daily concentration minutes, session completion, and temptation resistance.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>7-Day Focus Total</span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900 font-mono tabular-nums mt-2">
            {Math.floor(totalWeeklyMinutes / 60)}h {totalWeeklyMinutes % 60}m
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Avg {Math.round(totalWeeklyMinutes / (sortedStats.length || 1))} mins/day
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Completed Sessions</span>
            <Target className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900 font-mono tabular-nums mt-2">
            {totalWeeklySessions}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {completionPercentage}% success rate
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Distractions Defended</span>
            <ShieldCheck className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-3xl font-bold text-rose-600 font-mono tabular-nums mt-2">
            {totalWeeklyDistractions}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Temptation attempts blocked by shield
          </p>
        </div>
      </div>

      {/* Daily Focus Time Bar Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Daily Focus Minutes (Past 7 Days)
            </h2>
            <p className="text-xs text-slate-500">
              Distribution of pure concentration minutes per day
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">Unit: Minutes</span>
        </div>

        {/* Visual Bar Graph */}
        <div className="h-56 flex items-end justify-between gap-2 pt-6 pb-2 border-b border-slate-100">
          {sortedStats.map(stat => {
            const heightPercent = Math.min(100, Math.round((stat.total_focus_minutes / maxMinutes) * 100));
            return (
              <div key={stat.date} className="flex-1 flex flex-col items-center gap-2 group">
                <span className="text-xs font-mono tabular-nums text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  {stat.total_focus_minutes}m
                </span>
                <div className="w-full max-w-[42px] bg-slate-100 rounded-t-md h-40 flex items-end overflow-hidden">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 transition-all rounded-t-md cursor-pointer"
                    title={`${stat.date}: ${stat.total_focus_minutes} minutes focus`}
                  ></div>
                </div>
                <span className="text-[11px] font-medium text-slate-600 truncate max-w-full text-center">
                  {formatDay(stat.date)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Historical SQLite Table View */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-200">
          <h2 className="text-base font-bold text-slate-900">
            Productivity Stats Table (`productivity_stats` Table in SQLite)
          </h2>
          <p className="text-xs text-slate-500">
            Raw relational aggregate data stored per calendar day
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/70 border-b border-slate-200 text-xs font-medium text-slate-500">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Total Focus Mins</th>
                <th className="py-3 px-4">Completed Sessions</th>
                <th className="py-3 px-4">Interrupted Sessions</th>
                <th className="py-3 px-4">Distractions Blocked</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedStats.map(row => (
                <tr key={row.date} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-slate-900">
                    {row.date}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-indigo-700 tabular-nums">
                    {row.total_focus_minutes} mins
                  </td>
                  <td className="py-3 px-4 font-mono tabular-nums text-emerald-700">
                    {row.completed_sessions_count}
                  </td>
                  <td className="py-3 px-4 font-mono tabular-nums text-slate-500">
                    {row.interrupted_sessions_count}
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-rose-600 tabular-nums">
                    {row.distraction_attempts_blocked}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
