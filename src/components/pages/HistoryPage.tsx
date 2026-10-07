import React, { useState } from 'react';
import { FocusSession } from '../../types';
import { 
  History, 
  Search, 
  Download, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Trash2
} from 'lucide-react';

interface HistoryPageProps {
  sessions: FocusSession[];
  onDeleteSession: (id: number) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  sessions,
  onDeleteSession,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'interrupted'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSessions = sessions.filter(session => {
    if (statusFilter !== 'all' && session.status !== statusFilter) return false;
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      const notes = (session.notes || '').toLowerCase();
      const type = session.session_type.toLowerCase();
      return notes.includes(query) || type.includes(query);
    }
    return true;
  });

  const totalSessions = sessions.length;
  const completedSessions = sessions.filter(s => s.status === 'completed').length;
  const totalMinutes = sessions.reduce((acc, s) => acc + s.actual_duration, 0);
  const completionRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

  const exportCSV = () => {
    const headers = ['ID,User_ID,Type,Target_Mins,Actual_Mins,Status,Notes,Started_At,Completed_At'];
    const rows = sessions.map(s => 
      `${s.id},${s.user_id},"${s.session_type}",${s.target_duration},${s.actual_duration},"${s.status}","${(s.notes || '').replace(/"/g, '""')}","${s.started_at}","${s.completed_at}"`
    );
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `focus_sessions_history_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Focus Session History
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Complete audit trail of all recorded study, coding, and review sessions.
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <span className="text-xs text-slate-500">Total Logged Sessions</span>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums mt-1">
            {totalSessions}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <span className="text-xs text-slate-500">Total Concentration Time</span>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums mt-1">
            {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <span className="text-xs text-slate-500">Session Completion Rate</span>
          <div className="text-2xl font-bold font-mono text-emerald-600 tabular-nums mt-1">
            {completionRate}%
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search topic or task..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-full sm:w-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`flex-1 sm:flex-initial px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              statusFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({sessions.length})
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`flex-1 sm:flex-initial px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              statusFilter === 'completed'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Completed ({completedSessions})
          </button>
          <button
            onClick={() => setStatusFilter('interrupted')}
            className={`flex-1 sm:flex-initial px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              statusFilter === 'interrupted'
                ? 'bg-white text-rose-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Interrupted
          </button>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        {filteredSessions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/70 border-b border-slate-200 text-xs font-medium text-slate-500">
                <tr>
                  <th className="py-3 px-4">Started At</th>
                  <th className="py-3 px-4">Topic / Session Notes</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Target</th>
                  <th className="py-3 px-4">Actual</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSessions.map(session => (
                  <tr key={session.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs text-slate-500 tabular-nums">
                      {session.started_at}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">
                        {session.notes || 'General Study Session'}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-xs text-slate-600 capitalize">
                        {session.session_type.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-xs text-slate-500 tabular-nums">
                      {session.target_duration}m
                    </td>

                    <td className="py-3 px-4 font-mono text-sm font-bold text-slate-900 tabular-nums">
                      {session.actual_duration}m
                    </td>

                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium capitalize ${
                        session.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {session.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onDeleteSession(session.id)}
                        className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        title="Delete log entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500 text-sm">
            No focus session records found matching your query.
          </div>
        )}
      </div>

    </div>
  );
};
