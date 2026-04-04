# Security Audit — ICC Junior League Apply
**Date:** 2026-04-04
**Auditor:** Automated review + senior developer analysis
**Scope:** Full codebase — API routes, client pages, storage layer, service worker

---

## Summary

| Severity | Count | Status |
|----------|-------|--------|
| CRITICAL | 2 | Fixed in this PR |
| HIGH | 6 | Fixed in this PR |
| MEDIUM | 5 | Fixed in this PR |
| LOW | 3 | Fixed in this PR |

---

## CRITICAL

### C-1 — Submissions API Has No Authentication
**File:** `pages/api/submissions.js`
**Commit:** eb089cf removed the password check entirely. Any unauthenticated HTTP request returns all applicant data including bcrypt password hashes, phone numbers, emails, and push subscription objects.
**Fix:** Restore `MANAGER_PASSWORD` env var check. Strip `passwordHash` and `pushSubscription` from the response.

### C-2 — Manager PIN Verified Client-Side Only
**File:** `pages/manager.js` (lines 855, 862, 910)
**Issue:** `handlePinSubmit` does `if (pin === '1909')` in JavaScript — a browser dev tools user can set `sessionStorage.setItem('mgr_authed', 'true')` and skip auth entirely. The PIN `1909` appears hardcoded three times. The `managerPassword="1909"` prop is visible in React DevTools and the JS bundle.
**Fix:** Replace client-side PIN comparison with an API call to `submissions.js` (which now enforces server-side auth). Store PIN from state (never hardcoded).

---

## HIGH

### H-1 — Staff Portal Uses Shared Password, Not Per-User Bcrypt
**File:** `pages/api/portal/update.js`
**Issue:** Authentication uses `process.env.STAFF_PASSWORD || 'ICC2026'` — a single shared plaintext string. Any staff member knowing `ICC2026` can modify any other staff member's dates, hours, or push subscription.
**Fix:** Switch to session token verification (`lib/session.js`). Session is created at login after bcrypt verification; only that user's data is accessible.

### H-2 — Staff Portal Stores Password in localStorage
**File:** `pages/portal.js` (lines 42–43)
**Issue:** `localStorage.setItem('portal_password', password)` persists the user's plaintext password indefinitely across browser sessions. XSS on any page in the origin can exfiltrate it.
**Fix:** Replace with a server-issued session token stored in `sessionStorage` (cleared on tab close, never contains the password).

