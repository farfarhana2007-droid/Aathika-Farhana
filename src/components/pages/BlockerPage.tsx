import React, { useState } from 'react';
import { BlockedSite } from '../../types';
import { 
  ShieldAlert, 
  Plus, 
  Trash2, 
  Power, 
  Check, 
  Globe, 
  Sparkles,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

interface BlockerPageProps {
  blockedSites: BlockedSite[];
  onAddSite: (domain: string, category: string) => void;
  onToggleSite: (id: number) => void;
  onDeleteSite: (id: number) => void;
  onTestAttempt: (domain: string) => void;
}

export const BlockerPage: React.FC<BlockerPageProps> = ({
  blockedSites,
  onAddSite,
  onToggleSite,
  onDeleteSite,
  onTestAttempt,
}) => {
  const [domainInput, setDomainInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('Social Media');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    let clean = domainInput.trim().toLowerCase();
    clean = clean.replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0];

    if (!clean || !clean.includes('.')) {
      setErrorMsg('Please enter a valid website domain name (e.g. instagram.com).');
      return;
    }

    if (blockedSites.some(s => s.domain_name.toLowerCase() === clean)) {
      setErrorMsg('This website is already on your block list.');
      return;
    }

    onAddSite(clean, categoryInput);
    setDomainInput('');
  };

  const quickPresets = [
    { domain: 'instagram.com', category: 'Social Media' },
    { domain: 'youtube.com', category: 'Entertainment' },
    { domain: 'tiktok.com', category: 'Social Media' },
    { domain: 'reddit.com', category: 'Social Media' },
    { domain: 'twitter.com', category: 'Social Media' },
    { domain: 'netflix.com', category: 'Entertainment' },
    { domain: 'twitch.tv', category: 'Gaming' },
    { domain: 'discord.com', category: 'Social Media' },
  ];

  const totalAttemptsPrevented = blockedSites.reduce((acc, s) => acc + s.attempts_prevented, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Distraction Blocker
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure the websites and web services to block while you are in focus mode.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-mono text-slate-700">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Total Interventions: <strong>{totalAttemptsPrevented}</strong></span>
        </div>
      </div>

      {/* Add Website Box */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Plus className="w-4 h-4 text-indigo-600" />
          <span>Add Website to Block List</span>
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Globe className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={domainInput}
              onChange={e => {
                setDomainInput(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="e.g. reddit.com or twitch.tv"
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <select
            value={categoryInput}
            onChange={e => setCategoryInput(e.target.value)}
            className="py-2 px-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="Social Media">Social Media</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Gaming">Gaming</option>
            <option value="News & Shopping">News & Shopping</option>
            <option value="Custom">Custom</option>
          </select>

          <button
            type="submit"
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm shadow-xs transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add Website</span>
          </button>
        </form>

        {errorMsg && (
          <p className="text-xs text-rose-600 font-medium mt-2">{errorMsg}</p>
        )}

        {/* Quick Presets */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <span className="text-xs text-slate-400 mr-2">Popular Distractors:</span>
          <div className="inline-flex flex-wrap gap-1.5 mt-1 sm:mt-0">
            {quickPresets.map(preset => {
              const alreadyAdded = blockedSites.some(s => s.domain_name.toLowerCase() === preset.domain);
              if (alreadyAdded) return null;
              return (
                <button
                  key={preset.domain}
                  type="button"
                  onClick={() => onAddSite(preset.domain, preset.category)}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs transition-colors font-mono flex items-center gap-1"
                >
                  <span>+ {preset.domain}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Block List Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Active Block List ({blockedSites.length})
            </h2>
            <p className="text-xs text-slate-500">
              Websites currently shielded during your focus sessions
            </p>
          </div>
        </div>

        {blockedSites.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/70 border-b border-slate-200 text-xs font-medium text-slate-500">
                <tr>
                  <th className="py-3 px-4">Domain Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Shield Status</th>
                  <th className="py-3 px-4">Attempts Defended</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {blockedSites.map(site => (
                  <tr key={site.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono font-semibold text-slate-900">
                        {site.domain_name}
                      </div>
                      <div className="text-xs text-slate-400">
                        Added on {site.created_at.slice(0, 10)}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-xs text-slate-600 font-medium">
                        {site.category}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                        site.is_active
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${site.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                        <span>{site.is_active ? 'Active Shield' : 'Paused'}</span>
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-sm font-semibold text-slate-700 tabular-nums">
                      {site.attempts_prevented} times
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        {/* Test intercept button */}
                        <button
                          onClick={() => onTestAttempt(site.domain_name)}
                          className="px-2.5 py-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded transition-colors"
                          title="Simulate accessing this blocked website"
                        >
                          Test Shield
                        </button>

                        {/* Toggle active button */}
                        <button
                          onClick={() => onToggleSite(site.id)}
                          className={`p-1.5 rounded transition-colors ${
                            site.is_active
                              ? 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={site.is_active ? 'Temporarily pause shield' : 'Reactivate shield'}
                        >
                          <Power className="w-4 h-4" />
                        </button>

                        {/* Delete button */}
                        <button
                          onClick={() => onDeleteSite(site.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Remove website from list"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-sm text-slate-500 mb-3">No websites currently on your block list.</p>
          </div>
        )}
      </div>

    </div>
  );
};
