# Initial Data Prefetch Plan for BoatOwner App

## Goal
Ensure all user data (friends, calendar logs, expenses, to-dos, etc.) is loaded immediately after login, so that when the user navigates to any main tab, the data is already available and no loading spinners or delays are visible.

---

## Step-by-Step Implementation Plan

### 1. **Design a Global Data Prefetch Context**
- Create a new React context (e.g., `DataPrefetchContext`) in `ui/mobile/BoatOwner/context/`.
- This context will manage the state of all initial data fetches and expose a `prefetchAllData` function and loading state.

### 2. **Identify All Data to Prefetch**
- Friends list and friend requests
- Friends feed (logs)
- Calendar logs
- Expenses
- To-do tasks
- Any other user-specific data needed on main tabs

### 3. **Implement Prefetch Functions**
- In the context, use React Query's `queryClient.prefetchQuery` for each data type.
- Example:
  ```ts
  await queryClient.prefetchQuery(['friends'], fetchFriends);
  await queryClient.prefetchQuery(['friendRequests'], fetchFriendRequests);
  await queryClient.prefetchQuery(['friendsFeed'], fetchFriendsFeed);
  await queryClient.prefetchQuery(['calendarLogs'], fetchCalendarLogs);
  await queryClient.prefetchQuery(['expenses'], fetchExpenses);
  await queryClient.prefetchQuery(['tasks'], fetchTasks);
  ```
- Set a `prefetching` state to true while running, and false when all are complete.

### 4. **Trigger Prefetch After Login**
- In the SignIn screen, after successful authentication and before navigating to the main app, call `prefetchAllData` from the context.
- Show a full-screen loading indicator (e.g., ActivityIndicator) while prefetching is in progress.
- Only navigate to the main app tabs when prefetching is complete.

### 5. **Update Main Tab Screens to Use Cached Data**
- Ensure all main tab screens (Friends, Calendar, Expenses, To-Do) use React Query hooks that will instantly return cached data if available.
- Remove or hide loading spinners on these screens if data is already present in the cache.

### 6. **Handle Prefetch Errors Gracefully**
- If any prefetch fails, show a user-friendly error and allow retry.
- Log errors to the console for debugging, but do not show technical details to users.

### 7. **Testing**
- Test login flow on both iOS and Android.
- Confirm that after login, all main tabs show data instantly with no loading spinners.
- Test error and retry scenarios.

### 8. **Documentation**
- Document the new context and prefetch logic in the codebase and in the project documentation.

---

## Notes
- This approach leverages React Query's cache to provide instant data access after login.
- If the user logs out, clear the cache to avoid stale data.
- Consider background refetching for data that may change frequently.

---

**Author:** GitHub Copilot
**Date:** 2025-07-20
