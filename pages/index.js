import { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';

// All Tuesdays June 2 – August 11, 2026
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

const MAX_WORDS = 100;

function countWords(text) {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).filter(Boolean).length;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function FormSection({ number, title, subtitle, children }) {
  return (
    <div className="glass-card rounded-3xl p-6 sm:p-7">
      <div className="flex items-start gap-3 mb-6">
        <span
          className="shrink-0 mt-0.5 text-[10px] font-bold tracking-widest px-2 py-1 rounded-lg"
          style={{ fontFamily: 'proxima-nova, Helvetica Neue, sans-serif', background: 'rgba(158,129,47,0.1)', color: '#9e812f' }}
        >
          {number}
        </span>
        <div>
          <h2 className="text-lg font-bold leading-tight" style={{ fontFamily: "'kepler-std', Georgia, serif", color: '#1a1a1a' }}>
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs mt-0.5" style={{ fontFamily: 'proxima-nova, Helvetica Neue, sans-serif', color: 'rgba(26,26,26,0.45)' }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

function FieldLabel({ label, required, sublabel }) {
  return (
    <div className="mb-1.5">
      <span className="text-sm font-medium" style={{ fontFamily: 'proxima-nova, Helvetica Neue, sans-serif', color: 'rgba(26,26,26,0.75)' }}>
        {label}
        {required && <span style={{ color: '#9e812f' }}> *</span>}
      </span>
      {sublabel && (
        <p className="text-xs mt-0.5" style={{ fontFamily: 'proxima-nova, Helvetica Neue, sans-serif', color: 'rgba(26,26,26,0.4)' }}>
          {sublabel}
        </p>
      )}
    </div>
  );
}

function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <p className="text-xs mt-1.5" style={{ fontFamily: 'proxima-nova, Helvetica Neue, sans-serif', color: 'rgba(185,28,28,0.85)' }} data-field-error>
      {msg}
    </p>
  );
}

function WordCountTextarea({ value, onChange, placeholder, maxWords }) {
  const count = countWords(value);
  const pct = count / maxWords;
  const nearLimit = pct >= 0.8 && pct < 1;
  const atLimit = count >= maxWords;

  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={4}
        className="form-input resize-none"
        style={{ paddingBottom: '32px', fontFamily: 'proxima-nova, Helvetica Neue, sans-serif' }}
      />
      <div
        className="absolute bottom-3 right-3 text-[10px] font-semibold pointer-events-none"
        style={{
          fontFamily: 'proxima-nova, Helvetica Neue, sans-serif',
          color: atLimit ? 'rgba(185,28,28,0.8)' : nearLimit ? '#9e812f' : 'rgba(26,26,26,0.25)',
          transition: 'color 0.2s',
        }}
      >
        {count}/{maxWords}
      </div>
    </div>
  );
}

