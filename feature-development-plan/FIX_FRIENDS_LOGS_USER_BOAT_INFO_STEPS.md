# Friends' Logs User & Boat Info - Step-by-Step Implementation Checklist

This checklist breaks down the implementation guide into actionable steps for the Friends' Logs user & boat info fix. Use this as a reference for tracking progress and ensuring all requirements are met.

---

## Backend/API Steps

1. **Review backend log fetch logic**
   - File(s): `server/services/friends.ts`, `server/services/logs.ts`
   - Ensure all log queries for the friends logs feed include user and boat info.

2. **Update backend service/controller**
   - Use Prisma's `include` or SQL JOINs to fetch related user and boat info for each log.
   - Always include:
     - Username of the log owner or friend
     - Boat name and model (or at least boat ID)
   - File(s): `server/services/friends.ts`, `server/services/logs.ts`

3. **Update API response mapping**
   - In the controller, map log data to always include a `username` field and a `boat` object with `name` and `model`.
   - Fallback: If missing, fetch using `boat_id` or `user_id`.
   - File(s): `server/controllers/friends.ts`

4. **Add/Update backend tests**
   - Ensure API always returns logs with required user and boat info.
   - Test edge cases: logs by user, by friend, with missing relations.
   - File(s): `server/controllers/__tests__/logs.ts`

---

## Frontend Steps

5. **Validate frontend extraction logic**
   - Confirm robust extraction of user and boat info in `friend.tsx`.
   - No changes needed unless you want to improve error/placeholder display.
   - File(s): `ui/mobile/BoatOwner/app/(tabs)/friend.tsx`

---

## QA & Documentation Steps

6. **Manual & automated QA**
   - Reload Friends' Logs tab and confirm all log cards display valid username and boat info.
   - Run backend and frontend tests.
   - Add tests for new backend logic if not present.

7. **Document API contract**
   - Document in README and code comments that every log in the friends logs feed must include user and boat info.
   - File(s): `README.md`, backend/frontend code comments

8. **Deploy & monitor**
   - Deploy backend changes to staging, test with real data, then deploy to production after validation.

---

## Summary Table

| Step | Action | File(s) | Owner |
|------|--------|---------|-------|
| 1    | Review backend log fetch logic | `server/services/friends.ts`, `server/services/logs.ts` | Backend |
| 2    | Ensure user & boat info always included in API | Same as above | Backend |
| 3    | Update API response mapping | `server/controllers/friends.ts` | Backend |
| 4    | Add/Update backend tests | `server/controllers/__tests__/logs.ts` | Backend |
| 5    | Validate frontend extraction logic | `ui/mobile/BoatOwner/app/(tabs)/friend.tsx` | Frontend |
| 6    | Manual & automated QA | All | QA |
| 7    | Document API contract | README, code comments | Both |
| 8    | Deploy & monitor | All | DevOps |

---

**Tip:**
If you cannot change the backend, display a clear placeholder or error in the UI and consider raising a bug/feature request for the backend team.
