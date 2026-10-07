/**
 * Focus Timer with Distraction Blocker
 * Modern Web Application & College Final-Year Project Hub
 */

import React, { useState, useEffect } from 'react';
import { 
  BlockedSite, 
  FocusSession, 
  PageView, 
  ProductivityStat, 
  User, 
  UserSettings 
} from './types';
import { 
  initialBlockedSites, 
  initialProductivityStats, 
  initialSessions, 
  initialSettings, 
  initialUser 
} from './data/defaultData';
import { Navbar } from './components/Navbar';
import { DashboardPage } from './components/pages/DashboardPage';
import { TimerPage } from './components/pages/TimerPage';
import { BlockerPage } from './components/pages/BlockerPage';
import { HistoryPage } from './components/pages/HistoryPage';
import { StatisticsPage } from './components/pages/StatisticsPage';
import { SettingsPage } from './components/pages/SettingsPage';
import { AuthPage } from './components/pages/AuthPage';
import { DistractionModal } from './components/DistractionModal';
import { BreakReminderModal } from './components/BreakReminderModal';
import { CodeExportModal } from './components/pages/CodeExportModal';
import { downloadProjectZip } from './utils/zipExport';
import { sound } from './utils/audio';

export default function App() {
  // Load persisted user & state or default
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('ft_user');
    return saved ? JSON.parse(saved) : initialUser;
  });

  const [currentPage, setCurrentPage] = useState<PageView>('dashboard');

  const [sessions, setSessions] = useState<FocusSession[]>(() => {
    const saved = localStorage.getItem('ft_sessions');
    return saved ? JSON.parse(saved) : initialSessions;
  });

  const [blockedSites, setBlockedSites] = useState<BlockedSite[]>(() => {
    const saved = localStorage.getItem('ft_blocked_sites');
    return saved ? JSON.parse(saved) : initialBlockedSites;
  });

  const [stats, setStats] = useState<ProductivityStat[]>(() => {
    const saved = localStorage.getItem('ft_stats');
    return saved ? JSON.parse(saved) : initialProductivityStats;
  });

  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('ft_settings');
    return saved ? JSON.parse(saved) : initialSettings;
  });

  // Distraction interceptor modal states
  const [distractionModalOpen, setDistractionModalOpen] = useState(false);
  const [attemptedDomain, setAttemptedDomain] = useState('');

  // Break reminder modal state
  const [breakModalOpen, setBreakModalOpen] = useState(false);
  const [completedMinsForBreak, setCompletedMinsForBreak] = useState(25);

  // College code submission hub modal state
  const [codeHubOpen, setCodeHubOpen] = useState(false);

  // Sync state to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('ft_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('ft_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('ft_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('ft_blocked_sites', JSON.stringify(blockedSites));
  }, [blockedSites]);

  useEffect(() => {
    localStorage.setItem('ft_stats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem('ft_settings', JSON.stringify(settings));
  }, [settings]);

  // Handlers for session logging
  const handleSessionComplete = (newSessionData: Omit<FocusSession, 'id'>) => {
    const newSession: FocusSession = {
      ...newSessionData,
      id: Date.now(),
    };
    setSessions(prev => [newSession, ...prev]);

    // Update daily productivity stat
    if (newSessionData.session_type === 'focus') {
      const todayStr = '2026-10-06';
      setStats(prev => {
        const existing = prev.find(s => s.date === todayStr);
        if (existing) {
          return prev.map(s => 
            s.date === todayStr
              ? {
                  ...s,
                  total_focus_minutes: s.total_focus_minutes + newSession.actual_duration,
                  completed_sessions_count: s.completed_sessions_count + (newSession.status === 'completed' ? 1 : 0),
                  interrupted_sessions_count: s.interrupted_sessions_count + (newSession.status !== 'completed' ? 1 : 0),
                }
              : s
          );
        } else {
          return [
            ...prev,
            {
              date: todayStr,
              total_focus_minutes: newSession.actual_duration,
              completed_sessions_count: newSession.status === 'completed' ? 1 : 0,
              interrupted_sessions_count: newSession.status !== 'completed' ? 1 : 0,
              distraction_attempts_blocked: 0,
            }
          ];
        }
      });
    }
  };

  const handleDistractionAttempt = (domain: string) => {
    setAttemptedDomain(domain);
    setDistractionModalOpen(true);

    // Increment attempts on blocked site
    setBlockedSites(prev => 
      prev.map(site => 
        site.domain_name.toLowerCase() === domain.toLowerCase()
          ? { ...site, attempts_prevented: site.attempts_prevented + 1 }
          : site
      )
    );

    // Increment today's distraction stats
    const todayStr = '2026-10-06';
    setStats(prev => {
      const existing = prev.find(s => s.date === todayStr);
      if (existing) {
        return prev.map(s => 
          s.date === todayStr
            ? { ...s, distraction_attempts_blocked: s.distraction_attempts_blocked + 1 }
            : s
        );
      } else {
        return [
          ...prev,
          {
            date: todayStr,
            total_focus_minutes: 0,
            completed_sessions_count: 0,
            interrupted_sessions_count: 0,
            distraction_attempts_blocked: 1,
          }
        ];
      }
    });
  };

  const handleBreakReminder = (minutes: number) => {
    setCompletedMinsForBreak(settings.focus_duration);
    setBreakModalOpen(true);
  };

  const handleStartBreakFromModal = () => {
    setBreakModalOpen(false);
    setCurrentPage('timer');
  };

  // Blocklist CRUD
  const handleAddBlockedSite = (domain: string, category: string) => {
    const newSite: BlockedSite = {
      id: Date.now(),
      user_id: currentUser ? currentUser.id : 1,
      domain_name: domain,
      category: category,
      is_active: true,
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
      attempts_prevented: 0,
    };
    setBlockedSites(prev => [newSite, ...prev]);
  };

  const handleToggleBlockedSite = (id: number) => {
    setBlockedSites(prev => 
      prev.map(s => s.id === id ? { ...s, is_active: !s.is_active } : s)
    );
  };

  const handleDeleteBlockedSite = (id: number) => {
    setBlockedSites(prev => prev.filter(s => s.id !== id));
  };

  const handleDeleteSession = (id: number) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('login');
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setCurrentPage('dashboard');
  };

  const handleQuickDownloadZip = async () => {
    await downloadProjectZip();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Bar Navigation */}
      <Navbar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenCodeHub={() => setCodeHubOpen(true)}
        onQuickDownloadZip={handleQuickDownloadZip}
        isSessionActive={true}
      />

      {/* Main Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {!currentUser ? (
          <AuthPage
            initialMode={currentPage === 'register' ? 'register' : 'login'}
            onLoginSuccess={handleLoginSuccess}
          />
        ) : (
          <>
            {currentPage === 'dashboard' && (
              <DashboardPage
                user={currentUser}
                sessions={sessions}
                blockedSites={blockedSites}
                stats={stats}
                onOpenTimer={() => setCurrentPage('timer')}
                onOpenBlocker={() => setCurrentPage('blocker')}
                onOpenHistory={() => setCurrentPage('history')}
              />
            )}

            {currentPage === 'timer' && (
              <TimerPage
                settings={settings}
                blockedSites={blockedSites}
                onSessionComplete={handleSessionComplete}
                onDistractionAttempt={handleDistractionAttempt}
                onBreakReminder={handleBreakReminder}
              />
            )}

            {currentPage === 'blocker' && (
              <BlockerPage
                blockedSites={blockedSites}
                onAddSite={handleAddBlockedSite}
                onToggleSite={handleToggleBlockedSite}
                onDeleteSite={handleDeleteBlockedSite}
                onTestAttempt={handleDistractionAttempt}
              />
            )}

            {currentPage === 'history' && (
              <HistoryPage
                sessions={sessions}
                onDeleteSession={handleDeleteSession}
              />
            )}

            {currentPage === 'statistics' && (
              <StatisticsPage
                stats={stats}
                sessions={sessions}
              />
            )}

            {currentPage === 'settings' && (
              <SettingsPage
                settings={settings}
                onSaveSettings={setSettings}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            Focus Timer with Distraction Blocker · Python Flask, SQLite3, HTML, CSS & JavaScript
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCodeHubOpen(true)}
              className="text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              View Python Flask Source Files
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={handleQuickDownloadZip}
              className="text-slate-600 hover:text-slate-900"
            >
              Download .ZIP
            </button>
          </div>
        </div>
      </footer>

      {/* Distraction Interceptor Modal */}
      <DistractionModal
        isOpen={distractionModalOpen}
        blockedDomain={attemptedDomain}
        remainingTimeFormatted="Active Focus"
        onStayFocused={() => setDistractionModalOpen(false)}
      />

      {/* Break Reminder Modal */}
      <BreakReminderModal
        isOpen={breakModalOpen}
        completedMinutes={completedMinsForBreak}
        breakDuration={settings.short_break_duration}
        onStartBreak={handleStartBreakFromModal}
        onDismiss={() => setBreakModalOpen(false)}
      />

      {/* College Project Submission Code Hub */}
      <CodeExportModal
        isOpen={codeHubOpen}
        onClose={() => setCodeHubOpen(false)}
      />
    </div>
  );
}
