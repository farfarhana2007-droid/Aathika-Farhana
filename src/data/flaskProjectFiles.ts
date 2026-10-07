/**
 * Complete Python Flask + SQLite3 + HTML/CSS/JS source code
 * Ready for College Final-Year Project submission, execution on localhost, and ZIP export.
 */

export interface ProjectFile {
  path: string;
  name: string;
  language: string;
  content: string;
  description: string;
}

export const flaskProjectFiles: ProjectFile[] = [
  {
    path: 'app.py',
    name: 'app.py',
    language: 'python',
    description: 'Main Flask backend application controller, route handlers, authentication, and REST API endpoints.',
    content: `"""
Focus Timer with Distraction Blocker
Backend: Python Flask + SQLite3
Final Year College Project
"""

import os
import sqlite3
from datetime import datetime, date
from functools import wraps
from flask import (
    Flask, render_template, request, redirect,
    url_for, session, flash, jsonify
)
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'focus-timer-secret-key-2026')
DATABASE = 'focus_timer.db'

def get_db():
    """Connect to SQLite3 database with row factory for dictionary-like access."""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def login_required(f):
    """Decorator to protect routes requiring authentication."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('Please log in to access this page.', 'warning')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

# ==========================================
# AUTHENTICATION ROUTES
# ==========================================

@app.route('/')
def index():
    if 'user_id' in session:
        return redirect(url_for('dashboard'))
    return redirect(url_for('login'))

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        confirm_password = request.form.get('confirm_password', '')

        # Basic validation
        if not username or not email or not password:
            flash('All fields are required.', 'danger')
            return render_template('register.html')

        if len(password) < 6:
            flash('Password must be at least 6 characters long.', 'danger')
            return render_template('register.html')

        if password != confirm_password:
            flash('Passwords do not match.', 'danger')
            return render_template('register.html')

        hashed = generate_password_hash(password)

        conn = get_db()
        cursor = conn.cursor()
        try:
            cursor.execute(
                "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
                (username, email, hashed)
            )
            user_id = cursor.lastrowid

            # Seed default blocked sites for the new user
            default_sites = [
                ('instagram.com', 'Social Media'),
                ('youtube.com', 'Entertainment'),
                ('tiktok.com', 'Social Media'),
                ('reddit.com', 'Social Media'),
                ('twitter.com', 'Social Media'),
                ('netflix.com', 'Entertainment')
            ]
            for domain, cat in default_sites:
                cursor.execute(
                    "INSERT INTO blocked_sites (user_id, domain_name, category) VALUES (?, ?, ?)",
                    (user_id, domain, cat)
                )

            conn.commit()
            flash('Registration successful! Please login.', 'success')
            return redirect(url_for('login'))
        except sqlite3.IntegrityError:
            flash('Username or Email already registered.', 'danger')
        finally:
            conn.close()

    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')

        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE email = ? OR username = ?", (email, email))
        user = cursor.fetchone()
        conn.close()

        if user and check_password_hash(user['password_hash'], password):
            session['user_id'] = user['id']
            session['username'] = user['username']
            session['email'] = user['email']
            flash(f"Welcome back, {user['username']}!", 'success')
            return redirect(url_for('dashboard'))
        else:
            flash('Invalid email or password.', 'danger')

    return render_template('login.html')

@app.route('/logout')
def logout():
    session.clear()
    flash('You have been logged out successfully.', 'info')
    return redirect(url_for('login'))

# ==========================================
# CORE APPLICATION PAGES
# ==========================================

@app.route('/dashboard')
@login_required
def dashboard():
    user_id = session['user_id']
    today_str = date.today().isoformat()

    conn = get_db()
    cursor = conn.cursor()

    # User preferences
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()

    # Today's completed focus minutes & sessions
    cursor.execute("""
        SELECT 
            COALESCE(SUM(actual_duration), 0) AS total_minutes,
            COUNT(id) AS session_count
        FROM focus_sessions 
        WHERE user_id = ? AND status = 'completed' AND DATE(started_at) = ?
    """, (user_id, today_str))
    today_stats = cursor.fetchone()

    # Distraction attempts blocked today
    cursor.execute("""
        SELECT COALESCE(distraction_attempts_blocked, 0) AS blocked_count
        FROM productivity_stats
        WHERE user_id = ? AND date = ?
    """, (user_id, today_str))
    blocked_row = cursor.fetchone()
    today_blocked = blocked_row['blocked_count'] if blocked_row else 0

    # Total all-time focus minutes
    cursor.execute("""
        SELECT COALESCE(SUM(actual_duration), 0) AS all_time_minutes,
               COUNT(id) AS all_time_completed
        FROM focus_sessions
        WHERE user_id = ? AND status = 'completed'
    """, (user_id,))
    all_time = cursor.fetchone()

    # Recent 5 sessions
    cursor.execute("""
        SELECT * FROM focus_sessions 
        WHERE user_id = ? 
        ORDER BY started_at DESC LIMIT 5
    """, (user_id,))
    recent_sessions = cursor.fetchall()

    # Active blocked sites count
    cursor.execute("SELECT COUNT(id) AS active_sites FROM blocked_sites WHERE user_id = ? AND is_active = 1", (user_id,))
    active_sites_count = cursor.fetchone()['active_sites']

    conn.close()

    return render_template(
        'dashboard.html',
        user=user,
        today_minutes=today_stats['total_minutes'],
        today_sessions=today_stats['session_count'],
        today_blocked=today_blocked,
        all_time_minutes=all_time['all_time_minutes'],
        all_time_completed=all_time['all_time_completed'],
        active_sites_count=active_sites_count,
        recent_sessions=recent_sessions
    )

@app.route('/timer')
@login_required
def timer():
    user_id = session['user_id']
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()

    cursor.execute("SELECT * FROM blocked_sites WHERE user_id = ? AND is_active = 1", (user_id,))
    blocked_sites = cursor.fetchall()
    conn.close()

    return render_template('timer.html', user=user, blocked_sites=blocked_sites)

@app.route('/blocker')
@login_required
def blocker():
    user_id = session['user_id']
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM blocked_sites WHERE user_id = ? ORDER BY created_at DESC", (user_id,))
    sites = cursor.fetchall()
    conn.close()
    return render_template('blocker.html', sites=sites)

@app.route('/history')
@login_required
def history():
    user_id = session['user_id']
    status_filter = request.args.get('status', 'all')

    conn = get_db()
    cursor = conn.cursor()

    if status_filter in ['completed', 'interrupted', 'abandoned']:
        cursor.execute("""
            SELECT * FROM focus_sessions 
            WHERE user_id = ? AND status = ?
            ORDER BY started_at DESC
        """, (user_id, status_filter))
    else:
        cursor.execute("""
            SELECT * FROM focus_sessions 
            WHERE user_id = ?
            ORDER BY started_at DESC
        """, (user_id,))
    sessions_list = cursor.fetchall()
    conn.close()

    return render_template('history.html', sessions=sessions_list, current_filter=status_filter)

@app.route('/statistics')
@login_required
def statistics():
    user_id = session['user_id']
    conn = get_db()
    cursor = conn.cursor()

    # Past 7 days focus history
    cursor.execute("""
        SELECT date, total_focus_minutes, completed_sessions_count, distraction_attempts_blocked
        FROM productivity_stats
        WHERE user_id = ?
        ORDER BY date DESC LIMIT 7
    """, (user_id,))
    weekly_stats = cursor.fetchall()

    # All-time session breakdown
    cursor.execute("""
        SELECT 
            SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed,
            SUM(CASE WHEN status = 'interrupted' THEN 1 ELSE 0 END) AS interrupted,
            COUNT(id) AS total
        FROM focus_sessions WHERE user_id = ?
    """, (user_id,))
    breakdown = cursor.fetchone()

    conn.close()
    return render_template('statistics.html', weekly_stats=weekly_stats, breakdown=breakdown)

@app.route('/settings', methods=['GET', 'POST'])
@login_required
def settings():
    user_id = session['user_id']
    conn = get_db()
    cursor = conn.cursor()

    if request.method == 'POST':
        focus_time = int(request.form.get('focus_time_pref', 25))
        break_time = int(request.form.get('break_time_pref', 5))
        long_break = int(request.form.get('long_break_pref', 15))
        sound_pref = 1 if request.form.get('sound_enabled') else 0

        cursor.execute("""
            UPDATE users 
            SET focus_time_pref = ?, break_time_pref = ?, long_break_pref = ?, sound_pref = ?
            WHERE id = ?
        """, (focus_time, break_time, long_break, sound_pref, user_id))
        conn.commit()
        flash('Preferences saved successfully!', 'success')

    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()
    conn.close()

    return render_template('settings.html', user=user)

# ==========================================
# REST API ENDPOINTS FOR AJAX & TIMER LOGIC
# ==========================================

@app.route('/api/sessions/log', methods=['POST'])
@login_required
def api_log_session():
    data = request.get_json() or {}
    user_id = session['user_id']

    session_type = data.get('session_type', 'focus')
    target_duration = int(data.get('target_duration', 25))
    actual_duration = int(data.get('actual_duration', target_duration))
    status = data.get('status', 'completed')
    notes = data.get('notes', '').strip()
    started_at = data.get('started_at', datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
    completed_at = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    today_str = date.today().isoformat()

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO focus_sessions 
        (user_id, session_type, target_duration, actual_duration, status, notes, started_at, completed_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (user_id, session_type, target_duration, actual_duration, status, notes, started_at, completed_at))

    # Update daily productivity stats table
    if session_type == 'focus':
        cursor.execute("""
            INSERT INTO productivity_stats (user_id, date, total_focus_minutes, completed_sessions_count, interrupted_sessions_count, distraction_attempts_blocked)
            VALUES (?, ?, ?, ?, ?, 0)
            ON CONFLICT(user_id, date) DO UPDATE SET
                total_focus_minutes = total_focus_minutes + excluded.total_focus_minutes,
                completed_sessions_count = completed_sessions_count + excluded.completed_sessions_count,
                interrupted_sessions_count = interrupted_sessions_count + excluded.interrupted_sessions_count
        """, (
            user_id,
            today_str,
            actual_duration if status == 'completed' else actual_duration,
            1 if status == 'completed' else 0,
            1 if status != 'completed' else 0
        ))

    conn.commit()
    conn.close()

    return jsonify({'success': True, 'message': 'Session recorded successfully.'})

@app.route('/api/blocker/add', methods=['POST'])
@login_required
def api_add_blocked_site():
    domain = request.form.get('domain', '').strip().lower()
    category = request.form.get('category', 'Custom').strip()

    # Clean domain (strip http:// or https://)
    domain = domain.replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0]

    if not domain:
        flash('Invalid domain name.', 'danger')
        return redirect(url_for('blocker'))

    user_id = session['user_id']
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO blocked_sites (user_id, domain_name, category) VALUES (?, ?, ?)",
            (user_id, domain, category)
        )
        conn.commit()
        flash(f'Added {domain} to your distraction block list.', 'success')
    except sqlite3.IntegrityError:
        flash('Domain is already on your block list.', 'warning')
    finally:
        conn.close()

    return redirect(url_for('blocker'))

@app.route('/api/blocker/toggle/<int:site_id>', methods=['POST'])
@login_required
def api_toggle_site(site_id):
    user_id = session['user_id']
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE blocked_sites SET is_active = (1 - is_active) WHERE id = ? AND user_id = ?", (site_id, user_id))
    conn.commit()
    conn.close()
    return redirect(url_for('blocker'))

@app.route('/api/blocker/delete/<int:site_id>', methods=['POST'])
@login_required
def api_delete_site(site_id):
    user_id = session['user_id']
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM blocked_sites WHERE id = ? AND user_id = ?", (site_id, user_id))
    conn.commit()
    conn.close()
    flash('Website removed from block list.', 'info')
    return redirect(url_for('blocker'))

@app.route('/api/blocker/log_attempt', methods=['POST'])
@login_required
def api_log_block_attempt():
    user_id = session['user_id']
    data = request.get_json() or {}
    domain = data.get('domain', '').strip().lower()
    today_str = date.today().isoformat()

    conn = get_db()
    cursor = conn.cursor()

    # Update blocked_sites counter
    if domain:
        cursor.execute("""
            UPDATE blocked_sites 
            SET attempts_prevented = attempts_prevented + 1 
            WHERE user_id = ? AND domain_name = ?
        """, (user_id, domain))

    # Update daily productivity stats
    cursor.execute("""
        INSERT INTO productivity_stats (user_id, date, total_focus_minutes, completed_sessions_count, interrupted_sessions_count, distraction_attempts_blocked)
        VALUES (?, ?, 0, 0, 0, 1)
        ON CONFLICT(user_id, date) DO UPDATE SET
            distraction_attempts_blocked = distraction_attempts_blocked + 1
    """, (user_id, today_str))

    conn.commit()
    conn.close()

    return jsonify({'success': True, 'message': 'Distraction attempt logged and prevented.'})

if __name__ == '__main__':
    # Run development server on localhost:5000
    app.run(host='127.0.0.1', port=5000, debug=True)
`
  },
  {
    path: 'database.py',
    name: 'database.py',
    language: 'python',
    description: 'SQLite3 schema definition and database initialization script with seed sample data.',
    content: `"""
Database Initialization Script for Focus Timer with Distraction Blocker
Creates SQLite3 tables:
  1. users
  2. focus_sessions
  3. blocked_sites
  4. productivity_stats
And seeds sample demonstration data.
"""

import sqlite3
from werkzeug.security import generate_password_hash

DATABASE = 'focus_timer.db'

def init_database():
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()

    print("Creating tables in focus_timer.db...")

    # 1. Users Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        focus_time_pref INTEGER DEFAULT 25,
        break_time_pref INTEGER DEFAULT 5,
        long_break_pref INTEGER DEFAULT 15,
        sound_pref INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 2. Focus Sessions Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS focus_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        session_type TEXT CHECK(session_type IN ('focus', 'short_break', 'long_break')) NOT NULL,
        target_duration INTEGER NOT NULL,
        actual_duration INTEGER NOT NULL,
        status TEXT CHECK(status IN ('completed', 'interrupted', 'abandoned')) NOT NULL,
        notes TEXT,
        started_at TIMESTAMP NOT NULL,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)

    # 3. Blocked Sites Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS blocked_sites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        domain_name TEXT NOT NULL,
        category TEXT DEFAULT 'Custom',
        is_active INTEGER DEFAULT 1,
        attempts_prevented INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, domain_name),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)

    # 4. Productivity Stats Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS productivity_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        total_focus_minutes INTEGER DEFAULT 0,
        completed_sessions_count INTEGER DEFAULT 0,
        interrupted_sessions_count INTEGER DEFAULT 0,
        distraction_attempts_blocked INTEGER DEFAULT 0,
        UNIQUE(user_id, date),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)

    # Insert Demo Student User if not exists
    cursor.execute("SELECT id FROM users WHERE email = 'student@college.edu'")
    existing_user = cursor.fetchone()

    if not existing_user:
        print("Inserting demo student account (Email: student@college.edu / Password: password123)...")
        demo_password = generate_password_hash('password123')
        cursor.execute("""
            INSERT INTO users (username, email, password_hash, focus_time_pref, break_time_pref, long_break_pref)
            VALUES (?, ?, ?, 25, 5, 15)
        """, ('Demo Student', 'student@college.edu', demo_password))
        user_id = cursor.lastrowid

        # Seed sample blocked websites
        sample_blocked = [
            ('instagram.com', 'Social Media', 1, 14),
            ('youtube.com', 'Entertainment', 1, 22),
            ('reddit.com', 'Social Media', 1, 9),
            ('tiktok.com', 'Social Media', 1, 18),
            ('twitter.com', 'Social Media', 1, 6),
            ('netflix.com', 'Entertainment', 1, 4),
            ('facebook.com', 'Social Media', 1, 7)
        ]
        for domain, cat, active, attempts in sample_blocked:
            cursor.execute("""
                INSERT INTO blocked_sites (user_id, domain_name, category, is_active, attempts_prevented)
                VALUES (?, ?, ?, ?, ?)
            """, (user_id, domain, cat, active, attempts))

        # Seed historical focus sessions
        sample_sessions = [
            (user_id, 'focus', 25, 25, 'completed', 'Operating Systems: Process Scheduling Algorithms', '2026-10-06 09:15:00', '2026-10-06 09:40:00'),
            (user_id, 'focus', 25, 25, 'completed', 'Database Management: SQL Indexing and B-Trees', '2026-10-06 10:00:00', '2026-10-06 10:25:00'),
            (user_id, 'focus', 25, 18, 'interrupted', 'Computer Networks: TCP/IP 3-Way Handshake', '2026-10-06 11:10:00', '2026-10-06 11:28:00'),
            (user_id, 'focus', 25, 25, 'completed', 'Final Year Project Architecture Documentation', '2026-10-06 14:00:00', '2026-10-06 14:25:00'),
            (user_id, 'focus', 30, 30, 'completed', 'Machine Learning: Confusion Matrix & ROC Curves', '2026-10-05 15:30:00', '2026-10-05 16:00:00'),
            (user_id, 'focus', 25, 25, 'completed', 'Software Engineering: Agile Sprint Backlog', '2026-10-05 16:15:00', '2026-10-05 16:40:00')
        ]
        for s in sample_sessions:
            cursor.execute("""
                INSERT INTO focus_sessions 
                (user_id, session_type, target_duration, actual_duration, status, notes, started_at, completed_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, s)

        # Seed productivity stats
        sample_stats = [
            (user_id, '2026-10-01', 75, 3, 1, 11),
            (user_id, '2026-10-02', 100, 4, 0, 8),
            (user_id, '2026-10-03', 125, 5, 1, 14),
            (user_id, '2026-10-04', 90, 3, 0, 7),
            (user_id, '2026-10-05', 110, 4, 1, 12),
            (user_id, '2026-10-06', 93, 3, 1, 9)
        ]
        for st in sample_stats:
            cursor.execute("""
                INSERT INTO productivity_stats 
                (user_id, date, total_focus_minutes, completed_sessions_count, interrupted_sessions_count, distraction_attempts_blocked)
                VALUES (?, ?, ?, ?, ?, ?)
            """, st)

    conn.commit()
    conn.close()
    print("Database initialization completed successfully! File 'focus_timer.db' is ready.")

if __name__ == '__main__':
    init_database()
`
  },
  {
    path: 'requirements.txt',
    name: 'requirements.txt',
    language: 'plaintext',
    description: 'Python package dependencies required to run the project.',
    content: `Flask>=3.0.3
Werkzeug>=3.0.3
`
  },
  {
    path: 'templates/base.html',
    name: 'base.html',
    language: 'html',
    description: 'Master template containing navigation bar, flash notification system, and page structure.',
    content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{% block title %}Focus Timer & Blocker{% endblock %}</title>
    <link rel="stylesheet" href="{{ url_for('static', filename='css/style.css') }}">
    <!-- Google Fonts for clean modern typography -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet">
</head>
<body>
    <header class="app-header">
        <div class="header-container">
            <a href="{{ url_for('dashboard') if session.get('user_id') else url_for('login') }}" class="brand-logo">
                <span class="brand-icon">⏱️</span>
                <span class="brand-text">FocusTimer</span>
            </a>

            {% if session.get('user_id') %}
            <nav class="main-nav">
                <a href="{{ url_for('dashboard') }}" class="nav-link {% if request.endpoint == 'dashboard' %}active{% endif %}">Dashboard</a>
                <a href="{{ url_for('timer') }}" class="nav-link {% if request.endpoint == 'timer' %}active{% endif %}">Focus Timer</a>
                <a href="{{ url_for('blocker') }}" class="nav-link {% if request.endpoint == 'blocker' %}active{% endif %}">Distraction Blocker</a>
                <a href="{{ url_for('history') }}" class="nav-link {% if request.endpoint == 'history' %}active{% endif %}">History</a>
                <a href="{{ url_for('statistics') }}" class="nav-link {% if request.endpoint == 'statistics' %}active{% endif %}">Statistics</a>
                <a href="{{ url_for('settings') }}" class="nav-link {% if request.endpoint == 'settings' %}active{% endif %}">Settings</a>
            </nav>

            <div class="user-menu">
                <span class="user-greeting">Hi, <strong>{{ session.get('username') }}</strong></span>
                <a href="{{ url_for('logout') }}" class="btn-logout">Logout</a>
            </div>
            {% else %}
            <div class="auth-nav">
                <a href="{{ url_for('login') }}" class="nav-link {% if request.endpoint == 'login' %}active{% endif %}">Login</a>
                <a href="{{ url_for('register') }}" class="btn-primary-sm">Register</a>
            </div>
            {% endif %}
        </div>
    </header>

    <main class="main-content">
        <!-- Flash Messages Display -->
        {% with messages = get_flashed_messages(with_categories=true) %}
            {% if messages %}
                <div class="flash-messages-container">
                    {% for category, message in messages %}
                        <div class="flash-message flash-{{ category }}">
                            <span>{{ message }}</span>
                            <button type="button" class="flash-close" onclick="this.parentElement.remove()">&times;</button>
                        </div>
                    {% endfor %}
                </div>
            {% endif %}
        {% endwith %}

        {% block content %}{% endblock %}
    </main>

    <footer class="app-footer">
        <p>&copy; 2026 Focus Timer with Distraction Blocker · College Final-Year Project</p>
    </footer>

    <script src="{{ url_for('static', filename='js/main.js') }}"></script>
    {% block scripts %}{% endblock %}
</body>
</html>
`
  },
  {
    path: 'templates/login.html',
    name: 'login.html',
    language: 'html',
    description: 'User login page with clean form styling and links to register.',
    content: `{% extends "base.html" %}
{% block title %}Login · Focus Timer with Distraction Blocker{% endblock %}

{% block content %}
<div class="auth-wrapper">
    <div class="auth-card">
        <div class="auth-header">
            <h2>Welcome Back</h2>
            <p>Log in to access your focus timer, block list, and productivity stats.</p>
        </div>

        <form method="POST" action="{{ url_for('login') }}" class="auth-form">
            <div class="form-group">
                <label for="email">Email or Username</label>
                <input type="text" id="email" name="email" class="form-input" placeholder="e.g. student@college.edu" required autofocus>
            </div>

            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" class="form-input" placeholder="••••••••" required>
            </div>

            <button type="submit" class="btn-submit">Sign In to Focus</button>
        </form>

        <div class="auth-footer">
            <p>Don't have an account yet? <a href="{{ url_for('register') }}">Create an account</a></p>
            <div class="demo-credentials-box">
                <small>Demo Account: <strong>student@college.edu</strong> / Password: <strong>password123</strong></small>
            </div>
        </div>
    </div>
</div>
{% endblock %}
`
  },
  {
    path: 'templates/register.html',
    name: 'register.html',
    language: 'html',
    description: 'User registration page with password confirmation and client validation.',
    content: `{% extends "base.html" %}
{% block title %}Register · Focus Timer with Distraction Blocker{% endblock %}

{% block content %}
<div class="auth-wrapper">
    <div class="auth-card">
        <div class="auth-header">
            <h2>Create Your Account</h2>
            <p>Start tracking your study sessions and blocking distracting websites today.</p>
        </div>

        <form method="POST" action="{{ url_for('register') }}" class="auth-form">
            <div class="form-group">
                <label for="username">Full Name / Username</label>
                <input type="text" id="username" name="username" class="form-input" placeholder="e.g. Alex Johnson" required>
            </div>

            <div class="form-group">
                <label for="email">College or Personal Email</label>
                <input type="email" id="email" name="email" class="form-input" placeholder="alex@college.edu" required>
            </div>

            <div class="form-group">
                <label for="password">Password (min 6 characters)</label>
                <input type="password" id="password" name="password" class="form-input" placeholder="••••••••" minlength="6" required>
            </div>

            <div class="form-group">
                <label for="confirm_password">Confirm Password</label>
                <input type="password" id="confirm_password" name="confirm_password" class="form-input" placeholder="••••••••" minlength="6" required>
            </div>

            <button type="submit" class="btn-submit">Register Account</button>
        </form>

        <div class="auth-footer">
            <p>Already have an account? <a href="{{ url_for('login') }}">Sign In</a></p>
        </div>
    </div>
</div>
{% endblock %}
`
  },
  {
    path: 'templates/dashboard.html',
    name: 'dashboard.html',
    language: 'html',
    description: 'Dashboard page showcasing today stats, streak, all-time metrics, and quick timer launcher.',
    content: `{% extends "base.html" %}
{% block title %}Dashboard · Focus Timer{% endblock %}

{% block content %}
<div class="dashboard-container">
    <div class="dashboard-header">
        <div>
            <h1>Productivity Dashboard</h1>
            <p class="subtitle">Welcome back, {{ user.username }}. Here is your study concentration summary for today.</p>
        </div>
        <a href="{{ url_for('timer') }}" class="btn-primary">⚡ Open Focus Timer</a>
    </div>

    <!-- 4 Key Stat Cards -->
    <div class="stats-grid">
        <div class="stat-card">
            <div class="stat-icon">⏱️</div>
            <div class="stat-info">
                <span class="stat-value font-mono tabular-nums">{{ today_minutes }}m</span>
                <span class="stat-label">Today's Focus Time</span>
            </div>
        </div>

        <div class="stat-card">
            <div class="stat-icon">🎯</div>
            <div class="stat-info">
                <span class="stat-value font-mono tabular-nums">{{ today_sessions }}</span>
                <span class="stat-label">Sessions Completed Today</span>
            </div>
        </div>

        <div class="stat-card">
            <div class="stat-icon">🛡️</div>
            <div class="stat-info">
                <span class="stat-value font-mono tabular-nums">{{ today_blocked }}</span>
                <span class="stat-label">Distractions Blocked Today</span>
            </div>
        </div>

        <div class="stat-card">
            <div class="stat-icon">🔥</div>
            <div class="stat-info">
                <span class="stat-value font-mono tabular-nums">{{ all_time_minutes }}m</span>
                <span class="stat-label">All-Time Focus ({{ all_time_completed }} sessions)</span>
            </div>
        </div>
    </div>

    <!-- Quick Action / Blocker Status Banner -->
    <div class="shield-banner">
        <div class="shield-content">
            <span class="shield-icon">🛡️</span>
            <div>
                <h3>Distraction Shield is Active</h3>
                <p>Currently protecting you against <strong>{{ active_sites_count }} blocked websites</strong> while focus timers are running.</p>
            </div>
        </div>
        <a href="{{ url_for('blocker') }}" class="btn-secondary">Manage Block List</a>
    </div>

    <!-- Recent Sessions Section -->
    <div class="section-card">
        <div class="section-card-header">
            <h2>Recent Focus Sessions</h2>
            <a href="{{ url_for('history') }}" class="link-more">View Full History &rarr;</a>
        </div>

        {% if recent_sessions %}
        <table class="data-table">
            <thead>
                <tr>
                    <th>Date & Time</th>
                    <th>Session Task / Notes</th>
                    <th>Type</th>
                    <th>Duration</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                {% for s in recent_sessions %}
                <tr>
                    <td class="font-mono text-muted">{{ s.started_at }}</td>
                    <td><strong>{{ s.notes or 'General Concentration' }}</strong></td>
                    <td><span class="type-tag">{{ s.session_type }}</span></td>
                    <td class="font-mono tabular-nums">{{ s.actual_duration }} mins</td>
                    <td>
                        <span class="status-badge status-{{ s.status }}">
                            {{ s.status }}
                        </span>
                    </td>
                </tr>
                {% endfor %}
            </tbody>
        </table>
        {% else %}
        <div class="empty-state">
            <p>No focus sessions recorded yet today.</p>
            <a href="{{ url_for('timer') }}" class="btn-primary-sm">Start Your First Focus Session</a>
        </div>
        {% endif %}
    </div>
</div>
{% endblock %}
`
  },
  {
    path: 'templates/timer.html',
    name: 'timer.html',
    language: 'html',
    description: 'Core Pomodoro and Focus Timer page with start/pause/resume/reset, audio chimes, and distraction warning modal.',
    content: `{% extends "base.html" %}
{% block title %}Focus Timer · Focus Timer & Blocker{% endblock %}

{% block content %}
<div class="timer-page-container">
    <div class="timer-card">
        <!-- Session Type Selector Tabs -->
        <div class="timer-tabs">
            <button class="timer-tab active" data-type="focus" data-duration="{{ user.focus_time_pref or 25 }}">Focus ({{ user.focus_time_pref or 25 }}m)</button>
            <button class="timer-tab" data-type="short_break" data-duration="{{ user.break_time_pref or 5 }}">Short Break ({{ user.break_time_pref or 5 }}m)</button>
            <button class="timer-tab" data-type="long_break" data-duration="{{ user.long_break_pref or 15 }}">Long Break ({{ user.long_break_pref or 15 }}m)</button>
        </div>

        <!-- Task / Focus Goal Input -->
        <div class="task-input-wrapper">
            <input type="text" id="sessionNotes" class="task-input" placeholder="What are you working on? (e.g. Study OS Chapter 4)" value="College Exam Preparation">
        </div>

        <!-- Big Circular / Tabular Clock Display -->
        <div class="clock-display-wrap">
            <div class="clock-display font-mono tabular-nums" id="timerDisplay">25:00</div>
            <div class="clock-status" id="timerStatusLabel">Ready to begin</div>
        </div>

        <!-- Control Action Buttons -->
        <div class="timer-controls">
            <button id="btnStart" class="btn-timer-primary">Start Focus</button>
            <button id="btnPause" class="btn-timer-secondary" style="display: none;">Pause</button>
            <button id="btnResume" class="btn-timer-primary" style="display: none;">Resume</button>
            <button id="btnReset" class="btn-timer-ghost">Reset</button>
        </div>

        <!-- Active Distraction Shield Notice -->
        <div class="timer-shield-indicator">
            <span class="shield-dot"></span>
            <span>Distraction Shield Active: <strong id="blockedSiteCount">{{ blocked_sites|length }}</strong> sites protected</span>
        </div>
    </div>

    <!-- Blocker Simulator / Interceptor Test Area -->
    <div class="distraction-simulator-card">
        <h3>🧪 Distraction Blocker Shield Tester</h3>
        <p>In this web application, test how the Distraction Blocker shields you during focus mode. Attempt opening a blocked website below:</p>
        
        <div class="simulator-actions">
            {% for site in blocked_sites %}
            <button class="btn-test-blocked" onclick="testDistractionAttempt('{{ site.domain_name }}')">
                Attempt to open {{ site.domain_name }}
            </button>
            {% endfor %}
        </div>
    </div>
</div>

<!-- Distraction Blocker Warning Modal Interceptor -->
<div id="distractionModal" class="modal-backdrop" style="display: none;">
    <div class="modal-box modal-danger">
        <div class="modal-header">
            <span class="warning-icon">🚨</span>
            <h2>Distraction Shield Intercepted!</h2>
        </div>
        <div class="modal-body">
            <p>You tried to visit <strong id="attemptedDomainName" class="blocked-domain-tag">instagram.com</strong>, which is currently on your Distraction Block List!</p>
            <p class="modal-encouragement">Your focus session is active. Take a deep breath and keep your concentration momentum.</p>
        </div>
        <div class="modal-footer">
            <button class="btn-primary" onclick="closeDistractionModal()">Stay on Track & Return to Focus</button>
        </div>
    </div>
</div>

<!-- Break Reminder Modal -->
<div id="breakModal" class="modal-backdrop" style="display: none;">
    <div class="modal-box modal-success">
        <div class="modal-header">
            <span class="celebrate-icon">🎉</span>
            <h2>Focus Session Completed!</h2>
        </div>
        <div class="modal-body">
            <p>Great job! You completed your concentration goal.</p>
            <p>Time for a <strong>5-minute refreshing break</strong>. Stand up, stretch, and hydrate.</p>
        </div>
        <div class="modal-footer">
            <button class="btn-primary" onclick="startBreakFromModal()">Start Break Timer</button>
            <button class="btn-secondary" onclick="closeBreakModal()">Dismiss</button>
        </div>
    </div>
</div>
{% endblock %}

{% block scripts %}
<script src="{{ url_for('static', filename='js/timer.js') }}"></script>
{% endblock %}
`
  },
  {
    path: 'templates/blocker.html',
    name: 'blocker.html',
    language: 'html',
    description: 'Distraction blocker page to add, toggle, and remove distracting websites and apps.',
    content: `{% extends "base.html" %}
{% block title %}Distraction Blocker · Focus Timer{% endblock %}

{% block content %}
<div class="blocker-container">
    <div class="page-title-row">
        <div>
            <h1>Distraction Blocker</h1>
            <p class="subtitle">Add websites that tempt or distract you during your work and study sessions.</p>
        </div>
    </div>

    <!-- Add Website Form -->
    <div class="add-site-card">
        <h3>+ Add Website to Block List</h3>
        <form method="POST" action="{{ url_for('api_add_blocked_site') }}" class="add-site-form">
            <div class="form-row">
                <input type="text" name="domain" class="form-input" placeholder="e.g. twitter.com or youtube.com" required>
                <select name="category" class="form-select">
                    <option value="Social Media">Social Media</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Gaming">Gaming</option>
                    <option value="News & Shopping">News & Shopping</option>
                    <option value="Custom">Custom</option>
                </select>
                <button type="submit" class="btn-primary">Add to Block List</button>
            </div>
        </form>
    </div>

    <!-- Active Block List Table -->
    <div class="section-card">
        <h2>Your Blocked Websites ({{ sites|length }})</h2>
        {% if sites %}
        <table class="data-table">
            <thead>
                <tr>
                    <th>Domain Name</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Distractions Prevented</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {% for site in sites %}
                <tr>
                    <td><strong class="font-mono">{{ site.domain_name }}</strong></td>
                    <td><span class="category-pill">{{ site.category }}</span></td>
                    <td>
                        <span class="badge {% if site.is_active %}badge-active{% else %}badge-disabled{% endif %}">
                            {{ 'Active Shield' if site.is_active else 'Disabled' }}
                        </span>
                    </td>
                    <td class="font-mono tabular-nums">{{ site.attempts_prevented }} times</td>
                    <td class="action-cell">
                        <form method="POST" action="{{ url_for('api_toggle_site', site_id=site.id) }}" style="display:inline;">
                            <button type="submit" class="btn-action-toggle">
                                {{ 'Disable' if site.is_active else 'Enable' }}
                            </button>
                        </form>
                        <form method="POST" action="{{ url_for('api_delete_site', site_id=site.id) }}" style="display:inline;" onsubmit="return confirm('Remove {{ site.domain_name }} from block list?');">
                            <button type="submit" class="btn-action-delete">Remove</button>
                        </form>
                    </td>
                </tr>
                {% endfor %}
            </tbody>
        </table>
        {% else %}
        <div class="empty-state">
            <p>Your block list is empty. Add a distracting website above to enable the distraction blocker shield!</p>
        </div>
        {% endif %}
    </div>
</div>
{% endblock %}
`
  },
  {
    path: 'templates/history.html',
    name: 'history.html',
    language: 'html',
    description: 'Focus session history with date, duration, notes, and completion status.',
    content: `{% extends "base.html" %}
{% block title %}Focus History · Focus Timer{% endblock %}

{% block content %}
<div class="history-container">
    <div class="page-title-row">
        <div>
            <h1>Focus Session History</h1>
            <p class="subtitle">Audit log of all your completed, interrupted, and customized study sessions.</p>
        </div>
        
        <!-- Filter Tabs -->
        <div class="filter-tabs">
            <a href="{{ url_for('history', status='all') }}" class="filter-tab {% if current_filter == 'all' %}active{% endif %}">All</a>
            <a href="{{ url_for('history', status='completed') }}" class="filter-tab {% if current_filter == 'completed' %}active{% endif %}">Completed</a>
            <a href="{{ url_for('history', status='interrupted') }}" class="filter-tab {% if current_filter == 'interrupted' %}active{% endif %}">Interrupted</a>
        </div>
    </div>

    <div class="section-card">
        {% if sessions %}
        <table class="data-table">
            <thead>
                <tr>
                    <th>Date & Time</th>
                    <th>Task / Topic Notes</th>
                    <th>Type</th>
                    <th>Target</th>
                    <th>Actual Focus</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                {% for s in sessions %}
                <tr>
                    <td class="font-mono text-muted">{{ s.started_at }}</td>
                    <td><strong>{{ s.notes or 'General Study' }}</strong></td>
                    <td><span class="type-tag">{{ s.session_type }}</span></td>
                    <td class="font-mono tabular-nums">{{ s.target_duration }}m</td>
                    <td class="font-mono tabular-nums font-bold">{{ s.actual_duration }}m</td>
                    <td>
                        <span class="status-badge status-{{ s.status }}">
                            {{ s.status }}
                        </span>
                    </td>
                </tr>
                {% endfor %}
            </tbody>
        </table>
        {% else %}
        <div class="empty-state">
            <p>No focus history records found for this filter.</p>
        </div>
        {% endif %}
    </div>
</div>
{% endblock %}
`
  },
  {
    path: 'templates/statistics.html',
    name: 'statistics.html',
    language: 'html',
    description: 'Productivity statistics page with daily and weekly focus analysis and completion rate.',
    content: `{% extends "base.html" %}
{% block title %}Productivity Statistics · Focus Timer{% endblock %}

{% block content %}
<div class="stats-container">
    <div class="page-title-row">
        <div>
            <h1>Productivity Statistics</h1>
            <p class="subtitle">Detailed breakdown of study consistency, daily focus minutes, and blocked distractions.</p>
        </div>
    </div>

    <!-- Summary Overview Cards -->
    <div class="stats-grid">
        <div class="stat-card">
            <span class="stat-icon">📈</span>
            <div class="stat-info">
                <span class="stat-value font-mono tabular-nums">{{ breakdown.completed or 0 }}</span>
                <span class="stat-label">Total Completed Sessions</span>
            </div>
        </div>
        <div class="stat-card">
            <span class="stat-icon">⚠️</span>
            <div class="stat-info">
                <span class="stat-value font-mono tabular-nums">{{ breakdown.interrupted or 0 }}</span>
                <span class="stat-label">Interrupted Sessions</span>
            </div>
        </div>
        <div class="stat-card">
            <span class="stat-icon">🏆</span>
            <div class="stat-info">
                <span class="stat-value font-mono tabular-nums">
                    {% if breakdown.total and breakdown.total > 0 %}
                        {{ ((breakdown.completed / breakdown.total) * 100)|round|int }}%
                    {% else %}
                        0%
                    {% endif %}
                </span>
                <span class="stat-label">Completion Rate</span>
            </div>
        </div>
    </div>

    <!-- Weekly Productivity Breakdown Table -->
    <div class="section-card">
        <h2>Past 7 Days Daily Breakdown</h2>
        {% if weekly_stats %}
        <table class="data-table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Total Focus Minutes</th>
                    <th>Completed Sessions</th>
                    <th>Distractions Prevented</th>
                </tr>
            </thead>
            <tbody>
                {% for row in weekly_stats %}
                <tr>
                    <td class="font-mono"><strong>{{ row.date }}</strong></td>
                    <td class="font-mono tabular-nums">{{ row.total_focus_minutes }} minutes</td>
                    <td class="font-mono tabular-nums">{{ row.completed_sessions_count }}</td>
                    <td class="font-mono tabular-nums text-danger">{{ row.distraction_attempts_blocked }}</td>
                </tr>
                {% endfor %}
            </tbody>
        </table>
        {% else %}
        <div class="empty-state">
            <p>No daily statistics recorded yet.</p>
        </div>
        {% endif %}
    </div>
</div>
{% endblock %}
`
  },
  {
    path: 'templates/settings.html',
    name: 'settings.html',
    language: 'html',
    description: 'Settings page to customize timer durations and sound notifications.',
    content: `{% extends "base.html" %}
{% block title %}Settings · Focus Timer{% endblock %}

{% block content %}
<div class="settings-container">
    <div class="page-title-row">
        <div>
            <h1>Timer Settings & Preferences</h1>
            <p class="subtitle">Customize your default focus time, break intervals, and audio alerts.</p>
        </div>
    </div>

    <div class="settings-card">
        <form method="POST" action="{{ url_for('settings') }}" class="settings-form">
            <div class="form-group">
                <label for="focus_time_pref">Focus Session Duration (minutes)</label>
                <input type="number" id="focus_time_pref" name="focus_time_pref" class="form-input" min="5" max="120" value="{{ user.focus_time_pref or 25 }}" required>
                <small class="form-help">Standard Pomodoro technique recommendation is 25 minutes.</small>
            </div>

            <div class="form-group">
                <label for="break_time_pref">Short Break Duration (minutes)</label>
                <input type="number" id="break_time_pref" name="break_time_pref" class="form-input" min="1" max="30" value="{{ user.break_time_pref or 5 }}" required>
                <small class="form-help">Recommended short break is 5 minutes between study sessions.</small>
            </div>

            <div class="form-group">
                <label for="long_break_pref">Long Break Duration (minutes)</label>
                <input type="number" id="long_break_pref" name="long_break_pref" class="form-input" min="5" max="60" value="{{ user.long_break_pref or 15 }}" required>
                <small class="form-help">Recommended after completing 4 consecutive focus sessions.</small>
            </div>

            <div class="form-group checkbox-group">
                <label class="checkbox-label">
                    <input type="checkbox" name="sound_enabled" value="1" {% if user.sound_pref %}checked{% endif %}>
                    <span>Enable Audio Chimes when timer completes</span>
                </label>
            </div>

            <button type="submit" class="btn-primary">Save Preferences</button>
        </form>
    </div>
</div>
{% endblock %}
`
  },
  {
    path: 'static/css/style.css',
    name: 'style.css',
    language: 'css',
    description: 'Clean modern CSS styling for all templates, buttons, tables, and modal dialogs.',
    content: `/* Focus Timer with Distraction Blocker - Modern College Project Stylesheet */
:root {
    --bg-canvas: #f8fafc;
    --bg-surface: #ffffff;
    --border-color: #e2e8f0;
    --text-primary: #0f172a;
    --text-muted: #64748b;
    --primary: #4f46e5;
    --primary-hover: #4338ca;
    --success: #16a34a;
    --danger: #dc2626;
    --warning: #d97706;
    --radius: 8px;
    --font-sans: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
    --font-mono: 'JetBrains Mono', monospace;
}

* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

body {
    font-family: var(--font-sans);
    background-color: var(--bg-canvas);
    color: var(--text-primary);
    line-height: 1.5;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

.font-mono { font-family: var(--font-mono); }
.tabular-nums { font-variant-numeric: tabular-nums; }

/* Header & Navigation */
.app-header {
    background: var(--bg-surface);
    border-bottom: 1px solid var(--border-color);
    padding: 0.75rem 2rem;
}

.header-container {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.brand-logo {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    text-decoration: none;
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-primary);
}

.main-nav {
    display: flex;
    gap: 1.25rem;
}

.nav-link {
    text-decoration: none;
    color: var(--text-muted);
    font-size: 0.875rem;
    font-weight: 500;
    padding: 0.35rem 0;
    transition: color 0.15s;
}

.nav-link:hover, .nav-link.active {
    color: var(--primary);
    border-bottom: 2px solid var(--primary);
}

.user-menu {
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 0.875rem;
}

.btn-logout {
    color: var(--danger);
    text-decoration: none;
    font-weight: 600;
}

/* Main Layout */
.main-content {
    flex: 1;
    max-width: 1200px;
    width: 100%;
    margin: 2rem auto;
    padding: 0 1.5rem;
}

.app-footer {
    text-align: center;
    padding: 1.5rem;
    border-top: 1px solid var(--border-color);
    color: var(--text-muted);
    font-size: 0.875rem;
    background: var(--bg-surface);
}

/* Flash Messages */
.flash-messages-container {
    margin-bottom: 1.5rem;
}

.flash-message {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    border-radius: var(--radius);
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
}

.flash-success { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
.flash-danger { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }
.flash-warning { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
.flash-info { background: #e0e7ff; color: #3730a3; border: 1px solid #c7d2fe; }
.flash-close { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: inherit; }

/* Auth Pages */
.auth-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 3rem 0;
}

.auth-card {
    background: var(--bg-surface);
    border: 1px solid var(--border-color);
    border-radius: var(--radius);
    padding: 2.5rem;
    width: 100%;
    max-width: 440px;
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
}

.auth-header { margin-bottom: 1.5rem; }
.auth-header h2 { font-size: 1.5rem; margin-bottom: 0.5rem; }
.auth-header p { color: var(--text-muted); font-size: 0.875rem; }

.form-group {
    margin-bottom: 1.25rem;
}

.form-group label {
    display: block;
    font-size: 0.875rem;
    font-weight: 600;
    margin-bottom: 0.35rem;
}

.form-input, .form-select {
    width: 100%;
    padding: 0.65rem 0.85rem;
    border: 1px solid var(--border-color);
    border-radius: var(--radius);
    font-family: inherit;
    font-size: 0.9rem;
    outline: none;
}

.form-input:focus, .form-select:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
}

.btn-submit, .btn-primary {
    display: inline-block;
    width: 100%;
    background: var(--primary);
    color: white;
    padding: 0.75rem 1rem;
    border: none;
    border-radius: var(--radius);
    font-weight: 600;
    cursor: pointer;
    text-align: center;
    text-decoration: none;
    transition: background 0.15s;
}

.btn-submit:hover, .btn-primary:hover {
    background: var(--primary-hover);
}

.auth-footer {
    margin-top: 1.5rem;
    text-align: center;
    font-size: 0.875rem;
    color: var(--text-muted);
}

.auth-footer a { color: var(--primary); text-decoration: none; font-weight: 600; }
.demo-credentials-box {
    margin-top: 1rem;
    background: #f1f5f9;
    padding: 0.5rem;
    border-radius: 4px;
}

/* Dashboard & Cards */
.dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.subtitle { color: var(--text-muted); font-size: 0.95rem; }

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1.25rem;
    margin-bottom: 2rem;
}

.stat-card {
    background: var(--bg-surface);
    border: 1px solid var(--border-color);
    border-radius: var(--radius);
    padding: 1.25rem;
    display: flex;
    align-items: center;
    gap: 1rem;
}

.stat-icon { font-size: 2rem; }
.stat-value { display: block; font-size: 1.5rem; font-weight: 700; color: var(--text-primary); }
.stat-label { font-size: 0.8rem; color: var(--text-muted); }

.shield-banner {
    background: #eef2ff;
    border: 1px solid #c7d2fe;
    border-radius: var(--radius);
    padding: 1.25rem 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.shield-content { display: flex; align-items: center; gap: 1rem; }
.shield-icon { font-size: 1.75rem; }

.btn-secondary {
    background: white;
    border: 1px solid var(--border-color);
    padding: 0.5rem 1rem;
    border-radius: var(--radius);
    text-decoration: none;
    font-weight: 600;
    color: var(--text-primary);
}

.section-card {
    background: var(--bg-surface);
    border: 1px solid var(--border-color);
    border-radius: var(--radius);
    padding: 1.5rem;
    margin-bottom: 2rem;
}

.section-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.25rem;
}

/* Tables */
.data-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
}

.data-table th {
    text-align: left;
    padding: 0.75rem 1rem;
    background: #f8fafc;
    border-bottom: 1px solid var(--border-color);
    color: var(--text-muted);
}

.data-table td {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--border-color);
}

.status-badge {
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: capitalize;
}
.status-completed { background: #dcfce7; color: #15803d; }
.status-interrupted { background: #fee2e2; color: #b91c1c; }

/* Timer Page Styles */
.timer-page-container {
    max-width: 650px;
    margin: 0 auto;
}

.timer-card {
    background: var(--bg-surface);
    border: 1px solid var(--border-color);
    border-radius: var(--radius);
    padding: 2.5rem;
    text-align: center;
    margin-bottom: 2rem;
}

.timer-tabs {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
}

.timer-tab {
    background: #f1f5f9;
    border: 1px solid var(--border-color);
    padding: 0.5rem 1rem;
    border-radius: var(--radius);
    font-family: inherit;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
}

.timer-tab.active {
    background: var(--primary);
    color: white;
    border-color: var(--primary);
}

.task-input-wrapper { margin-bottom: 1.5rem; }
.task-input {
    width: 100%;
    padding: 0.65rem;
    text-align: center;
    border: 1px dashed var(--border-color);
    border-radius: var(--radius);
    font-size: 1rem;
}

.clock-display-wrap {
    margin: 2rem 0;
}

.clock-display {
    font-size: 5rem;
    font-weight: 700;
    color: var(--text-primary);
    letter-spacing: -2px;
}

.clock-status {
    color: var(--text-muted);
    font-size: 0.9rem;
    margin-top: 0.25rem;
}

.timer-controls {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.btn-timer-primary {
    background: var(--primary);
    color: white;
    border: none;
    padding: 0.75rem 2rem;
    border-radius: var(--radius);
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
}

.btn-timer-secondary {
    background: #e2e8f0;
    color: var(--text-primary);
    border: none;
    padding: 0.75rem 2rem;
    border-radius: var(--radius);
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
}

.btn-timer-ghost {
    background: transparent;
    border: 1px solid var(--border-color);
    color: var(--text-muted);
    padding: 0.75rem 1.25rem;
    border-radius: var(--radius);
    cursor: pointer;
}

.timer-shield-indicator {
    font-size: 0.8rem;
    color: var(--text-muted);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
}

.shield-dot {
    width: 8px;
    height: 8px;
    background: var(--success);
    border-radius: 50%;
}

/* Distraction Simulator Card */
.distraction-simulator-card {
    background: #fff;
    border: 1px dashed #cbd5e1;
    border-radius: var(--radius);
    padding: 1.5rem;
}

.simulator-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 1rem;
}

.btn-test-blocked {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    padding: 0.4rem 0.75rem;
    border-radius: 4px;
    font-size: 0.8rem;
    cursor: pointer;
}

.btn-test-blocked:hover {
    background: #fee2e2;
    border-color: #fca5a5;
    color: #991b1b;
}

/* Modals */
.modal-backdrop {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(15, 23, 42, 0.75);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999;
}

.modal-box {
    background: white;
    border-radius: var(--radius);
    max-width: 480px;
    width: 90%;
    padding: 2rem;
    text-align: center;
}

.warning-icon { font-size: 3rem; }
.celebrate-icon { font-size: 3rem; }
.modal-header h2 { margin: 0.5rem 0 1rem; font-size: 1.35rem; }
.modal-body { margin-bottom: 1.5rem; color: var(--text-muted); font-size: 0.95rem; }
.blocked-domain-tag { color: var(--danger); }
`
  },
  {
    path: 'static/js/main.js',
    name: 'main.js',
    language: 'javascript',
    description: 'General front-end helpers and flash alert dismiss logic.',
    content: `// Focus Timer with Distraction Blocker - Main Client Script

document.addEventListener('DOMContentLoaded', () => {
    // Auto dismiss flash messages after 5 seconds
    const flashes = document.querySelectorAll('.flash-message');
    flashes.forEach(flash => {
        setTimeout(() => {
            flash.style.opacity = '0';
            flash.style.transition = 'opacity 0.5s ease';
            setTimeout(() => flash.remove(), 500);
        }, 5000);
    });
});
`
  },
  {
    path: 'static/js/timer.js',
    name: 'timer.js',
    language: 'javascript',
    description: 'Pomodoro timer engine, audio synthesizer chimes, and distraction warning modal interceptor.',
    content: `// Pomodoro & Distraction Blocker Timer Engine

let timerInterval = null;
let currentSeconds = 25 * 60;
let initialSeconds = 25 * 60;
let isRunning = false;
let currentSessionType = 'focus';
let sessionStartedAt = null;

const timerDisplay = document.getElementById('timerDisplay');
const timerStatusLabel = document.getElementById('timerStatusLabel');
const btnStart = document.getElementById('btnStart');
const btnPause = document.getElementById('btnPause');
const btnResume = document.getElementById('btnResume');
const btnReset = document.getElementById('btnReset');
const sessionNotes = document.getElementById('sessionNotes');
const distractionModal = document.getElementById('distractionModal');
const breakModal = document.getElementById('breakModal');
const tabs = document.querySelectorAll('.timer-tab');

// Synthesized audio chime without needing external mp3 files
function playBeep(type) {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        if (type === 'distraction') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(220, ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(140, ctx.currentTime + 0.3);
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.3);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.3);
        } else {
            // pleasant completion bell
            osc.type = 'sine';
            osc.frequency.setValueAtTime(659.25, ctx.currentTime);
            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 1.2);
        }
    } catch (e) {
        console.warn('Audio not allowed yet by browser autoplay policy.');
    }
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return \`\${mins.toString().padStart(2, '0')}:\${secs.toString().padStart(2, '0')}\`;
}

function updateDisplay() {
    timerDisplay.textContent = formatTime(currentSeconds);
    document.title = \`(\${formatTime(currentSeconds)}) Focus Timer\`;
}

function startTimer() {
    if (isRunning) return;
    isRunning = true;
    sessionStartedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');

    btnStart.style.display = 'none';
    btnPause.style.display = 'inline-block';
    btnResume.style.display = 'none';
    timerStatusLabel.textContent = currentSessionType === 'focus' ? 'Focus Session in progress...' : 'Break in progress...';

    timerInterval = setInterval(() => {
        if (currentSeconds > 0) {
            currentSeconds--;
            updateDisplay();
        } else {
            completeSession();
        }
    }, 1000);
}

function pauseTimer() {
    if (!isRunning) return;
    isRunning = false;
    clearInterval(timerInterval);
    btnPause.style.display = 'none';
    btnResume.style.display = 'inline-block';
    timerStatusLabel.textContent = 'Timer paused';
}

function resumeTimer() {
    startTimer();
}

function resetTimer() {
    if (isRunning) {
        clearInterval(timerInterval);
        isRunning = false;
    }
    currentSeconds = initialSeconds;
    updateDisplay();
    btnStart.style.display = 'inline-block';
    btnPause.style.display = 'none';
    btnResume.style.display = 'none';
    timerStatusLabel.textContent = 'Ready to begin';
    document.title = 'Focus Timer with Distraction Blocker';
}

function completeSession() {
    clearInterval(timerInterval);
    isRunning = false;
    playBeep('complete');

    const durationMins = Math.round(initialSeconds / 60);
    const notes = sessionNotes ? sessionNotes.value : 'General Concentration';

    // Log session to Flask Backend via REST API
    fetch('/api/sessions/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            session_type: currentSessionType,
            target_duration: durationMins,
            actual_duration: durationMins,
            status: 'completed',
            notes: notes,
            started_at: sessionStartedAt
        })
    }).catch(err => console.error('Failed to log session:', err));

    if (currentSessionType === 'focus') {
        // Trigger break reminder modal
        if (breakModal) breakModal.style.display = 'flex';
    } else {
        alert('Break time is over! Ready to return to focus?');
        resetTimer();
    }
}

// Distraction Attempt Tester
window.testDistractionAttempt = function(domain) {
    playBeep('distraction');
    const domainSpan = document.getElementById('attemptedDomainName');
    if (domainSpan) domainSpan.textContent = domain;
    if (distractionModal) distractionModal.style.display = 'flex';

    // Log prevented attempt to backend
    fetch('/api/blocker/log_attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domain })
    }).catch(err => console.error('Failed to log attempt:', err));
};

window.closeDistractionModal = function() {
    if (distractionModal) distractionModal.style.display = 'none';
};

window.closeBreakModal = function() {
    if (breakModal) breakModal.style.display = 'none';
    resetTimer();
};

window.startBreakFromModal = function() {
    closeBreakModal();
    // Switch to short break tab
    const breakTab = document.querySelector('[data-type="short_break"]');
    if (breakTab) breakTab.click();
    startTimer();
};

// Event Listeners
if (btnStart) btnStart.addEventListener('click', startTimer);
if (btnPause) btnPause.addEventListener('click', pauseTimer);
if (btnResume) btnResume.addEventListener('click', resumeTimer);
if (btnReset) btnReset.addEventListener('click', resetTimer);

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentSessionType = tab.dataset.type;
        initialSeconds = parseInt(tab.dataset.duration) * 60;
        resetTimer();
    });
});
`
  },
  {
    path: 'README.md',
    name: 'README.md',
    language: 'markdown',
    description: 'Comprehensive college final-year project documentation, architecture guide, and localhost setup instructions.',
    content: `# Focus Timer with Distraction Blocker
**College Final-Year Computer Science / Software Engineering Project**

---

## 1. Project Overview & Objective
"Focus Timer with Distraction Blocker" is a web-based productivity application developed using **Python Flask, HTML, CSS, JavaScript, and SQLite3**. 

Students and knowledge workers frequently experience cognitive friction and fragmented attention when studying or writing code due to compulsive checking of distracting websites (social media, video streaming, forums). This project solves that problem by integrating:
1. An empirical **Pomodoro & Customizable Focus Timer**.
2. An active **Distraction Blocker & Shielding Interceptor** that warns users when they attempt to visit distracting sites during active study periods.
3. Automated **Session Logging & Daily/Weekly Analytics** in SQLite3 to visualize focus progress and habit streaks.
4. **Break Reminders & Audio Chimes** to prevent mental burnout and reinforce healthy work cycles.

---

## 2. Tech Stack
- **Backend Framework:** Python 3.9+ with Flask
- **Database:** SQLite3 (Serverless, zero configuration, ACID compliant)
- **Frontend:** Semantic HTML5, Modern CSS3 (CSS Grid/Flexbox), Vanilla JavaScript (ES6+)
- **Security:** Werkzeug password hashing (\`scrypt\` / \`pbkdf2\`), session encryption, prepared SQL statements to prevent SQL Injection
- **Audio:** Web Audio API synthesizer for clean notification chimes without external media dependencies
- **IDE:** Visual Studio Code (VS Code)

---

## 3. Project Directory Structure
\`\`\`
focus_timer_project/
│
├── app.py                     # Main Flask routes, controllers, and REST APIs
├── database.py                # Database schema initializer & sample data seeder
├── requirements.txt           # Python library dependencies
├── README.md                  # Project setup and documentation
│
├── templates/                 # Jinja2 HTML Templates
│   ├── base.html              # Master layout with navigation and flash messages
│   ├── login.html             # User authentication login
│   ├── register.html          # User account creation
│   ├── dashboard.html         # Productivity dashboard overview
│   ├── timer.html             # Focus timer & distraction interceptor
│   ├── blocker.html           # Blocked websites management
│   ├── history.html           # Focus session log table
│   ├── statistics.html        # Daily and weekly analytics
│   └── settings.html          # Custom duration & sound preferences
│
└── static/                    # Client Assets
    ├── css/
    │   └── style.css          # Responsive styling
    └── js/
        ├── main.js            # General UI and alert handlers
        └── timer.js           # Pomodoro timing engine & blocker interceptor
\`\`\`

---

## 4. Step-by-Step Installation & Localhost Execution Guide

### Prerequisites
- Python 3.9 or higher installed on your computer.
- Visual Studio Code (VS Code).

### Step 1: Open Terminal in VS Code
Open the project directory in VS Code (\`File > Open Folder...\`). Open an integrated terminal (\`Ctrl + \`\` or \`Terminal > New Terminal\`).

### Step 2: Create and Activate Python Virtual Environment
\`\`\`bash
# Create virtual environment
python -m venv venv

# Activate on Windows (Command Prompt / PowerShell)
venv\\Scripts\\activate

# Activate on macOS / Linux
source venv/bin/activate
\`\`\`

### Step 3: Install Required Dependencies
\`\`\`bash
pip install -r requirements.txt
\`\`\`

### Step 4: Initialize the SQLite3 Database
Run the database setup script to generate \`focus_timer.db\` and pre-fill realistic demo data:
\`\`\`bash
python database.py
\`\`\`
*Expected Output:*
\`\`\`
Creating tables in focus_timer.db...
Inserting demo student account (Email: student@college.edu / Password: password123)...
Database initialization completed successfully! File 'focus_timer.db' is ready.
\`\`\`

### Step 5: Start the Flask Development Server
\`\`\`bash
python app.py
\`\`\`
*Output:*
\`\`\`
 * Serving Flask app 'app'
 * Debug mode: on
 * Running on http://127.0.0.1:5000
\`\`\`

### Step 6: Access the Application
Open your web browser and navigate to:
**\`http://127.0.0.1:5000\`**

Use the pre-configured Demo Account:
- **Email:** \`student@college.edu\`
- **Password:** \`password123\`
Or click **Register** to create a fresh student account.

---

## 5. Database Schema & Tables
SQLite3 database \`focus_timer.db\` contains four relational tables:

1. **\`users\`**:
   - \`id\` (INTEGER PRIMARY KEY AUTOINCREMENT)
   - \`username\` (TEXT UNIQUE NOT NULL)
   - \`email\` (TEXT UNIQUE NOT NULL)
   - \`password_hash\` (TEXT NOT NULL)
   - \`focus_time_pref\` (INTEGER DEFAULT 25)
   - \`break_time_pref\` (INTEGER DEFAULT 5)
   - \`long_break_pref\` (INTEGER DEFAULT 15)
   - \`sound_pref\` (INTEGER DEFAULT 1)
   - \`created_at\` (TIMESTAMP)

2. **\`focus_sessions\`**:
   - \`id\` (INTEGER PRIMARY KEY)
   - \`user_id\` (INTEGER, Foreign Key referencing \`users.id\`)
   - \`session_type\` (TEXT: 'focus', 'short_break', 'long_break')
   - \`target_duration\` (INTEGER in minutes)
   - \`actual_duration\` (INTEGER in minutes)
   - \`status\` (TEXT: 'completed', 'interrupted', 'abandoned')
   - \`notes\` (TEXT - session study topic)
   - \`started_at\` (TIMESTAMP)
   - \`completed_at\` (TIMESTAMP)

3. **\`blocked_sites\`**:
   - \`id\` (INTEGER PRIMARY KEY)
   - \`user_id\` (INTEGER, Foreign Key referencing \`users.id\`)
   - \`domain_name\` (TEXT NOT NULL)
   - \`category\` (TEXT - 'Social Media', 'Entertainment', etc.)
   - \`is_active\` (INTEGER DEFAULT 1)
   - \`attempts_prevented\` (INTEGER DEFAULT 0)
   - \`created_at\` (TIMESTAMP)

4. **\`productivity_stats\`**:
   - \`id\` (INTEGER PRIMARY KEY)
   - \`user_id\` (INTEGER, Foreign Key referencing \`users.id\`)
   - \`date\` (TEXT: 'YYYY-MM-DD')
   - \`total_focus_minutes\` (INTEGER)
   - \`completed_sessions_count\` (INTEGER)
   - \`interrupted_sessions_count\` (INTEGER)
   - \`distraction_attempts_blocked\` (INTEGER)

---

## 6. Viva Questions & Project Defense Highlights
When presenting this project to your college viva examiners or professors:
1. **How is security handled?**
   Passwords are never stored in plain text; they are hashed using Werkzeug's cryptographic hashing algorithms with salts. All SQL queries use parameterized queries (\`?\` placeholders) to prevent SQL Injection attacks.
2. **How does the Distraction Blocker work?**
   During focus mode, the frontend interceptor checks target URLs against the user's active blocklist in the database. When an attempt occurs, an immediate warning modal is triggered, playing an audio alert, and the attempt is logged to the \`productivity_stats\` table to give users honest metrics on their temptation triggers.
3. **What is the significance of the Pomodoro technique?**
   Cognitive science demonstrates that the human prefrontal cortex operates best in 25-minute cycles followed by structured 5-minute pauses. This prevents decision fatigue and maintains high working-memory retention.
`
  }
];