### H-3 — Hardcoded Manager Password Fallback in API Routes
**Files:** `pages/api/manager-hours.js`, `pages/api/notify-staff.js`
**Issue:** `const MANAGER_PASSWORD = process.env.MANAGER_PASSWORD || '1909'`. If the env var is unset in production, the fallback `'1909'` (the club's founding year) is trivially guessable. `manager-subscribe.js` uses `'ICC2026'` — inconsistent and also hardcoded.
**Fix:** Remove all hardcoded fallbacks. If `MANAGER_PASSWORD` is unset, return `500` to signal misconfiguration rather than silently falling back to a guessable default.

### H-4 — Legacy Shared Password Fallback in Portal Login
**File:** `pages/api/portal/login.js`
**Issue:** `const LEGACY_PASSWORD = process.env.STAFF_PASSWORD || 'ICC2026'` — if a submission has no `passwordHash`, any user can log in with the shared string. This bypasses per-user bcrypt.
**Fix:** Remove the legacy fallback. If a submission has no `passwordHash`, the user must re-apply (password is set at application time via `apply.js`).

### H-5 — No Bounds Validation on Manager-Logged Hours
**File:** `pages/api/manager-hours.js`
**Issue:** `hours: Number(payload.hours)` — no range check. A manager can log negative or arbitrarily large hours (e.g., 99999), corrupting the earnings display.
**Fix:** Enforce `0.5 ≤ hours ≤ 24`.

### H-6 — Push Notification Messages Have No Length Limits
**File:** `pages/api/notify-staff.js`
**Issue:** `title` and `body` are sent to `webpush.sendNotification` without length limits. Oversized payloads can be rejected by push servers and may cause DoS-like behavior in the payload queue.
**Fix:** Cap title at 100 chars, body at 500 chars.

---

## MEDIUM

### M-1 — Twilio Webhook Has No Signature Validation
**File:** `pages/api/sms-reply.js`
**Issue:** No validation of the Twilio `X-Twilio-Signature` header. Any HTTP client can POST arbitrary payloads to this endpoint. While the current response doesn't echo user input back into TwiML, removing this validation leaves the door open.
**Fix:** Add XML-safe escaping to `responseText` before TwiML interpolation as defense-in-depth. Add a comment noting Twilio signature middleware should be added if the endpoint is expanded.

### M-2 — Cron VAPID Subject Is Hardcoded
**File:** `pages/api/cron/reminder.js` (line 43)
**Issue:** `webpush.setVapidDetails('mailto:luke@rypgolf.com', ...)` — hardcodes a personal email address. Other VAPID setups in the codebase correctly use `process.env.VAPID_SUBJECT`.
**Fix:** Use `process.env.VAPID_SUBJECT`.

### M-3 — Redis Fetch Calls Have No Timeout
**File:** `lib/storage.js`
**Issue:** `redisGet` and `redisSet` call `fetch()` without a timeout. A slow or unresponsive Redis endpoint will hang the serverless function until Vercel's 10 s limit, degrading UX and wasting compute.
**Fix:** Add `AbortSignal.timeout(5000)` to all Redis fetch calls.

### M-4 — Service Worker Opens Arbitrary URLs from Notification Data
**File:** `public/sw.js`
**Issue:** `const url = e.notification.data?.url || '/portal'` — if a push payload is crafted with a `url` pointing to an external domain, `self.clients.openWindow(url)` navigates to it. The risk is low since crafting a push requires the VAPID private key, but defense-in-depth dictates restricting navigation.
**Fix:** Only navigate to relative paths (same-origin).

### M-5 — Staff Can Submit Arbitrary Date Strings for Available Dates
**File:** `pages/api/portal/update.js`
**Issue:** `payload.availableDates` is persisted verbatim without validation against the known Tuesday schedule. An API caller could inject arbitrary strings.
**Fix:** Filter `availableDates` against the canonical `VALID_DATES` set before persisting.

---

## LOW

### L-1 — `MIN_DATES` Constant Is Dead Code
**File:** `pages/index.js`
**Issue:** `const MIN_DATES = 5` is defined but no longer referenced after the minimum-date soft-requirement was removed. Dead constants confuse future readers.
**Fix:** Remove.

### L-2 — Magic Number 3 in JSON Parse Loop
**File:** `lib/storage.js`
**Issue:** `for (let i = 0; i < 3 && ...)` — the number `3` is unexplained.
**Fix:** Replace with `const JSON_UNWRAP_DEPTH = 3`.

### L-3 — `console.error(e)` Logs Full Error Objects in Production
**Files:** Multiple API routes
**Issue:** Logging the full error object can surface internal stack traces in Vercel's log dashboard (readable by anyone with Vercel project access). Logging `e.message` is sufficient.
**Fix:** Replace `console.error(e)` with `console.error('context:', e.message)`.

---

## Not In Scope / Acknowledged

- `.env.local` is correctly listed in `.gitignore` and has never been committed to git (verified via `git log`). Credentials are not exposed in the repository.
- HTTPS is enforced by Vercel. No additional transport-layer work needed.
- The Twilio cron reminder correctly validates `Authorization: Bearer CRON_SECRET`.
- bcrypt salt rounds of 10 are acceptable for this use case (cost/latency tradeoff for a small staff portal).
- No `dangerouslySetInnerHTML` usage found in any React component.
- CSV export in manager.js properly double-quotes and escapes cells.
