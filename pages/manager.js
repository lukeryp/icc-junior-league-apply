import { useState } from 'react';
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
          <p className="text-xs font-semibold tracking-[0.3em] uppercase mb-1" style={{ color: '#00af51' }}>
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

function Dashboard({ submissions, total, filterDate, setFilterDate, sort, setSort, onLogout }) {
  const [expandedId, setExpandedId] = useState(null);

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
        <button
          onClick={onLogout}
          className="text-xs px-3 py-1.5 rounded-lg transition-colors"
          style={{ color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          Log out
        </button>
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
                  <button
                    type="button"
                    className="w-full text-left px-5 py-4 flex items-center gap-4"
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
                        {sub.returning && <Badge green>Returning</Badge>}
                        {sub.bagRoom && <Badge yellow>Bag Room</Badge>}
                      </div>
                      <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        {sub.email} · {sub.availableDates.length} dates · {formatDate(sub.submittedAt)}
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
  const [submissions, setSubmissions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [sort, setSort] = useState('newest');

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
          total={submissions.length}
          filterDate={filterDate}
          setFilterDate={setFilterDate}
          sort={sort}
          setSort={setSort}
          onLogout={() => { setSubmissions(null); setPassword(''); }}
        />
      )}
    </>
  );
}
