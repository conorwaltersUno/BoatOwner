# Mobile UI Architectural Patterns

## Purpose

This document serves as the definitive architectural guide for the mobile UI of this project. It is crafted to empower all future contributors—human or agent—to build, extend, and maintain the application with clarity, consistency, and excellence. By adhering to these patterns, we ensure a codebase that is robust, scalable, and a pleasure to work with.

---

## Architectural Vision

Our mobile UI is designed around the principles of modularity, reusability, and maintainability. We leverage modern React Native patterns, strong typing with TypeScript, and a declarative approach to navigation and state management. Every architectural decision is made to optimize developer experience, user experience, and long-term project health.

---

## Core Principles

- **Component-Driven Development:** Build UI from small, reusable components, composing them into complex screens.
- **Type Safety:** Use TypeScript throughout for reliable, self-documenting code.
- **Declarative Data & State:** Manage server state with React Query; use React Context for global client state.
- **Centralized API Layer:** All network requests flow through a unified, authenticated fetch layer.
- **File-Based Navigation:** Organize screens and flows using Expo Router’s file-based conventions.
- **Form Excellence:** Use Formik and Yup for robust, validated forms.
- **Security by Design:** Handle sensitive data with care, using Secure Store and never exposing secrets.
- **Test-Driven Confidence:** Ensure reliability with comprehensive unit and integration tests.
- **Documentation as a Living Artifact:** Keep this document and code comments up to date as the architecture evolves.

---

## Folder Structure

```
app/           # File-based routing: screens, layouts, navigation
components/    # Reusable UI components (modals, tables, charts, etc.)
hooks/         # Custom React hooks for data and business logic
api/fetch/     # Centralized API calls, grouped by domain
constants/     # App-wide constants (API routes, query keys, colors)
context/       # React context providers (e.g., Auth)
interfaces/    # TypeScript interfaces and DTOs
assets/        # Images, fonts, and static resources
utils/         # Utility functions and helpers
```

---

## State Management

- **React Query** is the single source of truth for server state: fetching, caching, and mutations.
- **React Context** is reserved for global client state (e.g., authentication).
- **Avoid Redux/MobX** unless a future requirement demands it.

---

## API Integration

- All API requests use the `authFetch` utility for authentication and token refresh.
- API logic is modularized in `api/fetch/` files, grouped by domain (e.g., `todo.fetch.ts`, `expenses.fetch.ts`).
- Data fetching and mutations are exposed as hooks in `hooks/` (e.g., `useGetTasks`, `useAddExpense`).
- Handle errors gracefully and provide user feedback for all network operations.

---

## Forms and Validation

- Use **Formik** for managing form state and submission.
- Use **Yup** for schema-based validation, ensuring robust and user-friendly forms.
- Centralize form schemas and validation logic for reusability.

---

## Navigation

- Use **Expo Router** for all navigation and screen organization.
- Follow file-based routing conventions for clarity and scalability.
- Keep navigation logic declarative and colocated with screens when possible.

---

## Security

- **Input Validation:** Validate all user input on the client before submission.
- **Secure Storage:** Store sensitive data (e.g., tokens) using Expo Secure Store.
- **No Hardcoded Secrets:** Never commit secrets or credentials to the codebase.
- **Least Privilege:** Only request permissions and access necessary for app functionality.

---

## Testing

- Write unit and integration tests for all screens, components, and hooks.
- Use **Jest** and **@testing-library/react-native** for testing.
- Place tests in `app/__tests__/` or alongside components as appropriate.
- Strive for high coverage, but prioritize meaningful, maintainable tests.

---

## Documentation

- Treat this document as a living artifact—update it with new patterns, rules, and rationale as the project evolves.
- Document all public APIs, UI flows, and architectural decisions.
- Use clear, concise language and provide examples where helpful.

---

## Example: Adding a New Feature

1. **Design the UI** as a new screen in `app/`, using reusable components from `components/`.
2. **Define API interactions** in a new or existing `api/fetch/` file.
3. **Create data hooks** in `hooks/` for fetching and mutating data.
4. **Manage form state** with Formik and validate with Yup if user input is required.
5. **Securely handle sensitive data** using Secure Store.
6. **Write tests** for new components, hooks, and screens.
7. **Update documentation** to reflect new patterns or flows.

---

## Final Thoughts

This architecture is designed to be both prescriptive and adaptable. As the project grows, revisit and refine these patterns to meet new challenges. Strive for code that is not only functional, but elegant—code that Leonardo himself would admire.

---

*Add new rules, patterns, and examples below as the project evolves.*