# Friends Feature Implementation - Step-by-Step Breakdown

**This document provides an extremely detailed, step-by-step breakdown for implementing the Friends feature as defined in FRIENDS_FEATURE_DESIGN_PLAN.md. Each step is actionable and mapped to the BoatOwner project structure and coding standards.**

---

## 1. Planning & Domain Analysis

1.1. Review FRIENDS_FEATURE_DESIGN_PLAN.md, DEVELOPMENT_RULES.md, and FRONTEND_RULES.md in full.
1.2. Identify all affected entities: User, Logs, Friends, FriendRequests.
1.3. Map new relationships: User ↔ Friends (many-to-many), User ↔ FriendRequests (one-to-many).
1.4. Plan privacy layer for logs (public/private/friends-only) for future enhancement.
1.5. Review backend and frontend architecture to determine all impacted files and modules.

---

## 2. Database Schema Changes & Migrations

2.1. Plan schema changes:
  - Add `username` to `user` table (unique, indexed).
  - Create `friends` table (user_id, friend_id, created_at, unique constraint, indexes).
  - Create `friend_requests` table (sender_id, receiver_id, status, timestamps, unique constraint, indexes).
2.2. Write 3 new migration SQL files in `database/migrations/base/`:
  - V1.16.0__add_username_to_user.sql
  - V1.17.0__create_friends_table.sql
  - V1.18.0__create_friend_requests_table.sql
2.3. Run migrations locally:
  - `docker compose down -v`
  - `docker volume prune -f`
  - `docker compose up --build -d`
2.4. Verify DB structure using a DB client or Prisma Studio.
2.5. Regenerate Prisma client:
  - `cd server`
  - `npx prisma db pull`
  - `npx prisma generate`
2.6. Confirm `prisma/schema.prisma` is updated (do not edit manually).
2.7. Update test data in `server/test-utils/test-data/` if needed.

---

## 3. Backend Implementation

### 3.1. TypeScript Interfaces
3.1.1. Update `server/interfaces/user.ts` to add `username` to UserDTO and CreateUserDTO.
3.1.2. Create `server/interfaces/friends.ts` with FriendDTO, FriendRequestDTO, CreateFriendRequestDTO, UserSearchDTO.

### 3.2. Service Layer
3.2.1. Create `server/services/friends.ts`:
  - Implement methods: searchUsers, sendFriendRequest, getPendingRequests, acceptFriendRequest, rejectFriendRequest, removeFriend, getFriendsList, getFriendsLogs.
  - Use Prisma for all DB access.
  - Validate all inputs and handle errors.
  - Exclude current user and existing friends from search results.
  - Prevent duplicate/spam friend requests.
  - Enforce privacy checks for logs.
3.2.2. Update `server/services/users.ts`:
  - Add username uniqueness validation in createUser.
  - Add getUserByUsername function.

### 3.3. Controller Layer
3.3.1. Create `server/controllers/friends.ts`:
  - Implement handlers for each endpoint: searchUsers, sendFriendRequest, getPendingRequests, acceptFriendRequest, rejectFriendRequest, removeFriend, getFriendsList, getFriendsLogs.
  - Use express-validator for input validation.
  - Return proper HTTP status codes and error messages.

### 3.4. Router Configuration
3.4.1. Create `server/routers/friends.ts`:
  - Define all RESTful endpoints as per design plan.
  - Add input validation middleware.
  - Export FriendsRouter.
3.4.2. Register FriendsRouter in main app router (e.g., in `server/app.ts`).

### 3.5. Middleware
3.5.1. Update `server/middleware/auth.ts`:
  - Add rate limiting for user search endpoint.
  - Add username format validation.
3.5.2. Ensure all endpoints require authentication (except /health).

### 3.6. Swagger Documentation
3.6.1. Document all new endpoints in Swagger (update `server/swaggerSchema/`).
3.6.2. Run `npm run swagger-autogen` to regenerate docs.

### 3.7. Testing (Backend)
3.7.1. Write unit tests for all new/updated services in `server/services/__tests__/`.
3.7.2. Write unit tests for all new/updated controllers in `server/controllers/__tests__/`.
3.7.3. Write integration tests for all new endpoints in `server/__tests__/`.
3.7.4. Mock external dependencies (DB, etc.).
3.7.5. Test error scenarios (invalid input, duplicate requests, unauthorized access, etc.).
3.7.6. Achieve at least 80% code coverage.

---

## 4. Frontend Implementation

