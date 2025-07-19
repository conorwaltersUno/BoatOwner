# BoatOwner Fetch File Style Guide

> **This guide defines strict conventions for all fetch files in `ui/mobile/BoatOwner/api/fetch/`. All new and existing fetch files must follow these rules.**

---

## 1. File Structure & Imports
- **Import order:**
  1. TypeScript interfaces (from `@/interfaces/...`)
  2. Expo/React Native/3rd party libraries
  3. Project constants (e.g., `APIPort`, `APIRoutes`)
  4. `authFetch` (always import from `../../api/fetch/auth.fetch`)
- **Always use absolute imports for project files.**

## 2. API URL Construction
- **Always use the following pattern for base URL:**
  ```ts
  const isLocalDev = process.env.EXPO_PUBLIC_IS_LOCAL_DEV;
  const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || "";
  const apiUrl = isLocalDev
    ? "http://" + Constants.expoConfig?.hostUri!.split(`:`).shift() + `:${APIPort.localPort}`
    : `https://${apiBaseUrl}:${APIPort.localPort}`;
  ```
- **Never hardcode API URLs.**

## 3. Function Naming & Structure
- **Export all fetch functions as named exports.**
- **Function names must be descriptive and camelCase.**
- **Each function should handle one API endpoint only.**
- **All functions must be `async` and return typed data.**

## 4. HTTP Requests
- **Always use `authFetch` for all API calls.**
- **Set the correct HTTP method and headers for every request.**
- **For POST/PUT/PATCH, always set `Content-Type: application/json` and use `JSON.stringify` for the body.**
- **For GET/DELETE, set `Accept: application/json` if expecting JSON.**
- **Never send undefined/null in the body.**

## 5. Error Handling
- **Always check `response.ok` after every fetch.**
- **If not ok, try to parse the error body and throw a new `Error` with a helpful message:**
  ```ts
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || `Failed to ...: ${response.statusText}`);
  }
  ```
- **Wrap all fetch logic in try/catch and rethrow with a clear error message.**

## 6. Typing & Return Values
- **All fetch functions must have explicit return types.**
- **Parse and return the response as the correct type:**
  ```ts
  const data: ExpenseDTO[] = await response.json();
  return data;
  ```
- **Never return raw fetch responses.**

## 7. Example Template
```ts
import { SomeDTO } from "@/interfaces/some";
import Constants from "expo-constants";
import { APIPort } from "@/constants/APIPort";
import { authFetch } from "../../api/fetch/auth.fetch";

const isLocalDev = process.env.EXPO_PUBLIC_IS_LOCAL_DEV;
const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || "";
const apiUrl = isLocalDev
  ? "http://" + Constants.expoConfig?.hostUri!.split(`:`).shift() + `:${APIPort.localPort}`
  : `https://${apiBaseUrl}:${APIPort.localPort}`;

export const fetchSomething = async (id: number): Promise<SomeDTO> => {
  try {
    const response = await authFetch(`${apiUrl}/something/${id}`, {
      method: "GET",
      headers: { "Accept": "application/json" },
    });
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.message || `Failed to fetch: ${response.statusText}`);
    }
    const data: SomeDTO = await response.json();
    return data;
  } catch (err: any) {
    throw new Error(`Failed to fetch: ${err.message}`);
  }
};
```

## 8. Prohibited Practices
- **Never use `fetch` directly—always use `authFetch`.**
- **Never hardcode URLs, tokens, or headers.**
- **Never return or throw raw fetch responses.**
- **Never use `any` as a return type.**

## 9. Type Interface Rules (STRICT)
- **All API data must use explicit TypeScript interfaces.**
- **All interfaces must be defined in `/interfaces/` and imported, never inlined in fetch files.**
- **Interface names must be descriptive and end with `DTO` for API data (e.g., `FriendDTO`, `FriendRequestDTO`, `UserSearchResult`).**
- **If the API returns an array, use `TypeDTO[]` as the return type.**
- **If the API returns a union or optional field, use TypeScript union/optional syntax.**
- **Never use `any` or `{}` as a type.**
- **If the API response shape changes, update the interface and all usages.**
- **All fetch functions must have an explicit return type using these interfaces.**
- **If a new API endpoint is added, create a new interface for its response if needed.**
- **All interfaces must be documented with a comment describing their purpose.**

---

**Example:**
```ts
// In interfaces/friends.ts
/**
 * Represents a friend relationship as returned by the API.
 */
export interface FriendDTO { ... }

// In fetch file
import { FriendDTO } from "@/interfaces/friends";
export const getFriendsList = async (): Promise<FriendDTO[]> => { ... }
```

---

**All fetch files must follow these interface rules. PRs that do not comply will be rejected.**

---

**All fetch files must follow this guide. PRs that do not comply will be rejected.**
