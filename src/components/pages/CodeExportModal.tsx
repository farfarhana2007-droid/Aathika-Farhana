import React, { useState } from 'react';
import { flaskProjectFiles, ProjectFile } from '../../data/flaskProjectFiles';
import { downloadProjectZip, downloadSingleFile } from '../../utils/zipExport';
import { 
  Code2, 
  Download, 
  Copy, 
  Check, 
  X, 
  FileCode, 
  FolderTree, 
  BookOpen, 
  Database, 
  Server, 
  ShieldCheck, 
  HelpCircle 
} from 'lucide-react';

interface CodeExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CodeExportModal: React.FC<CodeExportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedFile, setSelectedFile] = useState<ProjectFile>(flaskProjectFiles[0]);
  const [activeTab, setActiveTab] = useState<'files' | 'viva' | 'tree'>('files');
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadAllZip = async () => {
    try {
      setIsDownloading(true);
      await downloadProjectZip();
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadFile = () => {
    downloadSingleFile(selectedFile.name, selectedFile.content);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-6xl w-full h-[90vh] flex flex-col border border-slate-200 shadow-2xl overflow-hidden">
        
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Python Flask & SQLite3 Project Submission Hub
              </h2>
              <p className="text-xs text-slate-500">
                All production files, database initializers, and documentation for VS Code and College Viva
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadAllZip}
              disabled={isDownloading}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloading ? 'Packaging...' : 'Download Full Project (.ZIP)'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-2 border-b border-slate-200 bg-white flex gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('files')}
            className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'files'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>Source Code Inspector ({flaskProjectFiles.length} files)</span>
          </button>

          <button
            onClick={() => setActiveTab('tree')}
            className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'tree'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FolderTree className="w-4 h-4" />
            <span>Folder Structure & VS Code Setup</span>
          </button>

          <button
            onClick={() => setActiveTab('viva')}
            className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'viva'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>College Viva & Architecture Defense</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 flex overflow-hidden">
          
          {activeTab === 'files' && (
            <>
              {/* Left File List Sidebar */}
              <div className="w-64 border-r border-slate-200 bg-slate-50 overflow-y-auto p-3 space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                  Project Files
                </div>
                {flaskProjectFiles.map(file => (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors flex items-center justify-between ${
                      selectedFile.path === file.path
                        ? 'bg-indigo-50 text-indigo-700 font-semibold'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="truncate">{file.path}</span>
                    <span className="text-[10px] text-slate-400 uppercase ml-1 shrink-0">
                      {file.language}
                    </span>
                  </button>
                ))}
              </div>

              {/* Right Code Viewer */}
              <div className="flex-1 flex flex-col bg-slate-900 text-slate-100 overflow-hidden">
                <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-indigo-400">{selectedFile.path}</span>
                    <span className="text-slate-500 text-[11px] ml-2 hidden sm:inline">{selectedFile.description}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopy}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-200 flex items-center gap-1 transition-colors"
                      title="Copy code to clipboard"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                    </button>

                    <button
                      onClick={handleDownloadFile}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-200 flex items-center gap-1 transition-colors"
                      title="Download file"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>

                <div className="flex-1 p-4 overflow-auto font-mono text-xs leading-relaxed selection:bg-indigo-700 selection:text-white">
                  <pre>{selectedFile.content}</pre>
                </div>
              </div>
            </>
          )}

          {activeTab === 'tree' && (
            <div className="flex-1 p-6 overflow-y-auto bg-slate-50 space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-2">
                  Complete Project Folder Structure
                </h3>
                <pre className="font-mono text-xs bg-slate-900 text-emerald-400 p-4 rounded-lg overflow-x-auto">
{`focus_timer_project/
├── app.py                     # Flask controller, routes, sessions & REST endpoints
├── database.py                # SQLite schema creation & seed demo data
├── requirements.txt           # Flask 3.0.3, Werkzeug 3.0.3
├── README.md                  # Comprehensive documentation & setup instructions
├── templates/
│   ├── base.html              # Master layout with navigation & flash alerts
│   ├── login.html             # User authentication login
│   ├── register.html          # User account creation
│   ├── dashboard.html         # Productivity overview & KPIs
│   ├── timer.html             # Pomodoro focus timer & shield interceptor
│   ├── blocker.html           # Distraction blocklist management
│   ├── history.html           # Focus session log table
│   ├── statistics.html        # Daily and weekly analytics & charts
│   └── settings.html          # Custom duration & sound preferences
└── static/
    ├── css/
    │   └── style.css          # Responsive stylesheet
    └── js/
        ├── main.js            # General UI and alert handlers
        └── timer.js           # Pomodoro timing engine & blocker interceptor`}
                </pre>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
                <h3 className="text-sm font-bold text-slate-900">
                  Step-by-Step VS Code Execution Commands
                </h3>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-semibold text-slate-700">1. Create Python Virtual Environment:</span>
                    <pre className="bg-slate-100 p-2 rounded font-mono mt-1 text-slate-800">python -m venv venv</pre>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">2. Activate Environment:</span>
                    <pre className="bg-slate-100 p-2 rounded font-mono mt-1 text-slate-800"># Windows: venv\Scripts\activate
# macOS / Linux: source venv/bin/activate</pre>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">3. Install Requirements:</span>
                    <pre className="bg-slate-100 p-2 rounded font-mono mt-1 text-slate-800">pip install -r requirements.txt</pre>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">4. Initialize SQLite3 Database with Seed Data:</span>
                    <pre className="bg-slate-100 p-2 rounded font-mono mt-1 text-slate-800">python database.py</pre>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">5. Run on Localhost:5000:</span>
                    <pre className="bg-slate-100 p-2 rounded font-mono mt-1 text-slate-800">python app.py</pre>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'viva' && (
            <div className="flex-1 p-6 overflow-y-auto bg-slate-50 space-y-6">
              
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <Database className="w-4 h-4 text-indigo-600" />
                  <span>SQLite3 Database Relational Schema Explanation</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  The SQLite database <code>focus_timer.db</code> enforces foreign keys and consists of 4 normalized tables:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <strong className="text-slate-900 font-mono">1. users</strong>
                    <p className="text-slate-600 text-[11px] mt-1">
                      Stores user credentials with <code>password_hash</code> (Werkzeug pbkdf2/scrypt), personal duration preferences (focus_time_pref, break_time_pref, long_break_pref), and sound preferences.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <strong className="text-slate-900 font-mono">2. focus_sessions</strong>
                    <p className="text-slate-600 text-[11px] mt-1">
                      Tracks every timer session with foreign key <code>user_id</code>, session_type ('focus', 'short_break', 'long_break'), target and actual duration, status ('completed', 'interrupted'), and started/completed timestamps.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <strong className="text-slate-900 font-mono">3. blocked_sites</strong>
                    <p className="text-slate-600 text-[11px] mt-1">
                      Maintains domain block list per user (e.g. instagram.com, youtube.com), category tag, active shield toggle (is_active), and temptation counter (attempts_prevented).
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <strong className="text-slate-900 font-mono">4. productivity_stats</strong>
                    <p className="text-slate-600 text-[11px] mt-1">
                      Aggregates daily focus minutes, completed sessions, interrupted sessions, and distractions blocked per calendar date for high-performance dashboard queries without costly table scans.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-indigo-600" />
                  <span>College Viva Examination Q&A</span>
                </h3>

                <div className="space-y-4 text-xs">
                  <div className="border-l-2 border-indigo-500 pl-3">
                    <strong className="text-slate-900">Q1: How does the Distraction Blocker mechanism work in a web environment?</strong>
                    <p className="text-slate-600 mt-1">
                      <strong>Answer:</strong> The backend stores the user's active blocked domain list in SQLite. The frontend timing script runs an active shield state. When an attempt occurs (or simulated via web interceptor), it matches against blocked domains, halts the interaction, plays an auditory buzz alert via Web Audio API, and immediately increments the temptation audit log in <code>productivity_stats</code> via a background REST API call.
                    </p>
                  </div>

                  <div className="border-l-2 border-indigo-500 pl-3">
                    <strong className="text-slate-900">Q2: Why was SQLite3 chosen over MySQL or PostgreSQL for this project?</strong>
                    <p className="text-slate-600 mt-1">
                      <strong>Answer:</strong> SQLite3 is serverless, zero-configuration, and self-contained in a single portable file (<code>focus_timer.db</code>). It provides ACID guarantees, fast in-process query execution, and is ideal for desktop and college evaluation environments without requiring external database servers to be installed.
                    </p>
                  </div>

                  <div className="border-l-2 border-indigo-500 pl-3">
                    <strong className="text-slate-900">Q3: How are user sessions and security handled?</strong>
                    <p className="text-slate-600 mt-1">
                      <strong>Answer:</strong> Flask cryptographically signed cookies (via <code>app.secret_key</code>) maintain the authenticated <code>user_id</code>. Custom decorator <code>@login_required</code> restricts unauthorized access. Passwords are never stored as plain text, using secure salt and hash functions from <code>werkzeug.security</code>.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
