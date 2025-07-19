# API Fetch Folder Guidelines

All files in this folder must follow these conventions for consistency, reliability, and maintainability:

## 1. API URL Construction
- Use `APIRoutes` and `APIPort` constants for all endpoints.
- Use `expo-constants` to determine the correct base URL for local/dev/prod.
- Example:
  ```ts
  import { APIPort } from "@/constants/APIPort";
  import { APIRoutes } from "@/constants/APIRoutes";
  import Constants from "expo-constants";
  const isLocalDev = process.env.EXPO_PUBLIC_IS_LOCAL_DEV;
  const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || "";
  const apiUrl = isLocalDev
    ? "http://" + Constants.expoConfig?.hostUri!.split(`:`).shift() + `:${APIPort.localPort}`
    : `https://${apiBaseUrl}:${APIPort.localPort}`;
  ```

## 2. Use `authFetch` for All Requests
- Import and use `authFetch` for every API call to ensure token handling and error redirection.
- Always set headers and body for POST/PUT/DELETE requests.

## 3. Error Handling
- Always check `response.ok` and throw a descriptive error if not ok.
- Parse and include backend error messages if available.
- Example:
  ```ts
  if (!response.ok) throw new Error((await response.json()).message || "Failed to ...");
  ```

## 4. TypeScript Types
- Import and use the correct DTOs for all responses and payloads.
- Always type the return value of each fetch function.

## 5. Function Naming
- Use clear, RESTful function names: `getX`, `postX`, `updateX`, `deleteX`, etc.

## 6. Consistency
- Match the structure and conventions of `logs.fetch.ts` and `friends.fetch.ts`.
- Use the same error handling, headers, and URL construction patterns.

## 7. Comments
- Add comments for any non-obvious logic or workarounds.

---

**Example fetch function:**
```ts
export async function getLogs(boatId: number): Promise<LogDTO[]> {
  const response = await authFetch(`${apiUrl}${APIRoutes.logs}/boat/${boatId}`);
  if (!response.ok) throw new Error((await response.json()).message || "Failed to fetch logs");
  return response.json();
}
```

---

**All new fetch files must follow these rules.**