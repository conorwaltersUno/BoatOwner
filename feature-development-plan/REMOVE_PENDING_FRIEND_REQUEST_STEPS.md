# Feature Implementation Plan: Remove (Cancel) Pending Friend Request

## Feature Overview
Enable users to remove (cancel) a pending friend request they have sent to another user. This should update both the backend and frontend so that the UI and data are always in sync. The user should receive clear feedback (success/error) and the UI should update immediately to reflect the change.

---

## Step-by-Step Implementation Instructions

### 1. **Backend: API & Service Layer**

#### a. **Service Layer (`server/services/friends.ts`)**
- Add a new service function: `cancelPendingFriendRequest(requestId: number, userId: number)`
  - Validate that the request exists and was sent by the current user.
  - Delete the pending friend request from the database.
  - Return a success/failure result.

#### b. **Controller Layer (`server/controllers/friends.ts`)**
- Add a new controller method: `cancelPendingFriendRequest`
  - Extract `requestId` from the request body or params.
  - Get the current user ID from the JWT/auth middleware.
  - Call the service function.
  - Return appropriate HTTP status and message.

#### c. **Router (`server/routers/friends.ts`)**
- Add a new route:
  - `DELETE /api/friends/requests/:id` (where `:id` is the friend request ID)
  - Route should require authentication.
  - Route should call the new controller method.

#### d. **Swagger Documentation**
- Document the new endpoint in Swagger (OpenAPI) schema.
- Include request/response examples and error cases.

#### e. **Unit & Integration Tests**
- Add unit tests for the service and controller logic.
- Add integration tests for the new endpoint (success, unauthorized, not found, forbidden, etc).

---

### 2. **Frontend: UI, API, Hooks**

#### a. **API Layer (`ui/mobile/BoatOwner/api/fetch/friends.fetch.ts`)**
- Add a new function: `cancelPendingFriendRequest(requestId: number)`
  - Use `authFetch` to call the new backend endpoint (`DELETE /api/friends/requests/:id`).
  - Handle errors and return result.

#### b. **React Query Hook (`ui/mobile/BoatOwner/hooks/useFriends.ts`)**
- Add a new mutation hook: `useCancelPendingFriendRequest()`
  - Use React Query's `useMutation` to call the new API function.
  - On success, invalidate or update the `pendingRequests` query cache so the UI updates immediately.

#### c. **UI (`ui/mobile/BoatOwner/app/(tabs)/friend.tsx`)**
- In the "Pending Requests" section, distinguish between requests sent by the user (outgoing) and those received (incoming).
- For outgoing requests (where the current user is the sender):
  - Show a "Cancel" button (e.g., an icon or text button).
  - On press, call the `useCancelPendingFriendRequest` mutation.
  - Show a success Toast/Alert on success, and update the UI immediately.
  - Handle errors with an error alert.
- Ensure the button is only shown for requests sent by the current user.

#### d. **UI/UX Feedback**
- Show loading state on the cancel button while the request is in progress.
- Disable the button while loading.
- Show a success message (Toast/Alert) on successful cancellation.
- Show an error message if cancellation fails.

#### e. **Testing**
- Add/extend unit tests for the new hook and UI logic.
- Test error and success scenarios.

---

### 3. **Documentation & Changelog**
- Add a summary of the change to the `FRIENDS_FEATURE_IMPLEMENTATION_STEPS.md` and/or changelog.
- Update Swagger docs if needed.

---

## Acceptance Criteria
- Users can cancel their own pending friend requests from the UI.
- The backend validates ownership and only allows the sender to cancel.
- The UI updates immediately after cancellation.
- User receives clear feedback (success/error).
- All code is tested and documented according to project standards.

---

## References
- See `FRIENDS_FEATURE_DESIGN_PLAN.md` for overall friends feature design.
- See `FRIENDS_FEATURE_IMPLEMENTATION_STEPS.md` for related implementation steps.
- Follow all project rules in `DEVELOPMENT_RULES.md` and `FRONTEND_RULES.md`.

---

# Remove Pending Friend Request - Step-by-Step Implementation Plan

## Overview
This document describes the steps required to allow a user to remove (cancel) a pending friend request they have sent in the BoatOwner app. This feature will be implemented according to project architecture and security guidelines.

---

## 1. Backend Changes

### 1.1. Add Cancel Pending Friend Request Endpoint
- **File:** `server/routers/friends.ts`
- **Action:**
  - Add a new route: `DELETE /friends/request/:receiverId`
  - This endpoint will allow the sender to cancel a pending friend request they have sent to another user.

### 1.2. Implement Service Logic
- **File:** `server/services/friends.ts`
- **Action:**
  - Add a method to delete a pending friend request where `sender_id = currentUserId` and `receiver_id = receiverId` and `status = 'pending'`.

### 1.3. Implement Controller Logic
- **File:** `server/controllers/friends.ts`
- **Action:**
  - Add a controller function to handle the cancel request, validate permissions, and return appropriate status.

### 1.4. Update Swagger Documentation
- **File:** `server/swagger.ts` (or relevant swagger config)
- **Action:**
  - Document the new endpoint for API consumers.

---

## 2. Frontend Changes

### 2.1. Add API Call
- **File:** `ui/mobile/BoatOwner/api/fetch/friends.fetch.ts`
- **Action:**
  - Add a function to call the new backend endpoint to cancel a pending friend request.

### 2.2. Add React Query Mutation
- **File:** `ui/mobile/BoatOwner/hooks/useFriends.ts`
- **Action:**
  - Add a mutation hook for cancelling a pending friend request.
  - Invalidate the pending requests and search users queries on success.

### 2.3. Update UI
- **File:** `ui/mobile/BoatOwner/app/(tabs)/friend.tsx`
- **Action:**
  - In the search results, if a user has a pending request (status 'Requested'), show a 'Cancel' button next to 'Requested'.
  - When the user taps 'Cancel', call the cancel mutation and update the UI accordingly.
  - Optionally, show a confirmation dialog before cancelling.

---

## 3. Testing

### 3.1. Backend
- Add unit and integration tests for the new endpoint and service logic.
- Test that only the sender can cancel their own pending requests.

### 3.2. Frontend
- Test that the 'Cancel' button appears for pending requests you sent.
- Test that cancelling a request updates the UI and the backend state.
- Test error and loading states.

---

## 4. Documentation
- Update the feature design and implementation docs to describe the new flow.
- Add usage notes to the README if needed.

---

## 5. Rollback Plan
- If issues arise, remove the new endpoint and UI logic, and revert to the previous state.

---

# ✅ All steps implemented as described above. The cancel pending friend request feature is now complete and ready for review.
