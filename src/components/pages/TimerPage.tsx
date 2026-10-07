import React, { useState, useEffect, useRef } from 'react';
import { BlockedSite, FocusSession, SessionType, UserSettings } from '../../types';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ShieldAlert, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  Sparkles,
  Info
} from 'lucide-react';
import { sound } from '../../utils/audio';

interface TimerPageProps {
  settings: UserSettings;
  blockedSites: BlockedSite[];
  onSessionComplete: (session: Omit<FocusSession, 'id'>) => void;
  onDistractionAttempt: (domain: string) => void;
  onBreakReminder: (minutes: number) => void;
}

export const TimerPage: React.FC<TimerPageProps> = ({
  settings,
  blockedSites,
  onSessionComplete,
  onDistractionAttempt,
  onBreakReminder,
}) => {
  const [sessionType, setSessionType] = useState<SessionType>('focus');
  const [sessionNotes, setSessionNotes] = useState('Operating Systems: Process Synchronization Lab');
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(settings.sound_enabled);

  // Custom duration override (in minutes)
  const [customMinutes, setCustomMinutes] = useState<number>(settings.focus_duration);
  const [timeLeft, setTimeLeft] = useState<number>(settings.focus_duration * 60);
  const [totalSeconds, setTotalSeconds] = useState<number>(settings.focus_duration * 60);

  // Test blocker URL state
  const [testDomainInput, setTestDomainInput] = useState('');

  // Refs for precise interval calculation
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const sessionStartTimeRef = useRef<string | null>(null);

  // Sync with session type changes
  const switchSessionType = (type: SessionType) => {
    if (isRunning) {
      if (!confirm('A session is currently running. Do you want to switch and reset timer?')) {
        return;
      }
    }
    stopTimer();
    setSessionType(type);
    let targetMins = settings.focus_duration;
    if (type === 'short_break') targetMins = settings.short_break_duration;
    if (type === 'long_break') targetMins = settings.long_break_duration;
    
    setCustomMinutes(targetMins);
    setTimeLeft(targetMins * 60);
    setTotalSeconds(targetMins * 60);
  };

  const handleCustomDurationChange = (mins: number) => {
    if (mins < 1 || mins > 180) return;
    setCustomMinutes(mins);
    if (!isRunning) {
      setTimeLeft(mins * 60);
      setTotalSeconds(mins * 60);
    }
  };

  const startTimer = () => {
    if (!isRunning && !isPaused) {
      sessionStartTimeRef.current = new Date().toISOString().slice(0, 19).replace('T', ' ');
    }
    setIsRunning(true);
    setIsPaused(false);
  };

  const pauseTimer = () => {
    setIsRunning(false);
    setIsPaused(true);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const resumeTimer = () => {
    setIsRunning(true);
    setIsPaused(false);
  };

  const resetTimer = () => {
    stopTimer();
    setTimeLeft(totalSeconds);
  };

  const stopTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  // Main countdown loop
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, totalSeconds, sessionType]);

  const handleComplete = () => {
    stopTimer();
    if (soundEnabled) {
      if (sessionType === 'focus') {
        sound.playFocusComplete();
      } else {
        sound.playBreakComplete();
      }
    }

    const durationMins = Math.round(totalSeconds / 60);
    const completedSession: Omit<FocusSession, 'id'> = {
      user_id: 1,
      session_type: sessionType,
      target_duration: durationMins,
      actual_duration: durationMins,
      status: 'completed',
      notes: sessionNotes,
      started_at: sessionStartTimeRef.current || new Date().toISOString().slice(0, 19).replace('T', ' '),
      completed_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
    };

    onSessionComplete(completedSession);

    if (sessionType === 'focus') {
      onBreakReminder(settings.short_break_duration);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Circular progress calculation
  const progressPercent = totalSeconds > 0 ? ((totalSeconds - timeLeft) / totalSeconds) * 100 : 0;
  const strokeDashoffset = 440 - (440 * progressPercent) / 100;

  // Active sites for distraction testing
  const activeBlockedSites = blockedSites.filter(s => s.is_active);

  const handleTriggerTest = (domain: string) => {
    if (soundEnabled) {
      sound.playDistractionAlert();
    }
    onDistractionAttempt(domain);
  };

  const handleCustomDomainTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testDomainInput.trim()) return;
    const cleaned = testDomainInput.trim().toLowerCase().replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0];
    handleTriggerTest(cleaned);
    setTestDomainInput('');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-200">
      
      {/* Session Mode Selector Tabs */}
      <div className="flex justify-center">
        <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            onClick={() => switchSessionType('focus')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
              sessionType === 'focus'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Focus ({settings.focus_duration}m)
          </button>
          <button
            onClick={() => switchSessionType('short_break')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
              sessionType === 'short_break'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Short Break ({settings.short_break_duration}m)
          </button>
          <button
            onClick={() => switchSessionType('long_break')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
              sessionType === 'long_break'
                ? 'bg-white text-amber-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Long Break ({settings.long_break_duration}m)
          </button>
        </div>
      </div>

      {/* Main Focus Timer Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 text-center shadow-xs relative overflow-hidden">
        
        {/* Sound toggle button in corner */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors text-xs flex items-center gap-1"
            title={soundEnabled ? 'Mute chimes' : 'Enable chimes'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            <span className="hidden sm:inline font-mono">{soundEnabled ? 'Sound ON' : 'Muted'}</span>
          </button>
        </div>

        {/* Task Objective Input */}
        <div className="max-w-md mx-auto mb-6">
          <input
            type="text"
            value={sessionNotes}
            onChange={e => setSessionNotes(e.target.value)}
            disabled={isRunning}
            placeholder="What is your focus objective? (e.g. Study OS Scheduling)"
            className="w-full text-center py-2 px-3 bg-slate-50 border border-dashed border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
          />
        </div>

        {/* Circular Display with Tabular Numerals */}
        <div className="relative w-64 h-64 mx-auto flex items-center justify-center my-4">
          {/* SVG Progress Circle */}
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
            <circle
              cx="80"
              cy="80"
              r="70"
              className="stroke-slate-100"
              strokeWidth="6"
              fill="transparent"
            />
            <circle
              cx="80"
              cy="80"
              r="70"
              className={`transition-all duration-500 ${
                sessionType === 'focus' 
                  ? 'stroke-indigo-600' 
                  : sessionType === 'short_break'
                  ? 'stroke-emerald-600'
                  : 'stroke-amber-600'
              }`}
              strokeWidth="6"
              strokeDasharray={440}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Centered Time Numbers */}
          <div className="absolute flex flex-col items-center justify-center">
            <div className="text-5xl sm:text-6xl font-bold font-mono tabular-nums text-slate-900 tracking-tight">
              {formatTime(timeLeft)}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">
              {isRunning 
                ? (sessionType === 'focus' ? 'Deep Work Running' : 'Recharging...')
                : isPaused
                ? 'Session Paused'
                : 'Ready to Start'}
            </div>
          </div>
        </div>

        {/* Duration Customization Pills when Idle */}
        {!isRunning && !isPaused && (
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-xs text-slate-400">Duration:</span>
            {[15, 25, 30, 45, 60].map(mins => (
              <button
                key={mins}
                onClick={() => handleCustomDurationChange(mins)}
                className={`px-2.5 py-1 text-xs font-mono tabular-nums rounded-md transition-colors ${
                  customMinutes === mins
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {mins}m
              </button>
            ))}
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-3">
          {!isRunning && !isPaused ? (
            <button
              onClick={startTimer}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-base shadow-sm hover:shadow transition-all flex items-center gap-2 active:scale-95"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Start Focus Session</span>
            </button>
          ) : isRunning ? (
            <button
              onClick={pauseTimer}
              className="px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-base border border-slate-200 transition-all flex items-center gap-2"
            >
              <Pause className="w-5 h-5 fill-current" />
              <span>Pause</span>
            </button>
          ) : (
            <button
              onClick={resumeTimer}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-base shadow-sm transition-all flex items-center gap-2"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Resume</span>
            </button>
          )}

          <button
            onClick={resetTimer}
            className="p-3 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors border border-transparent hover:border-slate-200"
            title="Reset Timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Distraction Shield Status Badge */}
        <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-600">
          <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
          <span>Distraction Blocker Shield:</span>
          <strong className="text-slate-900 font-medium">
            {activeBlockedSites.length} websites protected
          </strong>
        </div>

      </div>

      {/* Distraction Blocker Shield Tester */}
      <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>Distraction Shield Interceptor Simulator</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              During study sessions, test how the blocker warns you when you attempt to access distracting websites.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400 hidden sm:inline">
            Active: {activeBlockedSites.length}
          </span>
        </div>

        {/* Quick Click Attempt Buttons */}
        <div className="flex flex-wrap gap-2 pt-1">
          {activeBlockedSites.map(site => (
            <button
              key={site.id}
              onClick={() => handleTriggerTest(site.domain_name)}
              className="px-3 py-1.5 bg-white hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 transition-colors shadow-2xs flex items-center gap-1.5"
            >
              <span>Test: {site.domain_name}</span>
            </button>
          ))}
        </div>

        {/* Test custom URL input */}
        <form onSubmit={handleCustomDomainTest} className="flex gap-2 pt-2">
          <input
            type="text"
            value={testDomainInput}
            onChange={e => setTestDomainInput(e.target.value)}
            placeholder="Type any website to test shield (e.g. twitter.com)..."
            className="flex-1 py-1.5 px-3 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-500 font-mono"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors whitespace-nowrap"
          >
            Attempt Access
          </button>
        </form>

      </div>

    </div>
  );
};
