# Frontend Implementation Rules

These rules are designed to keep the frontend codebase simple, maintainable, and accessible for intermediate-level developers. Please follow these guidelines when contributing to the `ui/mobile/BoatOwner/` project.

## 1. File and Folder Structure
- Organize components in the `components/` directory. Each component should be in its own file.
- Place screens and views in the `app/` directory, using subfolders for logical grouping (e.g., `(tabs)/`, `(auth)/`).
- Keep hooks in the `hooks/` directory and utility functions in `utils/`.
- Use `interfaces/` for TypeScript types and interfaces.

## 2. Component and Function Naming
- Use PascalCase for React component names (e.g., `LogDetailModal`).
- Use camelCase for functions, variables, and hooks (e.g., `useGetLogs`).
- Name files after the main component or function they export.

## 3. State Management
- Use React's built-in hooks (`useState`, `useEffect`, `useMemo`) for local state.
- Use context or custom hooks for shared/global state.
- Avoid unnecessary state; derive values with `useMemo` when possible.

## 4. Styling Conventions
- Use `StyleSheet.create` for styles in React Native files.
- Keep styles at the bottom of the file.
- Use descriptive style names and group related styles together.
- Prefer using color and spacing constants from the `constants/` directory.

## 5. Code Organization and Readability
- Keep components small and focused. Extract logic into hooks or utility functions if it grows large.
- Use early returns for loading and error states.
- Use `useMemo` for expensive calculations or derived data.
- Avoid deeply nested code; break up complex logic into helper functions.

## 6. Use of Hooks and Utilities
- Place all custom hooks in the `hooks/` directory.
- Reuse hooks and utility functions instead of duplicating logic.
- Use TypeScript for all hooks and utility functions.

## 7. Error Handling and Loading States
- Always handle loading and error states in screens and major components.
- Display user-friendly messages for errors and empty states.

## 8. Comments and Documentation
- Use comments to explain non-obvious logic or decisions.
- Add JSDoc comments for exported functions, hooks, and complex components.
- Keep comments up to date with code changes.

## 9. TypeScript Usage
- Use TypeScript for all files.
- Define and import types from the `interfaces/` directory.
- Avoid using `any`; prefer explicit types or generics.

## 10. General Best Practices
- Keep code DRY (Don't Repeat Yourself).
- Prefer functional components.
- Use destructuring for props and state.
- Keep imports organized: external libraries first, then internal modules.

---

**Follow these rules to ensure a consistent, maintainable, and approachable frontend codebase.**
