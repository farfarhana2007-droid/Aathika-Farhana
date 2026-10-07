import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

interface DistractionModalProps {
  isOpen: boolean;
  blockedDomain: string;
  remainingTimeFormatted: string;
  onStayFocused: () => void;
}

export const DistractionModal: React.FC<DistractionModalProps> = ({
  isOpen,
  blockedDomain,
  remainingTimeFormatted,
  onStayFocused,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center border border-slate-200 shadow-2xl">
        <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8 stroke-[2.2]" />
        </div>

        <h3 className="text-xl font-bold text-slate-900 mb-1">
          Distraction Shield Intercepted!
        </h3>
        
        <p className="text-sm text-slate-600 mb-4">
          You attempted to open <span className="font-mono font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">{blockedDomain}</span>, which is on your active block list.
        </p>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 mb-6 text-left">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Active Focus Session Status
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-700 font-medium">Session in progress:</span>
            <span className="font-mono tabular-nums text-indigo-600 font-bold text-base">
              {remainingTimeFormatted} remaining
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            "Deep focus produces high-value results. Resist the urge for instant novelty."
          </p>
        </div>

        <button
          onClick={onStayFocused}
          className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Stay on Track & Return to Focus</span>
        </button>
      </div>
    </div>
  );
};
