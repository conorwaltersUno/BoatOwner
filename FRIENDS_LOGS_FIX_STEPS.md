# Friends Logs Fix Steps

## Problem

- The user info in the Friends' Logs tab is showing as "Unknown User" instead of the actual username.
- The boat info under each log card is showing only the boat name or ID, but the requirement is to show both the boat name and boat model.

## Step-by-Step Solution

### 1. Investigate the Log Data Structure
- Check the structure of each log object returned by `useFriendsLogs`.
- Confirm which property (e.g., `owner`, `user`, `friend`, or another) contains the friend's user info.
- Confirm if the username is present and under which key (e.g., `user.username`, `owner.username`, etc.).
- Check if the log object contains `boat_name` and `boat_model` (or similar fields).

### 2. Update the Friends' Logs Tab Rendering
- In the FlatList renderItem for Friends' Logs, update the logic to:
  - Correctly extract the username from the right property (e.g., `item.owner.username` or `item.user.username`).
  - Fallback to 'Unknown User' only if the username is truly missing.
  - Extract and display both `boat_name` and `boat_model` (e.g., `item.boat_name` and `item.boat_model`).
- Update the UI so that under each log card, the boat info is shown as:
  - `Boat: <boat_name> (<boat_model>)`
  - If either is missing, handle gracefully (e.g., show only the available info).

### 3. Test the Changes
- Run the app and navigate to the Friends' Logs tab.
- Confirm that the correct username is displayed for each log.
- Confirm that the boat name and model are both displayed under each log card.
- Check for edge cases (missing user, missing boat info).

### 4. (Optional) Backend/API Review
- If the required user or boat info is not present in the log object, update the backend API to include it in the response for friends logs.
- Update the Prisma query or service layer to join and return the necessary fields.
- Regenerate types and test the API.

### 5. Code Review and Commit
- Review the changes for code style and correctness.
- Add/adjust tests if needed.
- Commit with a message referencing the fix (e.g., `fix(friends-logs): show correct user and boat info in logs`).

---

**Summary:**
- Ensure the correct user and boat info is extracted and displayed in the Friends' Logs tab.
- Update the UI and backend as needed to support this.
- Test thoroughly and handle missing data gracefully.
