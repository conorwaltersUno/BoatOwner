# Step-by-Step Initial Data Prefetch Implementation Plan

This file outlines the concrete steps to implement the initial data prefetching strategy for the BoatOwner app, based on the plan in `INITIAL_DATA_PREFETCH_PLAN.md`.

---

## 1. Create DataPrefetchContext
- [ ] Create `ui/mobile/BoatOwner/context/DataPrefetchContext.tsx`.
- [ ] Implement a React context that exposes:
  - `prefetchAllData: () => Promise<void>`
  - `prefetching: boolean`
  - `prefetchError: Error | null`
- [ ] Use React Query's `useQueryClient` inside the context.

## 2. Implement Prefetch Logic
- [ ] In `prefetchAllData`, call `queryClient.prefetchQuery` for:
  - Friends list
  - Friend requests
  - Friends feed (logs)
  - Calendar logs
  - Expenses
  - To-do tasks
- [ ] Set `prefetching` to true at start, false at end.
- [ ] Catch and store any error in `prefetchError`.

## 3. Integrate Context in App
- [ ] Wrap the app in `DataPrefetchProvider` in `_layout.tsx`.

## 4. Trigger Prefetch After Login
- [ ] In `app/(auth)/SignIn.tsx`, after successful login:
  - Call `prefetchAllData`.
  - Show a full-screen loading indicator while `prefetching` is true.
  - Only navigate to main tabs after prefetch completes.
  - If `prefetchError`, show a user-friendly error and retry option.

## 5. Update Main Tab Screens
- [ ] In each main tab screen (Friends, Calendar, Expenses, To-Do):
  - Use React Query hooks for data.
  - If `prefetching` is true, hide loading/error UI.
  - Show data instantly if present in cache.

## 6. Handle Logout
- [ ] On logout, clear React Query cache to avoid stale data.

## 7. Testing
- [ ] Test login flow on iOS and Android.
- [ ] Confirm all main tabs show data instantly after login.
- [ ] Test error and retry scenarios.

## 8. Documentation
- [ ] Document the context and prefetch logic in code and project docs.

---

**Reference:** See `feature-development-plan/INITIAL_DATA_PREFETCH_PLAN.md` for rationale and details.
