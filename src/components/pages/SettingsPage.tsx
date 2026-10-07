import React, { useState } from 'react';
import { UserSettings } from '../../types';
import { 
  Settings, 
  Volume2, 
  Save, 
  RotateCcw, 
  ShieldAlert, 
  Check, 
  Clock 
} from 'lucide-react';
import { sound } from '../../utils/audio';

interface SettingsPageProps {
  settings: UserSettings;
  onSaveSettings: (newSettings: UserSettings) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  settings,
  onSaveSettings,
}) => {
  const [formData, setFormData] = useState<UserSettings>({ ...settings });
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleResetDefaults = () => {
    const defaults: UserSettings = {
      focus_duration: 25,
      short_break_duration: 5,
      long_break_duration: 15,
      long_break_interval: 4,
      daily_goal_minutes: 120,
      sound_enabled: true,
      strict_mode: true,
      auto_start_breaks: false,
    };
    setFormData(defaults);
    onSaveSettings(defaults);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const testAudio = () => {
    sound.playFocusComplete();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Timer & Blocker Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Customize your Pomodoro intervals, daily targets, and distraction blocker enforcement.
        </p>
      </div>

      {isSaved && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Your timer preferences have been updated and saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-6 shadow-xs">
        
        {/* Durations Section */}
        <div>
          <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>Pomodoro Interval Durations (Minutes)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Focus Duration
              </label>
              <input
                type="number"
                min={5}
                max={120}
                value={formData.focus_duration}
                onChange={e => setFormData({ ...formData, focus_duration: parseInt(e.target.value) || 25 })}
                className="w-full py-2 px-3 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:border-indigo-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Default: 25 mins</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Short Break
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={formData.short_break_duration}
                onChange={e => setFormData({ ...formData, short_break_duration: parseInt(e.target.value) || 5 })}
                className="w-full py-2 px-3 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:border-indigo-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Default: 5 mins</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Long Break
              </label>
              <input
                type="number"
                min={5}
                max={60}
                value={formData.long_break_duration}
                onChange={e => setFormData({ ...formData, long_break_duration: parseInt(e.target.value) || 15 })}
                className="w-full py-2 px-3 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:border-indigo-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Default: 15 mins</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-5">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Daily Focus Target Goal (Minutes)
          </label>
          <div className="max-w-xs">
            <input
              type="number"
              min={15}
              max={600}
              step={15}
              value={formData.daily_goal_minutes}
              onChange={e => setFormData({ ...formData, daily_goal_minutes: parseInt(e.target.value) || 120 })}
              className="w-full py-2 px-3 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            Used to compute your daily progress ring on the dashboard (e.g. 120 mins = 2 hours).
          </span>
        </div>

        {/* Preferences Toggles */}
        <div className="border-t border-slate-100 pt-5 space-y-4">
          <h2 className="text-sm font-bold text-slate-900">
            Audio & Enforcement Behaviors
          </h2>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-800">
                Play Audio Chimes on Session Completion
              </div>
              <div className="text-xs text-slate-500">
                Synthesized bell sounds via Web Audio API when focus or break concludes.
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={testAudio}
                className="text-xs text-indigo-600 hover:underline px-2 py-1"
              >
                Test Sound
              </button>
              <input
                type="checkbox"
                checked={formData.sound_enabled}
                onChange={e => setFormData({ ...formData, sound_enabled: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-800">
                Strict Blocker Mode
              </div>
              <div className="text-xs text-slate-500">
                Prevents disabling websites from the blocklist while a focus countdown is running.
              </div>
            </div>
            <input
              type="checkbox"
              checked={formData.strict_mode}
              onChange={e => setFormData({ ...formData, strict_mode: e.target.checked })}
              className="w-4 h-4 text-indigo-600 rounded"
            />
          </div>
        </div>

        {/* Submit Actions */}
        <div className="border-t border-slate-100 pt-5 flex items-center justify-between">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restore Defaults</span>
          </button>

          <button
            type="submit"
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm shadow-xs transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>

      </form>

    </div>
  );
};
