# Preventing Session Expiry During Log Recording - Implementation Steps

## Overview
This document details the step-by-step process for ensuring that a user's session never expires while recording a log in the BoatOwner app. It also covers increasing the session timeout for all users, following project security and architectural guidelines.

---

## 1. Increase Session Timeout (Backend)

### 1.1. Access Token Expiry
- **File:** `server/middleware/jwt.ts`
- **Change:**
  - Update the `signAccessToken` function to set `expiresIn: "4h"` (4 hours).
  - This ensures users can remain authenticated for up to 4 hours without needing a refresh.

### 1.2. Refresh Token Expiry
- **File:** `server/middleware/jwt.ts`
- **Change:**
  - Ensure the `signRefreshToken` function uses `expiresIn: "30d"` (30 days).
  - This allows the app to refresh access tokens for up to 30 days without requiring a new login.

---

## 2. Keep-Alive Mechanism During Log Recording (Frontend)

### 2.1. Where to Implement
- **File:** `ui/mobile/BoatOwner/app/(tabs)/index.tsx` (main log recording screen)

### 2.2. Implementation Steps
- When log recording starts, start a timer (using `setInterval`).
- Every 2 minutes, send a silent authenticated request to `/api/health` using `authFetch`.
- This keeps the session alive and triggers token refresh if the access token is close to expiring.
- When log recording stops, clear the timer.

#### Example Code Snippet
```ts
const keepAliveIntervalRef = useRef<NodeJS.Timeout | null>(null);

const startKeepAlive = () => {
  if (keepAliveIntervalRef.current) return;
  keepAliveIntervalRef.current = setInterval(() => {
    authFetch("/api/health").catch(() => {});
  }, 2 * 60 * 1000); // every 2 minutes
};
const stopKeepAlive = () => {
  if (keepAliveIntervalRef.current) {
    clearInterval(keepAliveIntervalRef.current);
    keepAliveIntervalRef.current = null;
  }
};
```
- Call `startKeepAlive()` when logging starts, and `stopKeepAlive()` when logging ends.

---

## 3. Backend Health Endpoint
- **File:** `server/controllers/health.ts`, `server/routers/health.ts`
- The `/api/health` endpoint is already present and returns 200 OK.
- No changes needed unless you want a dedicated `/api/auth/keep-alive` endpoint (optional).

---

## 4. Testing & Validation

### 4.1. Manual Testing
- Start recording a log and leave the app running for longer than 4 hours.
- Confirm that the session does not expire and the user is not logged out.
- Stop recording and ensure the session behaves as normal.

### 4.2. Automated Testing (Optional)
- Add integration tests to simulate long-running log sessions and verify token refresh.

---

## 5. Documentation
- Update README and relevant architecture docs to describe the new session policy and keep-alive mechanism.
- Document the new access/refresh token expiry times for developers and testers.

---

## 6. Security & Best Practices
- Ensure the keep-alive endpoint is lightweight and does not expose sensitive data.
- Only authenticated users should be able to access `/api/health` if used for keep-alive.
- Monitor for abuse (e.g., excessive keep-alive requests) and rate-limit if necessary.

---

## 7. Rollback Plan
- If issues arise, revert the access token expiry to the previous value (e.g., 30m) in `jwt.ts`.
- Remove or disable the keep-alive timer in the frontend.

---

## 8. Summary
- **Session timeout is now 4 hours for access tokens, 30 days for refresh tokens.**
- **A keep-alive timer ensures users never lose their session while recording a log.**
- **No backend changes are needed unless a dedicated keep-alive endpoint is desired.**

---

**This approach ensures a seamless and secure user experience for long-running log recording sessions.**
