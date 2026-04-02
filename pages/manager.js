import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';

const TUESDAYS = [
  { date: '2026-06-02', label: 'Jun 2' },
  { date: '2026-06-09', label: 'Jun 9' },
  { date: '2026-06-16', label: 'Jun 16' },
  { date: '2026-06-23', label: 'Jun 23' },
  { date: '2026-06-30', label: 'Jun 30' },
  { date: '2026-07-07', label: 'Jul 7' },
  { date: '2026-07-14', label: 'Jul 14' },
  { date: '2026-07-21', label: 'Jul 21' },
  { date: '2026-07-28', label: 'Jul 28' },
  { date: '2026-08-04', label: 'Aug 4' },
  { date: '2026-08-11', label: 'Aug 11' },
];

function formatDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function Badge({ children, green, yellow }) {
  return (
    <span
      className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{
        background: green ? 'rgba(0,175,81,0.15)' : yellow ? 'rgba(244,238,25,0.1)' : 'rgba(239,68,68,0.15)',
        color: green ? '#00af51' : yellow ? '#f4ee19' : '#f87171',
        border: `1px solid ${green ? 'rgba(0,175,81,0.25)' : yellow ? 'rgba(244,238,25,0.2)' : 'rgba(239,68,68,0.25)'}`,
      }}
    >
      {children}
    </span>
  );
}

function totalHours(hours) {
  return (hours || []).reduce((sum, h) => sum + Number(h.hours), 0);
}

function LoginScreen({ password, setPassword, onSubmit, loading, error }) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: '#0d0d0d', fontFamily: "'Work Sans', sans-serif" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-5">
            <Image src="/icc-logo.png" alt="ICC" width={64} height={64} style={{ objectFit: 'contain', opacity: 0.9 }} />
          </div>
          <p className="text-xs font-semibold tracking-[0.3em] uppercase mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Interlachen Country Club
          </p>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Raleway' }}>Manager Access</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Junior League Applications 2026</p>
        </div>
        <form onSubmit={onSubmit} className="glass-card rounded-3xl p-6"
          style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
          <label className="block mb-1.5 text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password" className="form-input mb-3" autoFocus autoComplete="current-password" />
          {error && <p className="text-xs mb-3" style={{ color: '#f87171' }}>{error}</p>}
          <button type="submit" disabled={loading || !password} className="btn-primary"
            style={{ fontSize: '14px', padding: '12px 20px' }}>
            {loading ? 'Verifying...' : 'Access Dashboard ->'}
          </button>
        </form>
      </div>
    </main>
  );
}

function Dashboard({ submissions, allSubmissions, total, filterDate, setFilterDate, sort, setSort, onLogout, managerPassword }) {
  const [expandedId, setExpandedId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [msgText, setMsgText] = useState('');
  const [msgMode, setMsgMode] = useState('email');
  const [notifStatus, setNotifStatus] = useState('default');
  const [notifLoading, setNotifLoading] = useState(false);

  const displayed = submissions;
  const selectedSubs = submissions.filter(s => selectedIds.includes(s.id));

  useEffect(() => {
    if ('Notification' in window) setNotifStatus(Notification.permission);
  }, []);

  async function enableNotifications() {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      alert('Push notifications are not supported in this browser.');
      return;
    }
    setNotifLoading(true);
    try {
      const permission = await Notification.requestPermission();
      setNotifStatus(permission);
      if (permission !== 'granted') { setNotifLoading(false); return; }

      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) { console.error('VAPID key not configured'); setNotifLoading(false); return; }

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey,
      });

      const res = await fetch('/api/manager-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: managerPassword, subscription: sub }),
      });

      if (res.ok) {
        setNotifStatus('granted');
      } else {
        console.error('Failed to save manager subscription');
      }
    } catch (err) {
      console.error('Notification setup failed:', err);
    } finally {
      setNotifLoading(false);
    }
  }

  function toggleSelect(id) { setSelectedIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]); }
  function selectAll() { setSelectedIds(displayed.map(s => s.id)); }
  function clearSelect() { setSelectedIds([]); }
  function sendEmail() {
    const addrs = selectedSubs.map(s => s.email).join(',');
    window.location.href = 'mailto:?bcc=' + encodeURIComponent(addrs) + '&subject=' + encodeURIComponent('Interlachen Junior League 2026') + '&body=' + encodeURIComponent(msgText);
  }

  const returning = submissions.filter((s) => s.returning).length;
  const bagRoom = submissions.filter((s) => s.bagRoom).length;

  return (
    <main className="min-h-screen" style={{ background: '#0d0d0d', fontFamily: "'Work Sans', sans-serif" }}>
      <header className="sticky top-0 z-20 px-4 py-4 flex items-center justify-between"
        style={{ background: 'rgba(13,13,13,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-3">
          <Image src="/icc-logo.png" alt="ICC" width={36} height={36} style={{ objectFit: 'contain' }} />
          <div>
            <p className="text-xs font-bold" style={{ fontFamily: 'Raleway', color: 'white' }}>Junior League Applications</p>
            <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>Summer 2026 · {total} total</p>
          </div>
        </div>
        <button onClick={onLogout} className="text-xs px-3 py-1.5 rounded-lg transition-colors"
          style={{ color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
          Log out
        </button>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* Push notification banner */}
        {notifStatus !== 'granted' && notifStatus !== 'denied' && (
          <div className="rounded-2xl p-4 mb-5 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between"
            style={{ background: 'rgba(0,175,81,0.08)', border: '1px solid rgba(0,175,81,0.2)' }}>
            <div>
              <p className="text-sm font-semibold text-white">Get notified when someone applies</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Enable push notifications on this device to receive an alert every time a new application comes in.
              </p>
            </div>
            <button onClick={enableNotifications} disabled={notifLoading}
              className="px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap flex-shrink-0"
              style={{ background: '#00af51', color: 'white', opacity: notifLoading ? 0.7 : 1 }}>
              {notifLoading ? 'Setting up...' : 'Enable Alerts'}
            </button>
          </div>
        )}

        {notifStatus === 'granted' && (
          <div className="rounded-2xl px-4 py-3 mb-5 flex items-center gap-3"
            style={{ background: 'rgba(0,175,81,0.06)', border: '1px solid rgba(0,175,81,0.15)' }}>
            <span style={{ color: '#00af51' }}>&#x1F514;</span>
            <p className="text-xs font-semibold" style={{ color: '#00af51' }}>Push notifications active on this device</p>
          </div>
        )}

        {notifStatus === 'denied' && (
          <div className="rounded-2xl px-4 py-3 mb-5"
            style={{ background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.15)' }}>
            <p className="text-xs" style={{ color: 'rgba(248,113,113,0.8)' }}>
              Notifications blocked. Go to browser settings, allow notifications for this site, then refresh.
            </p>
          </div>
        )}