function YesNoToggle({ value, onChange }) {
  return (
    <div className="flex gap-2">
      {[
        { val: true,  label: 'Yes' },
        { val: false, label: 'No'  },
      ].map(({ val, label }) => {
        const selected = value === val;
        const isYes = val === true;
        return (
          <button
            key={String(val)}
            type="button"
            onClick={() => onChange(val)}
            className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
            style={{
              fontFamily: 'proxima-nova, Helvetica Neue, sans-serif',
              background: selected
                ? isYes ? '#9e812f' : 'rgba(185,28,28,0.1)'
                : 'white',
              border: `1px solid ${
                selected
                  ? isYes ? '#9e812f' : 'rgba(185,28,28,0.4)'
                  : 'rgba(0,0,0,0.12)'
              }`,
              color: selected
                ? isYes ? 'white' : 'rgba(185,28,28,0.85)'
                : 'rgba(26,26,26,0.45)',
              boxShadow: selected && isYes ? '0 2px 10px rgba(158,129,47,0.2)' : 'none',
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function SuccessScreen() {
  return (
    <>
      <Head>
        <title>Application Submitted — Interlachen Country Club Junior League</title>
      </Head>
      <main
        className="min-h-screen flex flex-col items-center justify-center px-6"
        style={{
          background: '#faf9f7',
          fontFamily: "proxima-nova, 'Helvetica Neue', sans-serif",
        }}
      >
        <div className="text-center max-w-sm animate-fade-up">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-7 animate-pulse-green"
            style={{ background: 'linear-gradient(135deg, #9e812f, #b89540)', boxShadow: '0 4px 24px rgba(158,129,47,0.25)' }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <div className="mb-2 text-xs font-semibold tracking-[0.3em] uppercase" style={{ color: 'rgba(26,26,26,0.45)' }}>
            Interlachen Country Club
          </div>
          <h1 className="text-3xl font-extrabold mb-4 leading-tight" style={{ fontFamily: "'kepler-std', Georgia, serif", color: '#1a1a1a' }}>
            Application Received
          </h1>
          <p className="leading-relaxed mb-8 text-sm" style={{ color: 'rgba(26,26,26,0.55)' }}>
            Thank you for your interest in the Interlachen Junior League summer staff. We'll review your
            application and be in touch soon.
          </p>

          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-1">
              <span style={{ color: '#9e812f' }}>⛳</span>
              <span className="text-xs font-semibold tracking-wide" style={{ color: 'rgba(26,26,26,0.5)' }}>
                What's Next
              </span>
            </div>
            <p className="text-sm" style={{ color: 'rgba(26,26,26,0.5)' }}>
              The golf operations team will reach out to discuss scheduling and next steps for the 2026 summer season.
            </p>
            <p className="text-center text-xs mt-6" style={{ color: 'rgba(26,26,26,0.3)', fontFamily: 'proxima-nova, Helvetica Neue, sans-serif' }}>
              Log hours &amp; update dates: <a href="/portal" className="underline" style={{ color: 'rgba(26,26,26,0.5)' }}>Staff Portal →</a>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ApplyPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    juniorExperience: '',
    golfExperience: '',
    returning: null,
    bagRoom: null,
  });
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedDates, setSelectedDates] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function updateField(field) {
    return (e) => {
      const val = typeof e === 'string' ? e : e.target.value;
      setFormData((p) => ({ ...p, [field]: val }));
      if (errors[field]) setErrors((p) => ({ ...p, [field]: null }));
    };
  }

  function updateTextarea(field) {
    return (e) => {
      const val = e.target.value;
      const words = val.trim() === '' ? [] : val.trim().split(/\s+/).filter(Boolean);
      if (words.length <= MAX_WORDS) {
        setFormData((p) => ({ ...p, [field]: val }));
      }
    };
  }

  function toggleDate(date) {
    setSelectedDates((p) => (p.includes(date) ? p.filter((d) => d !== date) : [...p, date]));
    if (errors.dates) setErrors((p) => ({ ...p, dates: null }));
  }

  function validate() {
    const e = {};
    if (!formData.fullName.trim()) e.fullName = 'Full name is required';
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      e.email = 'Enter a valid email address';
    if (!formData.phone.trim()) e.phone = 'Phone number is required';
    if (formData.returning === null) e.returning = 'Please select an option';
    if (formData.bagRoom === null) e.bagRoom = 'Please select an option';
    if (!password || password.length < 6) e.password = 'Password must be at least 6 characters';
    if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      const el = document.querySelector('[data-field-error]');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, availableDates: selectedDates, password }),
      });
      if (res.ok) {
        setSubmitted(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        throw new Error();
      }
    } catch {
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) return <SuccessScreen />;

  const datesCount = selectedDates.length;
  const progressPct = Math.min((datesCount / TUESDAYS.length) * 100, 100);

  return (
    <>
      <Head>
        <title>Interlachen Country Club Junior League Staff Application 2026</title>
        <meta
          name="description"
          content="Now hiring summer golf staff for the Interlachen Country Club Junior League. $15/hr plus practice privileges."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#faf9f7" />
        <meta property="og:title" content="Interlachen Country Club — Junior League Staff Application 2026" />
        <meta property="og:description" content="$15/hr + practice privileges at Interlachen Country Club. Walk with junior golfers this summer. Apply now." />
        <meta property="og:type" content="website" />
      </Head>

      <main className="min-h-screen" style={{ fontFamily: "proxima-nova, 'Helvetica Neue', sans-serif", background: '#faf9f7' }}>

        {/* ═══ HERO ═══════════════════════════════════════════════════════════ */}
        <section
          className="relative overflow-hidden flex flex-col items-center text-center"
          style={{
            background: 'radial-gradient(ellipse 100% 80% at 50% -5%, rgba(158,129,47,0.1) 0%, transparent 60%), #faf9f7',
            paddingTop: '56px',
            paddingBottom: '48px',
            paddingLeft: '24px',
            paddingRight: '24px',
          }}
        >
          {/* Subtle grid */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(rgba(0,0,0,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.025) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />
          {/* Soft gold glow at top */}
          <div
            className="absolute pointer-events-none"
            style={{
              top: '-120px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '500px',
              height: '500px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(158,129,47,0.07) 0%, transparent 65%)',
            }}
          />

          <div className="relative z-10 flex flex-col items-center w-full max-w-lg">
            {/* ICC Logo */}
            <div className="mb-6 animate-fade-up">
              <Image
                src="/icc-logo.png"
                alt="Interlachen Country Club"
                width={110}
                height={110}
                priority
                style={{ objectFit: 'contain' }}
              />
            </div>

            {/* Club name */}
            <p
              className="animate-fade-up-delay-1 text-xs font-semibold tracking-[0.35em] uppercase mb-1"
              style={{ color: 'rgba(26,26,26,0.45)' }}
            >
              Interlachen Country Club
            </p>

            {/* EST. 1909 */}
            <p
              className="animate-fade-up-delay-1 text-[10px] tracking-[0.25em] uppercase mb-2"
              style={{ color: '#9e812f', fontFamily: "'kepler-std', Georgia, serif", fontStyle: 'italic' }}
            >
              Est. 1909
            </p>

            {/* Thin gold divider */}
            <div
              className="animate-fade-up-delay-1 w-16 h-px my-3"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(158,129,47,0.4), transparent)' }}
            />

            {/* Title */}
            <h1
              className="animate-fade-up-delay-2 font-extrabold leading-tight mb-1"
              style={{ fontFamily: "'kepler-std', Georgia, serif", fontSize: 'clamp(28px, 8vw, 46px)', color: '#1a1a1a' }}
            >
              Junior League
            </h1>
            <h2
              className="animate-fade-up-delay-2 font-light mb-3"
              style={{ fontFamily: "'kepler-std', Georgia, serif", fontSize: 'clamp(18px, 4.5vw, 26px)', color: 'rgba(26,26,26,0.55)' }}
            >
              Staff Application 2026
            </h2>
            <p
              className="animate-fade-up-delay-2 text-xs tracking-[0.2em] uppercase mb-7"
              style={{ color: '#9e812f', fontFamily: "'kepler-std', Georgia, serif", fontStyle: 'italic', letterSpacing: '0.18em' }}
            >
              Enriching The Lives Of Our Members
            </p>

            {/* Badges */}
            <div className="animate-fade-up-delay-3 flex flex-wrap justify-center gap-2 mb-8">
              <span
                className="px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide"
                style={{ background: '#9e812f', color: 'white', boxShadow: '0 2px 8px rgba(158,129,47,0.3)' }}
              >
                Now Hiring
              </span>
              <span
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide"
                style={{
                  background: 'rgba(158,129,47,0.1)',
                  color: '#9e812f',
                  border: '1px solid rgba(158,129,47,0.25)',
                }}
              >
                $15 / hr
              </span>
              <span
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide"
                style={{ background: 'white', color: 'rgba(26,26,26,0.5)', border: '1px solid rgba(0,0,0,0.1)' }}
              >
                Summer 2026
              </span>
              <span
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide"
                style={{ background: 'white', color: 'rgba(26,26,26,0.5)', border: '1px solid rgba(0,0,0,0.1)' }}
              >
                Tuesdays
              </span>
            </div>

            {/* CTA arrow */}
            <div className="animate-fade-up-delay-4">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(26,26,26,0.2)"
                strokeWidth="1.5"
                style={{ animation: 'bounce 2s infinite' }}
              >
                <path d="M7 10l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </section>

        {/* ═══ POSITION OVERVIEW ══════════════════════════════════════════════ */}
        <section className="px-4 py-6 max-w-2xl mx-auto">
          <div className="grid grid-cols-2 gap-2.5 mb-3">
            {[
              { icon: '📍', label: 'Location', value: 'Meadow Brook Golf Course' },
              { icon: '📅', label: 'Schedule', value: 'Tuesdays · 8am – 3pm' },
              { icon: '💵', label: 'Pay Rate', value: '$15 per hour' },
            ].map(({ icon, label, value }) => (
              <div key={label} className="glass-card rounded-2xl p-4">
                <div className="text-xl mb-2 leading-none">{icon}</div>
                <div
                  className="text-[9px] uppercase tracking-widest font-semibold mb-1"
                  style={{ color: 'rgba(26,26,26,0.35)' }}
                >
                  {label}
                </div>
                <div className="text-sm font-medium leading-snug" style={{ color: 'rgba(26,26,26,0.85)' }}>
                  {value}
                </div>
              </div>
            ))}
          </div>

          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-4 rounded-full" style={{ background: '#9e812f' }} />
              <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9e812f' }}>
                About the Role
              </h3>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(26,26,26,0.6)' }}>
              Walk alongside junior golfers during their rounds at Meadow Brook on Tuesdays throughout the
              summer. You'll help with safety, golf etiquette, and course management. We ask you to commit
              to 5+ days throughout the summer. If you know your schedule now, please fill it out. If not,
              you can do it later.
            </p>
            <div
              className="mt-3 pt-3 text-xs leading-relaxed"
              style={{ borderTop: '1px solid rgba(0,0,0,0.07)', color: 'rgba(26,26,26,0.45)' }}
            >
              <span style={{ color: '#9e812f' }}>★</span> Candidates who are also interested in working in the
              bag room are preferred.
            </div>
          </div>
        </section>

        {/* ═══ APPLICATION FORM ═══════════════════════════════════════════════ */}
        <form onSubmit={handleSubmit} noValidate className="max-w-2xl mx-auto px-4 pb-28 space-y-3">

          {/* ── 01 Personal Information ── */}
          <FormSection number="01" title="Personal Information">
            <div className="space-y-3">
              <div>
                <FieldLabel label="Full Name" required />
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={updateField('fullName')}
                  placeholder="Your full name"
                  className={`form-input ${errors.fullName ? 'error' : ''}`}
                  autoComplete="name"
                />
                <FieldError msg={errors.fullName} />
              </div>
              <div>
                <FieldLabel label="Email Address" required />
                <input
                  type="email"
                  value={formData.email}
                  onChange={updateField('email')}
                  placeholder="you@example.com"
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  inputMode="email"
                  autoComplete="email"
                />
                <FieldError msg={errors.email} />
              </div>
              <div>
                <FieldLabel label="Phone Number" required />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={updateField('phone')}
                  placeholder="(612) 555-0100"
                  className={`form-input ${errors.phone ? 'error' : ''}`}
                  inputMode="tel"
                  autoComplete="tel"
                />
                <FieldError msg={errors.phone} />
              </div>
            </div>
          </FormSection>

          {/* ── 02 Experience ── */}
          <FormSection
            number="02"
            title="Golf Experience"
            subtitle="100 word max per response"
          >
            <div className="space-y-5">
              <div>
                <FieldLabel
                  label="Experience with junior golfers"
                  sublabel="Any coaching, caddying, youth clinics, camp counseling, etc."
                />
                <WordCountTextarea
                  value={formData.juniorExperience}
                  onChange={updateTextarea('juniorExperience')}
                  placeholder="Describe your experience working with or around junior golfers..."
                  maxWords={MAX_WORDS}
                />
                <FieldError msg={errors.juniorExperience} />
              </div>
              <div>
                <FieldLabel
                  label="Your golf background"
                  sublabel="Handicap, years played, courses, any competitive experience."
                />
                <WordCountTextarea
                  value={formData.golfExperience}
                  onChange={updateTextarea('golfExperience')}
                  placeholder="Tell us about your golf game and experience..."
                  maxWords={MAX_WORDS}
                />
                <FieldError msg={errors.golfExperience} />
              </div>
            </div>
          </FormSection>

          {/* ── 03 Additional Info ── */}
          <FormSection number="03" title="Additional Information">
            <div className="space-y-5">
              <div>
                <FieldLabel label="Returning Interlachen employee?" required />
                <YesNoToggle
                  value={formData.returning}
                  onChange={(val) => {
                    setFormData((p) => ({ ...p, returning: val }));
                    setErrors((p) => ({ ...p, returning: null }));
                  }}
                />
                <FieldError msg={errors.returning} />
              </div>
              <div>
                <FieldLabel
                  label="Interested in also working in the bag room?"
                  required
                  sublabel="Candidates interested in bag room work are preferred."
                />
                <YesNoToggle
                  value={formData.bagRoom}
                  onChange={(val) => {
                    setFormData((p) => ({ ...p, bagRoom: val }));
                    setErrors((p) => ({ ...p, bagRoom: null }));
                  }}
                />
                <FieldError msg={errors.bagRoom} />
              </div>
            </div>
          </FormSection>

          {/* ── 04 Availability ── */}
          <FormSection
            number="04"
            title="Tuesday Availability"
            subtitle="Select every Tuesday you're available this summer"
          >
            {/* Counter header */}
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs" style={{ color: 'rgba(26,26,26,0.4)' }}>
                Select the Tuesdays you're available
              </p>
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full transition-all duration-300"
                style={{
                  background: datesCount > 0 ? 'rgba(158,129,47,0.1)' : 'rgba(0,0,0,0.05)',
                  color: datesCount > 0 ? '#9e812f' : 'rgba(26,26,26,0.35)',
                  border: `1px solid ${datesCount > 0 ? 'rgba(158,129,47,0.25)' : 'rgba(0,0,0,0.08)'}`,
                }}
              >
                {datesCount} of {TUESDAYS.length} selected
              </span>
            </div>

            <p className="text-xs mb-3" style={{ color: 'rgba(158,129,47,0.7)', fontFamily: 'proxima-nova, Helvetica Neue, sans-serif' }}>
              If you do not know your dates yet you may leave blank, but we prefer candidates that can work at least 5 dates.
            </p>

            {/* Progress bar */}
            <div className="h-1 rounded-full mb-5 mt-2 overflow-hidden" style={{ background: 'rgba(0,0,0,0.07)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progressPct}%`,
                  background: datesCount >= 5
                    ? 'linear-gradient(90deg, #9e812f, #b89540)'
                    : datesCount > 0
                    ? 'linear-gradient(90deg, #9e812f, rgba(158,129,47,0.7))'
                    : 'transparent',
                }}
              />
            </div>

            {/* Date grid grouped by month */}
            <div className="space-y-5">
              {['June', 'July', 'August'].map((month) => {
                const monthDates = TUESDAYS.filter((t) => t.month === month);
                if (!monthDates.length) return null;
                return (
                  <div key={month}>
                    <p
                      className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2.5"
                      style={{ color: 'rgba(26,26,26,0.3)' }}
                    >
                      {month} 2026
                    </p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {monthDates.map(({ date, label }) => {
                        const selected = selectedDates.includes(date);
                        return (
                          <button
                            key={date}
                            type="button"
                            onClick={() => toggleDate(date)}
                            className="py-3.5 px-2 rounded-2xl text-center transition-all duration-200 active:scale-95"
                            style={{
                              background: selected ? '#9e812f' : 'white',
                              border: `1px solid ${selected ? '#9e812f' : 'rgba(0,0,0,0.1)'}`,
                              boxShadow: selected ? '0 2px 10px rgba(158,129,47,0.2)' : '0 1px 2px rgba(0,0,0,0.04)',
                              transform: selected ? 'scale(1.02)' : 'scale(1)',
                            }}
                          >
                            <div
                              className="text-[9px] font-bold tracking-widest uppercase"
                              style={{ color: selected ? 'rgba(255,255,255,0.75)' : 'rgba(26,26,26,0.3)' }}
                            >
                              Tue
                            </div>
                            <div
                              className="text-sm font-bold mt-0.5"
                              style={{ fontFamily: "'kepler-std', Georgia, serif", color: selected ? 'white' : 'rgba(26,26,26,0.7)' }}
                            >
                              {label}
                            </div>
                            <div
                              className="text-[11px] mt-0.5 transition-opacity duration-200"
                              style={{
                                color: selected ? 'rgba(255,255,255,0.85)' : 'transparent',
                                fontWeight: 700,
                              }}
                            >
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

            {/* "Select all" helper */}
            <button
              type="button"
              onClick={() =>
                setSelectedDates(
                  selectedDates.length === TUESDAYS.length ? [] : TUESDAYS.map((t) => t.date)
                )
              }
              className="mt-4 text-xs font-medium transition-colors duration-200"
              style={{ color: 'rgba(26,26,26,0.3)', fontFamily: 'proxima-nova, Helvetica Neue, sans-serif' }}
            >
              {selectedDates.length === TUESDAYS.length ? 'Deselect all' : 'Select all dates'}
            </button>
          </FormSection>

          {/* ── 05 Create Password ── */}
          <FormSection number="05" title="Create Your Password" subtitle="Used to log into the Staff Portal to track hours and update your availability">
            <div className="space-y-3">
              <div>
                <FieldLabel label="Password" required sublabel="At least 6 characters" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors(p => ({ ...p, password: null })); }}
                  placeholder="Create a password"
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  autoComplete="new-password"
                />
                <FieldError msg={errors.password} />
              </div>
              <div>
                <FieldLabel label="Confirm Password" required />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); if (errors.confirmPassword) setErrors(p => ({ ...p, confirmPassword: null })); }}
                  placeholder="Repeat your password"
                  className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                  autoComplete="new-password"
                />
                <FieldError msg={errors.confirmPassword} />
              </div>
              <p className="text-xs" style={{ color: 'rgba(26,26,26,0.3)', fontFamily: 'proxima-nova, Helvetica Neue, sans-serif' }}>
                You'll use this with your email to log into the{' '}
                <a href="/portal" style={{ color: 'rgba(26,26,26,0.5)' }} className="underline">Staff Portal</a>
                {' '}after applying.
              </p>
            </div>
          </FormSection>

          {/* ── SUBMIT ── */}
          <div className="pt-2">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? (
                <span className="flex items-center justify-center gap-2.5">
                  <span
                    className="inline-block w-4 h-4 rounded-full border-2 animate-spin-slow"
                    style={{ borderColor: 'rgba(255,255,255,0.25)', borderTopColor: 'white' }}
                  />
                  Submitting…
                </span>
              ) : (
                'Submit Application →'
              )}
            </button>
            <p className="text-center text-xs mt-3" style={{ color: 'rgba(26,26,26,0.25)', fontFamily: 'proxima-nova, Helvetica Neue, sans-serif' }}>
              Interlachen Country Club · Junior League Summer Staff 2026
            </p>
          </div>
        </form>

        <style jsx global>{`
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(6px); }
          }
        `}</style>
      </main>
    </>
  );
}
