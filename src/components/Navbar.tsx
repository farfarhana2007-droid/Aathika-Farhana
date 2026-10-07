import React from 'react';
import { PageView, User } from '../types';
import { 
  Timer, 
  ShieldAlert, 
  LayoutDashboard, 
  History, 
  BarChart3, 
  Settings, 
  Code2, 
  LogOut, 
  Download 
} from 'lucide-react';

interface NavbarProps {
  currentPage: PageView;
  setCurrentPage: (page: PageView) => void;
  currentUser: User | null;
  onLogout: () => void;
  onOpenCodeHub: () => void;
  onQuickDownloadZip: () => void;
  isSessionActive: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  setCurrentPage,
  currentUser,
  onLogout,
  onOpenCodeHub,
  onQuickDownloadZip,
  isSessionActive
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Zone 1: Single text element wordmark with icon */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setCurrentPage(currentUser ? 'dashboard' : 'login')}
            className="flex items-center gap-2.5 text-left focus:outline-none group"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
              <Timer className="w-4 h-4 stroke-[2.2]" />
            </div>
            <span className="text-base font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
              FocusTimer
            </span>
          </button>
          
          {isSessionActive && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Shield Active</span>
            </div>
          )}
        </div>

        {/* Zone 2: Navigation Links */}
        {currentUser ? (
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-600">
            <button
              onClick={() => setCurrentPage('dashboard')}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                currentPage === 'dashboard'
                  ? 'text-indigo-600 bg-indigo-50/70 font-semibold'
                  : 'hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setCurrentPage('timer')}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                currentPage === 'timer'
                  ? 'text-indigo-600 bg-indigo-50/70 font-semibold'
                  : 'hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Timer className="w-4 h-4" />
              <span>Timer</span>
            </button>

            <button
              onClick={() => setCurrentPage('blocker')}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                currentPage === 'blocker'
                  ? 'text-indigo-600 bg-indigo-50/70 font-semibold'
                  : 'hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Distraction Blocker</span>
            </button>

            <button
              onClick={() => setCurrentPage('history')}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                currentPage === 'history'
                  ? 'text-indigo-600 bg-indigo-50/70 font-semibold'
                  : 'hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <History className="w-4 h-4" />
              <span>History</span>
            </button>

            <button
              onClick={() => setCurrentPage('statistics')}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                currentPage === 'statistics'
                  ? 'text-indigo-600 bg-indigo-50/70 font-semibold'
                  : 'hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Statistics</span>
            </button>

            <button
              onClick={() => setCurrentPage('settings')}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                currentPage === 'settings'
                  ? 'text-indigo-600 bg-indigo-50/70 font-semibold'
                  : 'hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </nav>
        ) : (
          <div className="text-xs text-slate-500 hidden sm:block">
            College Project Edition · Flask & SQLite3
          </div>
        )}

        {/* Zone 3: Primary Actions & User menu */}
        <div className="flex items-center gap-2.5">
          {/* Flask Source Code Hub Button */}
          <button
            onClick={onOpenCodeHub}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap border border-slate-200"
            title="Inspect or Download complete Python Flask code"
          >
            <Code2 className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Project Code & Viva Hub</span>
            <span className="sm:hidden">Code</span>
          </button>

          <button
            onClick={onQuickDownloadZip}
            className="px-2.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm whitespace-nowrap"
            title="Download full project as a ready-to-run .zip"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Download ZIP</span>
          </button>

          {currentUser ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <span className="text-xs font-medium text-slate-700 hidden lg:inline">
                {currentUser.username}
              </span>
              <button
                onClick={onLogout}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage('login')}
                className={`text-xs font-medium px-2.5 py-1.5 rounded-lg ${
                  currentPage === 'login' ? 'text-indigo-600 font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setCurrentPage('register')}
                className="text-xs font-medium px-3 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800"
              >
                Register
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Mobile Navigation bar for small screens */}
      {currentUser && (
        <div className="md:hidden flex items-center justify-around px-2 py-1.5 bg-slate-50 border-t border-slate-200 overflow-x-auto text-xs">
          <button
            onClick={() => setCurrentPage('dashboard')}
            className={`px-2.5 py-1 rounded ${currentPage === 'dashboard' ? 'font-bold text-indigo-600' : 'text-slate-600'}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setCurrentPage('timer')}
            className={`px-2.5 py-1 rounded ${currentPage === 'timer' ? 'font-bold text-indigo-600' : 'text-slate-600'}`}
          >
            Timer
          </button>
          <button
            onClick={() => setCurrentPage('blocker')}
            className={`px-2.5 py-1 rounded ${currentPage === 'blocker' ? 'font-bold text-indigo-600' : 'text-slate-600'}`}
          >
            Blocker
          </button>
          <button
            onClick={() => setCurrentPage('history')}
            className={`px-2.5 py-1 rounded ${currentPage === 'history' ? 'font-bold text-indigo-600' : 'text-slate-600'}`}
          >
            History
          </button>
          <button
            onClick={() => setCurrentPage('statistics')}
            className={`px-2.5 py-1 rounded ${currentPage === 'statistics' ? 'font-bold text-indigo-600' : 'text-slate-600'}`}
          >
            Stats
          </button>
          <button
            onClick={() => setCurrentPage('settings')}
            className={`px-2.5 py-1 rounded ${currentPage === 'settings' ? 'font-bold text-indigo-600' : 'text-slate-600'}`}
          >
            Settings
          </button>
        </div>
      )}
    </header>
  );
};
