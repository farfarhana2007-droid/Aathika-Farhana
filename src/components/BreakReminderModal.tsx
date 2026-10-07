import React from 'react';
import { Sparkles, Coffee, ArrowRight } from 'lucide-react';

interface BreakReminderModalProps {
  isOpen: boolean;
  completedMinutes: number;
  breakDuration: number;
  onStartBreak: () => void;
  onDismiss: () => void;
}

export const BreakReminderModal: React.FC<BreakReminderModalProps> = ({
  isOpen,
  completedMinutes,
  breakDuration,
  onStartBreak,
  onDismiss,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center border border-slate-200 shadow-2xl">
        <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 stroke-[2.2]" />
        </div>

        <h3 className="text-xl font-bold text-slate-900 mb-1">
          Focus Session Completed!
        </h3>
        
        <p className="text-sm text-slate-600 mb-4">
          Awesome work! You just completed <strong className="text-slate-900 font-mono tabular-nums">{completedMinutes} minutes</strong> of concentrated, distraction-free study.
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 mb-6 text-left flex items-start gap-3">
          <div className="p-2 rounded-lg bg-amber-100 text-amber-700 mt-0.5">
            <Coffee className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-amber-900">
              Break Reminder (Pomodoro Protocol)
            </div>
            <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
              Step away from your screen for {breakDuration} minutes. Hydrate, stretch your back, and let your brain consolidate what you learned.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <button
            onClick={onStartBreak}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <Coffee className="w-4 h-4" />
            <span>Start {breakDuration}-Minute Break Timer</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onDismiss}
            className="w-full py-2 px-4 text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium rounded-xl text-xs transition-colors"
          >
            I will take a break later (Dismiss)
          </button>
        </div>
      </div>
    </div>
  );
};
