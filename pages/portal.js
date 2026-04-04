import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';

const TUESDAYS = [
  { date: '2026-06-02', label: 'Jun 2',  month: 'June' },
  { date: '2026-06-09', label: 'Jun 9',  month: 'June' },
  { date: '2026-06-16', label: 'Jun 16', month: 'June' },
  { date: '2026-06-23', label: 'Jun 23', month: 'June' },
  { date: '2026-06-30', label: 'Jun 30', month: 'June' },
  { date: '2026-07-07', label: 'Jul 7',  month: 'July' },
  { date: '2026-07-14', label: 'Jul 14', month: 'July' },
  { date: '2026-07-21', label: 'Jul 21', month: 'July' },
  { date: '2026-07-28', label: 'Jul 28', month: 'July' },
  { date: '2026-08-04', label: 'Aug 4',  month: 'August' },
  { date: '2026-08-11', label: 'Aug 11', month: 'August' },
];

function totalHours(hours) {
  return (hours || []).reduce((sum, h) => sum + Number(h.hours), 0);
}

// ── Login ─────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/portal/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        const { sessionToken, ...profile } = data;
        sessionStorage.setItem('portal_token', sessionToken);
        onLogin(profile);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: '#faf9f7', fontFamily: "proxima-nova, 'Helvetica Neue', sans-serif" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-5">
            <Image src="/icc-logo.png" alt="ICC" width={64} height={64} style={{ objectFit: 'contain' }} />
          </div>
          <p className="text-xs font-semibold tracking-[0.3em] uppercase mb-1" style={{ color: 'rgba(26,26,26,0.45)' }}>
            Interlachen Country Club
          </p>
          <p className="text-[10px] tracking-[0.2em] uppercase mb-3" style={{ color: '#9e812f', fontFamily: "'kepler-std', Georgia, serif", fontStyle: 'italic' }}>
            Est. 1909
          </p>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "'kepler-std', Georgia, serif", color: '#1a1a1a' }}>
            Staff Portal
          </h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(26,26,26,0.45)' }}>Junior League 2026</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-6">
          <div className="mb-3">
            <label className="block mb-1.5 text-sm font-medium" style={{ color: 'rgba(26,26,26,0.7)' }}>
              Email
            </label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" className="form-input"
              autoComplete="email" required />
          </div>
          <div className="mb-3">
            <label className="block mb-1.5 text-sm font-medium" style={{ color: 'rgba(26,26,26,0.7)' }}>
              Password
            </label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Your portal password" className="form-input"
              autoComplete="current-password" required />
          </div>
          {error && <p className="text-xs mb-3" style={{ color: 'rgba(185,28,28,0.8)' }}>{error}</p>}
          <button type="submit" disabled={loading || !email || !password} className="btn-primary"
            style={{ fontSize: '14px', padding: '12px 20px' }}>
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>
          <p className="text-center text-xs mt-4" style={{ color: 'rgba(26,26,26,0.3)' }}>
            No application yet?{' '}
            <Link href="/" className="underline" style={{ color: 'rgba(26,26,26,0.5)' }}>
              Apply here
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function Dashboard({ profile, onLogout }) {
  const [tab, setTab] = useState('hours');
  const [dates, setDates] = useState(profile.availableDates || []);
  const [hours, setHours] = useState(profile.hours || []);
  const [savingDates, setSavingDates] = useState(false);
  const [datesSaved, setDatesSaved] = useState(false);

  const [logDate, setLogDate] = useState('');
  const [logHours, setLogHours] = useState('');
  const [logNote, setLogNote] = useState('');
  const [loggingHours, setLoggingHours] = useState(false);
  const [hoursError, setHoursError] = useState('');

  const [installPrompt, setInstallPrompt] = useState(null);
  const [notifStatus, setNotifStatus] = useState('default');

  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    if ('Notification' in window) setNotifStatus(Notification.permission);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  async function requestNotifications() {
    if (!('Notification' in window)) return;
    const permission = await Notification.requestPermission();
    setNotifStatus(permission);
    if (permission === 'granted' && 'serviceWorker' in navigator && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        });
        const token = sessionStorage.getItem('portal_token');
        await fetch('/api/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionToken: token, subscription: sub }),
        });
      } catch (err) { console.error('Push subscription failed:', err.message); }
    }
  }

  async function installApp() {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  }

  function getToken() {
    return typeof window !== 'undefined' ? sessionStorage.getItem('portal_token') || '' : '';
  }

  async function apiCall(action, payload) {
    const res = await fetch('/api/portal/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionToken: getToken(), action, payload }),
    });
    return res.json();
  }

  async function saveDates() {
    setSavingDates(true);
    await apiCall('update_dates', { availableDates: dates });
    setSavingDates(false);
    setDatesSaved(true);
    setTimeout(() => setDatesSaved(false), 2500);
  }

  function toggleDate(date) {
    setDates(prev => prev.includes(date) ? prev.filter(d => d !== date) : [...prev, date]);
    setDatesSaved(false);
  }

  async function addHours(e) {
    e.preventDefault();
    if (!logDate || !logHours) return;
    setLoggingHours(true); setHoursError('');
    const res = await apiCall('add_hours', { date: logDate, hours: logHours, note: logNote });
    if (res.success) {
      setHours(prev => [...prev, res.entry]);
      setLogDate(''); setLogHours(''); setLogNote('');
    } else {
      setHoursError(res.error || 'Failed to log hours');
    }
    setLoggingHours(false);
  }

  async function deleteHours(id) {
    await apiCall('delete_hours', { id });
    setHours(prev => prev.filter(h => h.id !== id));
  }

  const total = totalHours(hours);
  const datesChanged = JSON.stringify([...dates].sort()) !== JSON.stringify([...(profile.availableDates || [])].sort());

  return (
    <main className="min-h-screen" style={{ background: '#faf9f7', fontFamily: "proxima-nova, 'Helvetica Neue', sans-serif" }}>
      {/* Header */}
      <header className="sticky top-0 z-20 px-4 py-4 flex items-center justify-between"
        style={{ background: 'rgba(250,249,247,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
        <div className="flex items-center gap-3">
          <Image src="/icc-logo.png" alt="ICC" width={32} height={32} style={{ objectFit: 'contain' }} />
          <div>
            <p className="text-xs font-bold" style={{ fontFamily: "'kepler-std', Georgia, serif", color: '#1a1a1a' }}>
              {profile.fullName}
            </p>
            <p className="text-[10px]" style={{ color: 'rgba(26,26,26,0.4)' }}>
              Junior League Staff · 2026
            </p>
          </div>
        </div>
        <button onClick={onLogout} className="text-xs px-3 py-1.5 rounded-lg"
          style={{ color: 'rgba(26,26,26,0.5)', background: 'white', border: '1px solid rgba(0,0,0,0.1)' }}>
          Sign Out
        </button>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* PWA install + notification banner */}
        {(installPrompt || notifStatus === 'default') && (
          <div className="rounded-2xl p-4 mb-4 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between"
            style={{ background: 'rgba(158,129,47,0.06)', border: '1px solid rgba(158,129,47,0.2)' }}>
            <div>
              <p className="text-sm font-semibold" style={{ color: '#1a1a1a' }}>Get the app + turn on reminders</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(26,26,26,0.45)' }}>
                Add to your home screen and enable notifications for availability reminders.
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              {notifStatus === 'default' && (
                <button onClick={requestNotifications}
                  className="px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap"
                  style={{ background: '#9e812f', color: 'white' }}>
                  🔔 Enable Alerts
                </button>
              )}
              {notifStatus === 'granted' && (
                <span className="px-4 py-2 rounded-xl text-xs font-bold"
                  style={{ background: 'rgba(158,129,47,0.12)', color: '#9e812f', border: '1px solid rgba(158,129,47,0.22)' }}>
                  ✓ Alerts on
                </span>
              )}
              {installPrompt && (
                <button onClick={installApp}
                  className="px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap"
                  style={{ background: 'white', color: '#1a1a1a', border: '1px solid rgba(0,0,0,0.12)' }}>
                  📲 Add to Home
                </button>
              )}
            </div>
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Hours Worked', value: total, color: '#9e812f', sub: 'logged' },
            { label: 'Dates Available', value: dates.length, color: '#1a1a1a', sub: 'of 11' },
            { label: 'Est. Earnings', value: '$' + (total * 15), color: '#9e812f', sub: 'at $15/hr' },
          ].map(({ label, value, color, sub }) => (
            <div key={label} className="glass-card rounded-2xl p-4 text-center">
              <div className="text-2xl font-extrabold mb-0.5" style={{ fontFamily: "'kepler-std', Georgia, serif", color }}>
                {value}
              </div>
              <div className="text-[9px] uppercase tracking-widest" style={{ color: 'rgba(26,26,26,0.4)' }}>
                {label}
              </div>
              <div className="text-[9px] mt-0.5" style={{ color: 'rgba(26,26,26,0.25)' }}>{sub}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 p-1 rounded-xl"
          style={{ background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.07)' }}>
          {[{ id: 'hours', label: 'Log Hours' }, { id: 'dates', label: 'My Dates' }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: tab === t.id ? 'white' : 'transparent',
                color: tab === t.id ? '#1a1a1a' : 'rgba(26,26,26,0.4)',
                boxShadow: tab === t.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── HOURS TAB ── */}
        {tab === 'hours' && (
          <div className="space-y-4">
            <div className="glass-card rounded-2xl p-5">
              <p className="text-xs font-bold uppercase tracking-widest mb-4"
                style={{ fontFamily: "'kepler-std', Georgia, serif", color: 'rgba(26,26,26,0.55)' }}>
                Log a Shift
              </p>
              <form onSubmit={addHours} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(26,26,26,0.6)' }}>
                    Date Worked
                  </label>
                  <select value={logDate} onChange={e => setLogDate(e.target.value)} required
                    className="w-full text-sm rounded-xl px-3 py-2.5 outline-none"
                    style={{ background: 'white', border: '1px solid rgba(0,0,0,0.12)', color: logDate ? '#1a1a1a' : 'rgba(26,26,26,0.35)', fontFamily: "proxima-nova, 'Helvetica Neue', sans-serif" }}>
                    <option value="" disabled>Select a Tuesday</option>
                    {TUESDAYS.map(({ date, label }) => (
                      <option key={date} value={date}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(26,26,26,0.6)' }}>
                    Hours Worked
                  </label>
                  <input type="number" min="0.5" max="12" step="0.5" value={logHours}
                    onChange={e => setLogHours(e.target.value)} placeholder="e.g. 7" required
                    className="w-full text-sm rounded-xl px-3 py-2.5 outline-none"
                    style={{ background: 'white', border: '1px solid rgba(0,0,0,0.12)', color: '#1a1a1a', fontFamily: "proxima-nova, 'Helvetica Neue', sans-serif" }} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(26,26,26,0.6)' }}>
                    Note <span style={{ color: 'rgba(26,26,26,0.3)' }}>(optional)</span>
                  </label>
                  <input type="text" value={logNote} onChange={e => setLogNote(e.target.value)}
                    placeholder="e.g. Meadowbrook round 1"
                    className="w-full text-sm rounded-xl px-3 py-2.5 outline-none"
                    style={{ background: 'white', border: '1px solid rgba(0,0,0,0.12)', color: '#1a1a1a', fontFamily: "proxima-nova, 'Helvetica Neue', sans-serif" }} />
                </div>
                {hoursError && <p className="text-xs" style={{ color: 'rgba(185,28,28,0.8)' }}>{hoursError}</p>}
                <button type="submit" disabled={loggingHours || !logDate || !logHours}
                  className="w-full py-2.5 rounded-xl text-sm font-bold transition-all"
                  style={{
                    background: (logDate && logHours) ? '#9e812f' : 'rgba(0,0,0,0.05)',
                    color: (logDate && logHours) ? 'white' : 'rgba(26,26,26,0.3)',
                    border: 'none',
                  }}>
                  {loggingHours ? 'Saving…' : 'Log Hours →'}
                </button>
              </form>
            </div>

            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-bold uppercase tracking-widest"
                  style={{ fontFamily: "'kepler-std', Georgia, serif", color: 'rgba(26,26,26,0.55)' }}>
                  Shift History
                </p>
                {total > 0 && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(158,129,47,0.1)', color: '#9e812f', border: '1px solid rgba(158,129,47,0.22)' }}>
                    {total} hrs · ${total * 15}
                  </span>
                )}
              </div>
              {hours.length === 0 ? (
                <p className="text-sm text-center py-6" style={{ color: 'rgba(26,26,26,0.3)' }}>
                  No shifts logged yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {[...hours].reverse().map(h => {
                    const t = TUESDAYS.find(t => t.date === h.date);
                    return (
                      <div key={h.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl"
                        style={{ background: 'rgba(0,0,0,0.025)', border: '1px solid rgba(0,0,0,0.07)' }}>
                        <div>
                          <span className="text-sm font-semibold" style={{ color: '#1a1a1a' }}>{t ? t.label : h.date}</span>
                          {h.note && (
                            <span className="text-xs ml-2" style={{ color: 'rgba(26,26,26,0.4)' }}>
                              {h.note}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold" style={{ color: '#9e812f' }}>{h.hours}h</span>
                          <button onClick={() => deleteHours(h.id)}
                            className="text-[10px] px-2 py-1 rounded-lg"
                            style={{ color: 'rgba(26,26,26,0.3)', background: 'rgba(0,0,0,0.04)' }}>
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── DATES TAB ── */}
        {tab === 'dates' && (
          <div className="glass-card rounded-2xl p-5">
            <p className="text-xs font-bold uppercase tracking-widest mb-1"
              style={{ fontFamily: "'kepler-std', Georgia, serif", color: 'rgba(26,26,26,0.55)' }}>
              Your Available Tuesdays
            </p>
            <p className="text-xs mb-5" style={{ color: 'rgba(26,26,26,0.4)' }}>
              Tap to toggle. Hit Save when done.
            </p>
            <div className="space-y-5">
              {['June', 'July', 'August'].map(month => {
                const monthDates = TUESDAYS.filter(t => t.month === month);
                return (
                  <div key={month}>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2.5"
                      style={{ color: 'rgba(26,26,26,0.3)' }}>
                      {month} 2026
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {monthDates.map(({ date, label }) => {
                        const sel = dates.includes(date);
                        return (
                          <button key={date} type="button" onClick={() => toggleDate(date)}
                            className="py-3 px-2 rounded-2xl text-center transition-all duration-150 active:scale-95"
                            style={{
                              background: sel ? '#9e812f' : 'white',
                              border: `1px solid ${sel ? '#9e812f' : 'rgba(0,0,0,0.1)'}`,
                              boxShadow: sel ? '0 2px 10px rgba(158,129,47,0.2)' : '0 1px 2px rgba(0,0,0,0.04)',
                            }}>
                            <div className="text-[9px] font-bold tracking-widest uppercase"
                              style={{ color: sel ? 'rgba(255,255,255,0.75)' : 'rgba(26,26,26,0.3)' }}>
                              Tue
                            </div>
                            <div className="text-sm font-bold mt-0.5"
                              style={{ fontFamily: "'kepler-std', Georgia, serif", color: sel ? 'white' : 'rgba(26,26,26,0.7)' }}>
                              {label}
                            </div>
                            <div className="text-[11px] mt-0.5"
                              style={{ color: sel ? 'rgba(255,255,255,0.85)' : 'transparent', fontWeight: 700 }}>
                              ✓
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            <button onClick={saveDates} disabled={savingDates || (!datesChanged && !datesSaved)}
              className="w-full mt-6 py-3 rounded-xl text-sm font-bold transition-all"
              style={{
                background: datesSaved ? 'rgba(158,129,47,0.1)' : datesChanged ? '#1a1a1a' : 'rgba(0,0,0,0.05)',
                color: datesSaved ? '#9e812f' : datesChanged ? 'white' : 'rgba(26,26,26,0.3)',
                border: datesSaved ? '1px solid rgba(158,129,47,0.25)' : 'none',
              }}>
              {savingDates ? 'Saving…' : datesSaved ? '✓ Saved!' : datesChanged ? 'Save Changes →' : 'No changes'}
            </button>
          </div>
        )}
      </div>
      <style jsx global>{`select option { background: #faf9f7; color: #1a1a1a; }`}</style>
    </main>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function PortalPage() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('portal_token') : null;
    if (token) {
      fetch('/api/portal/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionToken: token }),
      })
        .then(r => r.ok ? r.json() : null)
        .then(data => { if (data) setProfile(data); });
    }
  }, []);

  function handleLogout() {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('portal_token') : null;
    if (token) {
      sessionStorage.removeItem('portal_token');
      // Fire-and-forget server-side session invalidation
      fetch('/api/portal/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionToken: token }),
      }).catch(() => {});
    }
    setProfile(null);
  }

  return (
    <>
      <Head>
        <title>Staff Portal — ICC Junior League</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      {profile
        ? <Dashboard profile={profile} onLogout={handleLogout} />
        : <LoginScreen onLogin={setProfile} />
      }
    </>
  );
}
