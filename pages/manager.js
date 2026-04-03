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
        background: green
          ? 'rgba(0,175,81,0.15)'
          : yellow
          ? 'rgba(244,238,25,0.1)'
          : 'rgba(239,68,68,0.15)',
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
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: '#0d0d0d', fontFamily: "'Work Sans', sans-serif" }}
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-5">
            <Image src="/icc-logo.png" alt="ICC" width={64} height={64} style={{ objectFit: 'contain', opacity: 0.9 }} />
          </div>
          <p className="text-xs font-semibold tracking-[0.3em] uppercase mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Interlachen Country Club
          </p>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Raleway' }}>
            Manager Access
          </h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Junior League Applications 2026
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="glass-card rounded-3xl p-6"
          style={{ border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <label className="block mb-1.5 text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="form-input mb-3"
            autoFocus
            autoComplete="current-password"
          />
          {error && (
            <p className="text-xs mb-3" style={{ color: '#f87171' }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading || !password}
            className="btn-primary"
            style={{ fontSize: '14px', padding: '12px 20px' }}
          >
            {loading ? 'Verifying…' : 'Access Dashboard →'}
          </button>
        </form>
      </div>
    </main>
  );
}

function Dashboard({ submissions, allSubmissions, total, filterDate, setFilterDate, sort, setSort, onLogout, managerPassword, onRefresh }) {
  const [expandedId, setExpandedId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [msgText, setMsgText] = useState('');
  const [msgMode, setMsgMode] = useState('email');
  const [notifStatus, setNotifStatus] = useState('default');
  const [notifLoading, setNotifLoading] = useState(false);
  const [pushTitle, setPushTitle] = useState('');
  const [pushBody, setPushBody] = useState('');
  const [pushSending, setPushSending] = useState(false);
  const [pushResult, setPushResult] = useState(null);
  // Hours logging
  const [hoursFormId, setHoursFormId] = useState(null);
  const [hoursDate, setHoursDate] = useState('');
  const [hoursCount, setHoursCount] = useState('');
  const [hoursNote, setHoursNote] = useState('');
  const [hoursWorking, setHoursWorking] = useState(false);

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



  // Helpers
  const selectedSubs = submissions.filter(s => selectedIds.includes(s.id));
  function toggleSelect(id) { setSelectedIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]); }
  function selectAll() { setSelectedIds(submissions.map(s => s.id)); }
  function clearSelect() { setSelectedIds([]); }
  function selectPushSubscribed() { setSelectedIds(submissions.filter(s => s.pushSubscription).map(s => s.id)); }

  async function sendPushNotifications() {
    if (!pushTitle.trim() || !pushBody.trim() || selectedSubs.length === 0) return;
    setPushSending(true);
    setPushResult(null);
    try {
      const res = await fetch('/api/notify-staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: managerPassword,
          emails: selectedSubs.map(s => s.email),
          title: pushTitle.trim(),
          body: pushBody.trim(),
        }),
      });
      const data = await res.json();
      setPushResult(data);
    } catch (e) {
      setPushResult({ error: 'Network error — try again' });
    } finally {
      setPushSending(false);
    }
  }

  const PUSH_PRESETS = [
    { label: '⛈ Weather Cancel', title: 'Today\'s League Cancelled', body: 'Junior League is cancelled today due to weather. We\'ll be in touch about rescheduling.' },
    { label: '🕐 Schedule Change', title: 'Schedule Update', body: 'There\'s been a change to today\'s Junior League schedule. Please check in with the pro shop on arrival.' },
    { label: '📋 Reminder', title: 'League Reminder', body: 'Reminder: Junior League is tomorrow. Please arrive 15 minutes early. See you out there!' },
    { label: '✅ All Set', title: 'You\'re Confirmed', body: 'You\'re confirmed for this week\'s Junior League. Thanks for signing up — see you Tuesday!' },
  ];

  function sendEmail() {
    const addrs = selectedSubs.map(s => s.email).join(',');
    window.location.href = 'mailto:?bcc=' + encodeURIComponent(addrs) + '&subject=' + encodeURIComponent('Interlachen Junior League 2026') + '&body=' + encodeURIComponent(msgText);
  }

  async function addHoursEntry(email) {
    if (!hoursCount || isNaN(Number(hoursCount))) return;
    setHoursWorking(true);
    try {
      const res = await fetch('/api/manager-hours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: managerPassword, action: 'add', email, payload: { date: hoursDate || new Date().toISOString().split('T')[0], hours: hoursCount, note: hoursNote } }),
      });
      if (res.ok) {
        setHoursFormId(null); setHoursDate(''); setHoursCount(''); setHoursNote('');
        onRefresh();
      }
    } finally { setHoursWorking(false); }
  }

  async function deleteHoursEntry(email, entryId) {
    setHoursWorking(true);
    try {
      const res = await fetch('/api/manager-hours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: managerPassword, action: 'delete', email, payload: { id: entryId } }),
      });
      if (res.ok) onRefresh();
    } finally { setHoursWorking(false); }
  }

  function downloadCSV() {
    const header = ['Name', 'Email', 'Phone', 'Returning', 'Bag Room', 'Available Dates', 'Total Hours', 'Submitted'];
    const rows = allSubmissions.map(s => [
      s.fullName, s.email, s.phone,
      s.returning ? 'Yes' : 'No',
      s.bagRoom ? 'Yes' : 'No',
      (s.availableDates || []).join('; '),
      totalHours(s.hours),
      formatDate(s.submittedAt),
    ]);
    const csv = [header, ...rows]
      .map(row => row.map(cell => '"' + String(cell ?? '').replace(/"/g, '""') + '"').join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'icc-junior-league-staff.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  // Stats
  const returning = submissions.filter((s) => s.returning).length;
  const bagRoom = submissions.filter((s) => s.bagRoom).length;

  return (
    <main
      className="min-h-screen"
      style={{ background: '#0d0d0d', fontFamily: "'Work Sans', sans-serif" }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-20 px-4 py-4 flex items-center justify-between"
        style={{ background: 'rgba(13,13,13,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="flex items-center gap-3">
          <Image src="/icc-logo.png" alt="ICC" width={36} height={36} style={{ objectFit: 'contain' }} />
          <div>
            <p className="text-xs font-bold" style={{ fontFamily: 'Raleway', color: 'white' }}>
              Junior League Applications
            </p>
            <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Summer 2026 · {total} total
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {allSubmissions.length > 0 && (
            <button
              onClick={downloadCSV}
              className="text-xs px-3 py-1.5 rounded-lg transition-colors"
              style={{ color: 'rgba(255,255,255,0.55)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              ↓ CSV
            </button>
          )}
          <button
            onClick={onLogout}
            className="text-xs px-3 py-1.5 rounded-lg transition-colors"
            style={{ color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            Log out
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Total Applicants', value: total, color: '#00af51' },
            { label: 'Returning Staff', value: returning, color: '#f4ee19' },
            { label: 'Bag Room Interest', value: bagRoom, color: '#00af51' },
          ].map(({ label, value, color }) => (
            <div key={label} className="glass-card rounded-2xl p-4 text-center">
              <div className="text-3xl font-extrabold mb-0.5" style={{ fontFamily: 'Raleway', color }}>
                {value}
              </div>
              <div className="text-[10px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {label}
              </div>
            </div>
          ))}
        </div>


        {/* Notification Banner */}
        {notifStatus !== 'granted' && notifStatus !== 'denied' && (
          <div className="glass-card rounded-2xl p-4 mb-4 flex items-center gap-4"
            style={{ border: '1px solid rgba(0,175,81,0.2)', background: 'rgba(0,175,81,0.04)' }}>
            <div className="flex-1 min-w-0">
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
          <div className="rounded-2xl px-4 py-3 mb-4 flex items-center gap-3"
            style={{ background: 'rgba(0,175,81,0.06)', border: '1px solid rgba(0,175,81,0.15)' }}>
            <span style={{ color: '#00af51' }}>&#x1F514;</span>
            <p className="text-xs font-semibold" style={{ color: '#00af51' }}>Push notifications active on this device</p>
          </div>
        )}
        {notifStatus === 'denied' && (
          <div className="rounded-2xl px-4 py-3 mb-4"
            style={{ background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.15)' }}>
            <p className="text-xs" style={{ color: 'rgba(248,113,113,0.8)' }}>
              Notifications blocked. Go to browser settings, allow notifications for this site, then refresh.
            </p>
          </div>
        )}
        {/* Date Coverage */}
        <div className='glass-card rounded-2xl p-5 mb-4'>
          <div className='flex items-center justify-between mb-4'>
            <div>
              <p className='text-xs font-bold uppercase tracking-widest text-white' style={{ fontFamily: 'Raleway' }}>Staff Coverage by Date</p>
              <p className='text-[10px] mt-0.5' style={{ color: 'rgba(255,255,255,0.3)' }}>How many applicants are available each Tuesday</p>
            </div>
            <div className='flex items-center gap-3 text-[10px]' style={{ color: 'rgba(255,255,255,0.3)' }}>
              <span className='flex items-center gap-1'><span className='w-2 h-2 rounded-sm inline-block' style={{ background: '#00af51' }}></span>3+</span>
              <span className='flex items-center gap-1'><span className='w-2 h-2 rounded-sm inline-block' style={{ background: '#f4ee19' }}></span>1–2</span>
              <span className='flex items-center gap-1'><span className='w-2 h-2 rounded-sm inline-block' style={{ background: 'rgba(255,255,255,0.1)' }}></span>0</span>
            </div>
          </div>
          <div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2'>
            {TUESDAYS.map(({ date, label, month }) => {
              const count = allSubmissions.filter(s => s.availableDates && s.availableDates.includes(date)).length;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              const barColor = count >= 3 ? '#00af51' : count > 0 ? '#f4ee19' : 'rgba(255,255,255,0.07)';
              const textColor = count >= 3 ? '#00af51' : count > 0 ? '#f4ee19' : 'rgba(255,255,255,0.2)';
              return (
                <button
                  key={date}
                  type='button'
                  onClick={() => setFilterDate(filterDate === date ? '' : date)}
                  className='rounded-xl p-3 text-center transition-all duration-150'
                  style={{
                    background: filterDate === date ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
                    border: filterDate === date ? '1px solid rgba(255,255,255,0.18)' : '1px solid rgba(255,255,255,0.07)',
                    cursor: 'pointer',
                  }}
                >
                  <div className='text-[9px] uppercase tracking-widest mb-1' style={{ color: 'rgba(255,255,255,0.25)' }}>
                    {label.split(' ')[0]}
                  </div>
                  <div className='text-lg font-black leading-none mb-1' style={{ fontFamily: 'Raleway', color: textColor }}>
                    {count}
                  </div>
                  <div className='text-[9px] mb-2' style={{ color: 'rgba(255,255,255,0.2)' }}>
                    {label.split(' ')[1]}
                  </div>
                  <div className='h-1 rounded-full overflow-hidden' style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className='h-full rounded-full transition-all duration-300' style={{ width: pct + '%', background: barColor }} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
                {/* Filters */}
        <div className="glass-card rounded-2xl p-4 mb-4 flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Filter by date:
            </span>
            <select
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="text-xs rounded-lg px-3 py-2 outline-none"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontFamily: 'Work Sans' }}
            >
              <option value="">All dates</option>
              {TUESDAYS.map(({ date, label }) => (
                <option key={date} value={date}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Sort:
            </span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="text-xs rounded-lg px-3 py-2 outline-none"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontFamily: 'Work Sans' }}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>
          {filterDate && (
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {submissions.length} result{submissions.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Messaging bar */}
        {submissions.length > 0 && (
          <div className="glass-card rounded-2xl p-4 mb-4">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <div className="flex gap-2 flex-wrap">
                <button type="button" onClick={selectAll}
                  className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors"
                  style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  Select All ({submissions.length})
                </button>
                {submissions.some(s => s.pushSubscription) && (
                  <button type="button" onClick={selectPushSubscribed}
                    className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors"
                    style={{ background: 'rgba(0,175,81,0.08)', color: '#00af51', border: '1px solid rgba(0,175,81,0.2)' }}>
                    🔔 Select Subscribed ({submissions.filter(s => s.pushSubscription).length})
                  </button>
                )}
                {selectedIds.length > 0 && (
                  <button type="button" onClick={clearSelect}
                    className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors"
                    style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    Clear
                  </button>
                )}
              </div>
              {selectedIds.length > 0 && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(0,175,81,0.12)', color: '#00af51', border: '1px solid rgba(0,175,81,0.2)' }}>
                  {selectedIds.length} selected
                </span>
              )}
            </div>
            {selectedIds.length > 0 && (
              <div className="space-y-3">
                <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  {[{ id: 'email', label: '✉ Email' }, { id: 'sms', label: '📱 SMS' }, { id: 'push', label: '🔔 Push' }].map(m => (
                    <button key={m.id} onClick={() => { setMsgMode(m.id); setPushResult(null); }}
                      className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all"
                      style={{ background: msgMode === m.id ? 'rgba(255,255,255,0.1)' : 'transparent', color: msgMode === m.id ? 'white' : 'rgba(255,255,255,0.35)' }}>
                      {m.label}
                    </button>
                  ))}
                </div>
                {msgMode === 'email' && (
                  <div className="space-y-2">
                    <textarea
                      value={msgText} onChange={e => setMsgText(e.target.value)}
                      placeholder="Type your message… (opens your email app)"
                      rows={3} className="w-full text-sm rounded-xl px-3 py-2.5 outline-none resize-none"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontFamily: "'Work Sans'" }} />
                    <button onClick={sendEmail}
                      className="w-full py-2.5 rounded-xl text-sm font-bold transition-all"
                      style={{ background: '#00af51', color: 'white' }}>
                      Open Email → {selectedSubs.map(s => s.email).join(', ')}
                    </button>
                  </div>
                )}
                {msgMode === 'sms' && (
                  <div>
                    <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      Copy these numbers into your texting app:
                    </p>
                    <div className="rounded-xl p-3 space-y-1.5"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      {selectedSubs.map(s => (
                        <div key={s.id} className="flex justify-between items-center">
                          <span className="text-xs font-medium text-white">{s.fullName}</span>
                          <span className="text-xs font-mono" style={{ color: '#00af51' }}>{s.phone}</span>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => { navigator.clipboard.writeText(selectedSubs.map(s => s.phone).join(', ')); }}
                      className="w-full mt-2 py-2.5 rounded-xl text-sm font-bold transition-all"
                      style={{ background: 'rgba(255,255,255,0.08)', color: 'white', border: '1px solid rgba(255,255,255,0.12)' }}>
                      Copy All Numbers
                    </button>
                  </div>
                )}
                {msgMode === 'push' && (
                  <div className="space-y-3">
                    {/* Recipient summary */}
                    <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <p className="text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Sending to:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedSubs.map(s => (
                          <span key={s.id} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                            style={{
                              background: s.pushSubscription ? 'rgba(0,175,81,0.12)' : 'rgba(255,255,255,0.05)',
                              color: s.pushSubscription ? '#00af51' : 'rgba(255,255,255,0.3)',
                              border: `1px solid ${s.pushSubscription ? 'rgba(0,175,81,0.2)' : 'rgba(255,255,255,0.08)'}`,
                            }}>
                            {s.pushSubscription ? '🔔' : '○'} {s.fullName}
                          </span>
                        ))}
                      </div>
                      {selectedSubs.some(s => !s.pushSubscription) && (
                        <p className="text-[10px] mt-2" style={{ color: 'rgba(255,255,255,0.25)' }}>
                          ○ = not subscribed to push — won't receive notification
                        </p>
                      )}
                    </div>
                    {/* Quick presets */}
                    <div>
                      <p className="text-xs mb-2 font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>Quick presets:</p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {PUSH_PRESETS.map(p => (
                          <button key={p.label} type="button"
                            onClick={() => { setPushTitle(p.title); setPushBody(p.body); setPushResult(null); }}
                            className="text-left text-xs px-3 py-2 rounded-xl transition-all"
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Custom message */}
                    <div className="space-y-2">
                      <input
                        type="text" value={pushTitle} onChange={e => { setPushTitle(e.target.value); setPushResult(null); }}
                        placeholder="Notification title…"
                        className="w-full text-sm rounded-xl px-3 py-2.5 outline-none"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontFamily: "'Work Sans'" }} />
                      <textarea
                        value={pushBody} onChange={e => { setPushBody(e.target.value); setPushResult(null); }}
                        placeholder="Message body…"
                        rows={3} className="w-full text-sm rounded-xl px-3 py-2.5 outline-none resize-none"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontFamily: "'Work Sans'" }} />
                      <button
                        onClick={sendPushNotifications}
                        disabled={pushSending || !pushTitle.trim() || !pushBody.trim() || !selectedSubs.some(s => s.pushSubscription)}
                        className="w-full py-2.5 rounded-xl text-sm font-bold transition-all"
                        style={{
                          background: '#00af51',
                          color: 'white',
                          opacity: (pushSending || !pushTitle.trim() || !pushBody.trim() || !selectedSubs.some(s => s.pushSubscription)) ? 0.5 : 1,
                          cursor: (pushSending || !pushTitle.trim() || !pushBody.trim() || !selectedSubs.some(s => s.pushSubscription)) ? 'not-allowed' : 'pointer',
                        }}>
                        {pushSending ? 'Sending…' : `Send Push to ${selectedSubs.filter(s => s.pushSubscription).length} subscriber${selectedSubs.filter(s => s.pushSubscription).length !== 1 ? 's' : ''}`}
                      </button>
                      {pushResult && (
                        <div className="rounded-xl p-3 text-xs space-y-0.5"
                          style={{
                            background: pushResult.error ? 'rgba(248,113,113,0.06)' : 'rgba(0,175,81,0.06)',
                            border: `1px solid ${pushResult.error ? 'rgba(248,113,113,0.2)' : 'rgba(0,175,81,0.2)'}`,
                          }}>
                          {pushResult.error ? (
                            <p style={{ color: '#f87171' }}>✗ {pushResult.error}</p>
                          ) : (
                            <>
                              {pushResult.sent > 0 && <p style={{ color: '#00af51' }}>✓ Sent to {pushResult.sent} device{pushResult.sent !== 1 ? 's' : ''}</p>}
                              {pushResult.failed > 0 && <p style={{ color: '#f87171' }}>✗ {pushResult.failed} failed (subscription may be expired)</p>}
                              {pushResult.noSub > 0 && <p style={{ color: 'rgba(255,255,255,0.35)' }}>○ {pushResult.noSub} not subscribed — skipped</p>}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
                {/* Applicants list */}
        {submissions.length === 0 ? (
          <div className="glass-card rounded-2xl p-10 text-center">
            <p style={{ color: 'rgba(255,255,255,0.3)' }}>No applications yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {submissions.map((sub, i) => {
              const expanded = expandedId === sub.id;
              return (
                <div
                  key={sub.id}
                  className="glass-card rounded-2xl overflow-hidden transition-all duration-200"
                  style={{ border: expanded ? '1px solid rgba(0,175,81,0.3)' : '1px solid rgba(255,255,255,0.08)' }}
                >
                  {/* Row summary */}
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); toggleSelect(sub.id); }}
                      className="flex-shrink-0 w-10 h-full flex items-center justify-center pl-4"
                      style={{ color: selectedIds.includes(sub.id) ? '#00af51' : 'rgba(255,255,255,0.15)' }}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        {selectedIds.includes(sub.id)
                          ? <><rect width="16" height="16" rx="4" fill="#00af51"/><path d="M4 8l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></>
                          : <rect width="15" height="15" x="0.5" y="0.5" rx="3.5" stroke="rgba(255,255,255,0.2)"/>}
                      </svg>
                    </button>
                  </div>
                  <button
                    type="button"
                    className="flex-1 text-left px-3 py-4 flex items-center gap-4"
                    onClick={() => setExpandedId(expanded ? null : sub.id)}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                      style={{ background: 'rgba(0,175,81,0.12)', color: '#00af51', fontFamily: 'Raleway' }}
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-white" style={{ fontFamily: 'Raleway' }}>
                          {sub.fullName}
                        </span>
                        {sub.pushSubscription && (
                          <span title="Push notifications enabled" style={{ color: '#00af51', fontSize: '12px', lineHeight: 1 }}>🔔</span>
                        )}
                        {sub.returning && <Badge green>Returning</Badge>}
                        {totalHours(sub.hours) > 0 && <Badge green>{totalHours(sub.hours)}h worked</Badge>}
                        {sub.bagRoom && <Badge yellow>Bag Room</Badge>}
                      </div>
                      <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        {sub.email} · {sub.availableDates.length} dates · {totalHours(sub.hours)}h · {formatDate(sub.submittedAt)}
                      </p>
                    </div>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="rgba(255,255,255,0.3)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'none', flexShrink: 0 }}
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>

                  {/* Expanded detail */}
                  {expanded && (
                    <div
                      className="px-5 pb-5 space-y-4"
                      style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                        <div>
                          <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                            Contact
                          </p>
                          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>{sub.email}</p>
                          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>{sub.phone}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                            Preferences
                          </p>
                          <div className="flex gap-2 flex-wrap">
                            <Badge green={sub.returning} >{sub.returning ? '✓ Returning' : '✗ Not returning'}</Badge>
                            <Badge green={sub.bagRoom} yellow={!sub.bagRoom}>{sub.bagRoom ? '✓ Bag Room' : '✗ No bag room'}</Badge>
                          </div>
                        </div>
                      </div>

                      {sub.juniorExperience && (
                        <div>
                          <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                            Junior Golf Experience
                          </p>
                          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
                            {sub.juniorExperience}
                          </p>
                        </div>
                      )}

                      {sub.golfExperience && (
                        <div>
                          <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                            Golf Background
                          </p>
                          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
                            {sub.golfExperience}
                          </p>
                        </div>
                      )}

                      <div>
                        <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
                          Available Tuesdays ({sub.availableDates.length} of {TUESDAYS.length})
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {TUESDAYS.map(({ date, label }) => {
                            const avail = sub.availableDates.includes(date);
                            return (
                              <span
                                key={date}
                                className="text-xs px-2.5 py-1 rounded-lg font-medium"
                                style={{
                                  background: avail ? 'rgba(0,175,81,0.15)' : 'rgba(255,255,255,0.04)',
                                  color: avail ? '#00af51' : 'rgba(255,255,255,0.2)',
                                  border: `1px solid ${avail ? 'rgba(0,175,81,0.25)' : 'rgba(255,255,255,0.06)'}`,
                                }}
                              >
                                {label}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      {/* Hours Logging */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[10px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
                            Hours Worked — {totalHours(sub.hours)}h total
                          </p>
                          <button
                            type="button"
                            onClick={() => setHoursFormId(hoursFormId === sub.id ? null : sub.id)}
                            className="text-xs px-2.5 py-1 rounded-lg transition-colors"
                            style={{ background: 'rgba(0,175,81,0.08)', color: '#00af51', border: '1px solid rgba(0,175,81,0.2)' }}>
                            {hoursFormId === sub.id ? 'Cancel' : '+ Log Hours'}
                          </button>
                        </div>

                        {/* Existing entries */}
                        {(sub.hours || []).length > 0 && (
                          <div className="rounded-xl overflow-hidden mb-2" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                            {(sub.hours || []).sort((a, b) => new Date(b.date) - new Date(a.date)).map(entry => (
                              <div key={entry.id} className="flex items-center justify-between px-3 py-2"
                                style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.02)' }}>
                                <div className="flex items-center gap-3">
                                  <span className="text-xs font-mono font-bold" style={{ color: '#00af51' }}>{entry.hours}h</span>
                                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                                    {new Date(entry.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    {entry.note ? ` · ${entry.note}` : ''}
                                  </span>
                                </div>
                                <button type="button" onClick={() => deleteHoursEntry(sub.email, entry.id)} disabled={hoursWorking}
                                  className="text-[10px] px-2 py-0.5 rounded transition-colors"
                                  style={{ color: 'rgba(248,113,113,0.5)', background: 'transparent' }}>
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        {(sub.hours || []).length === 0 && hoursFormId !== sub.id && (
                          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>No hours logged yet.</p>
                        )}

                        {/* Add hours form */}
                        {hoursFormId === sub.id && (
                          <div className="rounded-xl p-3 space-y-2" style={{ background: 'rgba(0,175,81,0.04)', border: '1px solid rgba(0,175,81,0.15)' }}>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] uppercase tracking-widest block mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Date</label>
                                <input type="date" value={hoursDate} onChange={e => setHoursDate(e.target.value)}
                                  className="w-full text-xs rounded-lg px-2.5 py-2 outline-none"
                                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontFamily: "'Work Sans'" }}
                                  defaultValue={new Date().toISOString().split('T')[0]} />
                              </div>
                              <div>
                                <label className="text-[10px] uppercase tracking-widest block mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Hours</label>
                                <input type="number" min="0.5" max="24" step="0.5" value={hoursCount} onChange={e => setHoursCount(e.target.value)}
                                  placeholder="e.g. 4"
                                  className="w-full text-xs rounded-lg px-2.5 py-2 outline-none"
                                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontFamily: "'Work Sans'" }} />
                              </div>
                            </div>
                            <input type="text" value={hoursNote} onChange={e => setHoursNote(e.target.value)}
                              placeholder="Note (optional — e.g. Junior League, Bag Drop)"
                              className="w-full text-xs rounded-lg px-2.5 py-2 outline-none"
                              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontFamily: "'Work Sans'" }} />
                            <button type="button" onClick={() => addHoursEntry(sub.email)} disabled={hoursWorking || !hoursCount}
                              className="w-full py-2 rounded-lg text-xs font-bold transition-all"
                              style={{ background: '#00af51', color: 'white', opacity: (hoursWorking || !hoursCount) ? 0.5 : 1 }}>
                              {hoursWorking ? 'Saving…' : 'Save Hours'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style jsx global>{`
        select option { background: #1a1a1a; }
      `}</style>
    </main>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ManagerPage() {
  const [password, setPassword] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [sort, setSort] = useState('newest');

  useEffect(() => { fetchSubmissions(); }, []);
  async function fetchSubmissions(pw) {
    try {
      const res = await fetch(`/api/submissions?password=${encodeURIComponent(pw || password)}`);
      if (res.ok) setSubmissions(await res.json());
    } catch { /* silent refresh */ }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/submissions?password=${encodeURIComponent(password)}`);
      if (res.ok) {
        setSubmissions(await res.json());
      } else {
        setError('Incorrect password. Try again.');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const displayed = submissions
    ? submissions
        .filter((s) => !filterDate || s.availableDates.includes(filterDate))
        .sort((a, b) =>
          sort === 'newest'
            ? new Date(b.submittedAt) - new Date(a.submittedAt)
            : new Date(a.submittedAt) - new Date(b.submittedAt)
        )
    : [];

  return (
    <>
      <Head>
        <title>Manager — ICC Junior League Applications</title>
        <meta name="robots" content="noindex,nofollow" />
        <link
          href="https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;600;700;800&family=Work+Sans:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </Head>
      {!submissions ? (
        <LoginScreen
          password={password}
          setPassword={setPassword}
          onSubmit={handleLogin}
          loading={loading}
          error={error}
        />
      ) : (
        <Dashboard
          submissions={displayed}
          allSubmissions={submissions}
          total={submissions.length}
          filterDate={filterDate}
          setFilterDate={setFilterDate}
          sort={sort}
          setSort={setSort}
          onLogout={() => { setSubmissions(null); setPassword(''); }}
          managerPassword={password}
          onRefresh={() => fetchSubmissions()}
        />
      )}
    </>
  );
}