### 4.1. TypeScript Interfaces
4.1.1. Create/update `ui/mobile/BoatOwner/interfaces/friends.ts` with FriendDTO, FriendRequestDTO, UserSearchResult.

### 4.2. API Integration
4.2.1. Create `ui/mobile/BoatOwner/api/fetch/friends.fetch.ts`:
  - Implement all fetch functions for friends endpoints using `authFetch`.
  - Use APIRoutes constants.
  - Handle errors and parse responses.

### 4.3. React Query Hooks
4.3.1. Create `ui/mobile/BoatOwner/hooks/useFriends.ts`:
  - Implement hooks: useSearchUsers, useSendFriendRequest, usePendingRequests, useAcceptFriendRequest, useRejectFriendRequest, useFriendsList, useFriendsLogs, useRemoveFriend.
  - Use proper query keys and cache invalidation.

### 4.4. Friends Tab UI
4.4.1. Create/modify `ui/mobile/BoatOwner/app/(tabs)/friends.tsx`:
  - Implement search bar, search results, pending requests list, accept/reject actions.
  - Use FlatList for results and requests.
  - Use hooks for data and mutations.
  - Add loading and error states.
  - Style according to FRONTEND_RULES.md.
  - **Show 'Requested' on the Add button if a friend request has already been sent to that user. Show 'Friends' if already friends, and 'Respond' if the user sent you a request. Only enable the button for 'Add'.**

### 4.5. Home Tab Updates
4.5.1. Update `ui/mobile/BoatOwner/app/(tabs)/(home)/index.tsx`:
  - Add sub-tabs for "My Logs" and "Friends Logs".
  - Use useFriendsLogs for friends' logs.
  - Display username for friends' logs.

### 4.6. Add Tab Refactor
4.6.1. Move log recording functionality from Home to new Add tab (`ui/mobile/BoatOwner/app/(tabs)/add.tsx`).

### 4.7. Sign Up Form Update
4.7.1. Update `ui/mobile/BoatOwner/app/(auth)/SignUp.tsx`:
  - Add username field to form and validation.
  - Ensure username is sent to backend on registration.

### 4.8. Navigation
4.8.1. Update tab layout in `ui/mobile/BoatOwner/app/(tabs)/_layout.tsx`:
  - Add Friends and Add tabs.
  - Ensure correct icons and order.

### 4.9. Error & Loading States
4.9.1. Ensure all screens/components handle loading and error states.
4.9.2. Use React Query's isLoading/isError and display user-friendly messages.

### 4.10. Testing (Frontend)
4.10.1. Write unit tests for all new/updated components in `ui/mobile/BoatOwner/components/__tests__/`.
4.10.2. Write unit tests for all new/updated hooks in `ui/mobile/BoatOwner/hooks/__tests__/`.
4.10.3. Write integration tests for critical user flows (friend request, accept, reject, etc.).
4.10.4. Mock API calls in tests.
4.10.5. Test error and loading states.
4.10.6. Test accessibility features.

---

## 5. Integration & Deployment

5.1. Run all backend and frontend tests: `make test_all`.
5.2. Lint and format code: `npm run lint --fix && npm run format` (both server and frontend).
5.3. Start backend and frontend locally, verify all flows manually.
5.4. Test database migrations in staging environment.
5.5. Update documentation (README, Swagger, migration guides).
5.6. Code review and approval.
5.7. Deploy migrations, backend, and frontend to staging.
5.8. Perform end-to-end testing in staging.
5.9. Monitor logs, performance, and error reports.
5.10. Deploy to production after successful staging validation.

---

## 6. Post-Deployment & Monitoring

6.1. Monitor database performance and API response times.
6.2. Verify friend request notifications and user search.
6.3. Validate log privacy settings (if implemented).
6.4. Gather user feedback and bug reports.
6.5. Plan and prioritize future enhancements (push notifications, privacy, mutual friends, etc.).

---

## Cancel Pending Friend Request
- Implemented backend endpoint DELETE /api/friends/requests/:id to allow users to cancel their own pending friend requests.
- Added service, controller, and router logic with proper validation and error handling.
- Documented the endpoint in Swagger.
- Added frontend API call, React Query mutation, and UI logic to show a Cancel button for outgoing pending requests.
- UI provides confirmation dialog, loading state, and feedback on success/error.
- Tests and documentation updated accordingly.

---

**This checklist ensures a robust, secure, and maintainable implementation of the Friends feature. Each step should be checked off and validated before moving to the next phase.**
