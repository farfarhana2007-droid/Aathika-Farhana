import React, { useState } from 'react';
import { User } from '../../types';
import { Timer, ArrowRight, ShieldCheck, CheckCircle2, Lock, Mail, User as UserIcon } from 'lucide-react';

interface AuthPageProps {
  initialMode: 'login' | 'register';
  onLoginSuccess: (user: User) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialMode,
  onLoginSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (mode === 'register') {
      if (!username.trim() || !email.trim() || !password) {
        setErrorMsg('All fields are required.');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match.');
        return;
      }

      // Create new user
      const newUser: User = {
        id: Date.now(),
        username: username.trim(),
        email: email.trim().toLowerCase(),
        created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
      };
      onLoginSuccess(newUser);
    } else {
      // Login validation
      if (!email.trim() || !password) {
        setErrorMsg('Please enter your email and password.');
        return;
      }

      const existingUser: User = {
        id: 1,
        username: email.includes('@') ? email.split('@')[0] : email,
        email: email.trim().toLowerCase(),
        created_at: '2026-09-15 09:00:00',
      };
      onLoginSuccess(existingUser);
    }
  };

  const handleDemoLogin = () => {
    const demoUser: User = {
      id: 1,
      username: 'Demo Student',
      email: 'student@college.edu',
      created_at: '2026-09-15 09:00:00',
    };
    onLoginSuccess(demoUser);
  };

  return (
    <div className="max-w-md mx-auto py-8 px-4 animate-in fade-in duration-200">
      
      {/* Brand Icon Header */}
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm">
          <Timer className="w-6 h-6 stroke-[2.2]" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">
          {mode === 'login' ? 'Sign In to FocusTimer' : 'Create Student Account'}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {mode === 'login'
            ? 'Enter your credentials to access your focus sessions and block list.'
            : 'Start building deep work habits and shielding yourself from online distractions.'}
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        
        {/* Mode Switcher Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-lg mb-6">
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(''); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              mode === 'login' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMsg(''); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              mode === 'register' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Register
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name / Username
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="e.g. Alex Student"
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="student@college.edu"
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
          >
            <span>{mode === 'login' ? 'Sign In to Focus' : 'Complete Registration'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* 1-Click Demo Login Button */}
        <div className="mt-5 pt-5 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500 mb-2">College Project Evaluation Shortcut:</p>
          <button
            type="button"
            onClick={handleDemoLogin}
            className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>1-Click Demo Login (student@college.edu)</span>
          </button>
        </div>

      </div>

    </div>
  );
};
