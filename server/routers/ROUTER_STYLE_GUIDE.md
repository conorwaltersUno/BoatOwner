# BoatOwner Backend Router Style Guide

> **For all new backend endpoints, follow these conventions for consistency, maintainability, and security.**

---

## 1. File Structure & Imports
- Each domain (e.g., expenses, boats, logs, users, tasks) has its own router file in `server/routers/`.
- Import only what you use: controllers, express-validator, and (optionally) auth middleware.
- Use named imports for controllers and middleware.

```ts
import Router, { RequestHandler } from "express";
import { getAllExpenses, createExpense } from "../controllers";
import { validator } from "../middleware/expressValidator";
import { body, param } from "express-validator";
// import { auth } from "../middleware/auth";
```

---

## 2. Router Initialization
- Always use `const RouterName = Router();`.
- Export the router at the end of the file.

---

## 3. Route Definitions
- Use `.route()` for each endpoint path.
- Chain HTTP methods (`.get`, `.post`, `.put`, `.delete`) for clarity.
- Each route should:
  1. (Optionally) include `auth` middleware (uncomment when ready)
  2. Use express-validator for all params/body
  3. Use a `validator` middleware after validation
  4. Call the controller in an async handler, cast as `RequestHandler`

---

## 4. Swagger Documentation
- Add a block comment above each route with `#swagger` tags, summary, parameters, requestBody, and responses.
- Reference shared schemas with `$ref` where possible.

---

## 5. Example: Expenses Router
```ts
ExpenseRouter.route("/").get(
  /*
      #swagger.tags = ['Expense']
      #swagger.summary = 'Get all expenses'
      #swagger.responses[200] = { ... }
      #swagger.responses[500] = { ... }
    */
  // auth,
  (async (req, res) => { await getAllExpenses(req, res); }) as RequestHandler
);

ExpenseRouter.route(":/id").get(
  /* ...swagger... */
  // auth,
  [param("id").isInt().withMessage("ID must be an integer")],
  (req, res, next) => { validator(req, res, next); },
  (async (req, res) => { await getExpenseById(req, res); }) as RequestHandler
);
```

---

## 6. Validation
- **Always** validate all route params and request bodies.
- Use `param()` for URL params, `body()` for request bodies.
- Chain `.exists()`, `.isString()`, `.isInt()`, `.isFloat()`, `.isISO8601()`, etc. as needed.
- Use `.withMessage()` for clear error messages.

---

## 7. Auth Middleware
- All endpoints **must** use `auth` except health checks.
- Uncomment `// auth,` when ready for production.

---

## 8. Controller Usage
- Controllers should be called in an async function, cast as `RequestHandler`.
- Do not put business logic in the router.

---

## 9. Error Handling
- Let controllers handle errors and return proper status codes/messages.
- Routers should only validate and delegate.

---

## 10. Example: Friends Router (Rewritten to Match Style)
```ts
import Router, { RequestHandler } from "express";
import { searchUsers, sendFriendRequest, getPendingRequests, acceptFriendRequest, rejectFriendRequest, removeFriend, getFriendsList, getFriendsLogs } from "../controllers";
import { validator } from "../middleware/expressValidator";
import { body, param } from "express-validator";
// import { auth } from "../middleware/auth";

const FriendsRouter = Router();

FriendsRouter.route("/search").post(
  /*
      #swagger.tags = ['Friends']
      #swagger.summary = 'Search for users to add as friends'
      #swagger.requestBody = { ... }
      #swagger.responses[200] = { ... }
      #swagger.responses[400] = { ... }
      #swagger.responses[401] = { ... }
      #swagger.responses[500] = { ... }
    */
  // auth,
  body("query").isLength({ min: 2 }).withMessage("Search query must be at least 2 characters"),
  (req, res, next) => { validator(req, res, next); },
  (async (req, res) => { await searchUsers(req, res); }) as RequestHandler
);

FriendsRouter.route("/request").post(
  /* ...swagger... */
  // auth,
  body("receiver_username").isLength({ min: 3 }).withMessage("Username must be at least 3 characters"),
  (req, res, next) => { validator(req, res, next); },
  (async (req, res) => { await sendFriendRequest(req, res); }) as RequestHandler
);

FriendsRouter.route("/requests").get(
  /* ...swagger... */
  // auth,
  (async (req, res) => { await getPendingRequests(req, res); }) as RequestHandler
);

FriendsRouter.route("/accept/:requestId").post(
  /* ...swagger... */
  // auth,
  [param("requestId").isInt().withMessage("Request ID must be an integer")],
  (req, res, next) => { validator(req, res, next); },
  (async (req, res) => { await acceptFriendRequest(req, res); }) as RequestHandler
);

FriendsRouter.route("/reject/:requestId").post(
  /* ...swagger... */
  // auth,
  [param("requestId").isInt().withMessage("Request ID must be an integer")],
  (req, res, next) => { validator(req, res, next); },
  (async (req, res) => { await rejectFriendRequest(req, res); }) as RequestHandler
);

FriendsRouter.route("/:friendId").delete(
  /* ...swagger... */
  // auth,
  [param("friendId").isInt().withMessage("Friend ID must be an integer")],
  (req, res, next) => { validator(req, res, next); },
  (async (req, res) => { await removeFriend(req, res); }) as RequestHandler
);

FriendsRouter.route("/").get(
  /* ...swagger... */
  // auth,
  (async (req, res) => { await getFriendsList(req, res); }) as RequestHandler
);

FriendsRouter.route("/logs").get(
  /* ...swagger... */
  // auth,
  (async (req, res) => { await getFriendsLogs(req, res); }) as RequestHandler
);

export { FriendsRouter };
```

---

## 11. Export
- Always export the router at the end:
  ```ts
  export { ExpenseRouter };
  ```

---

## 12. Prohibited Practices
- **Never** put business logic in routers.
- **Never** skip validation or authentication (except `/health`).
- **Never** use `any` types in route handlers.
- **Never** duplicate route paths or logic.

---

**Follow this guide for all new routers and endpoints. Consistency is enforced in code review.**
