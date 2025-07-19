# Drawer Navigation Migration - Step-by-Step Implementation Checklist

This checklist breaks down the migration plan into actionable steps for tracking and code review.

---

## 1. Remove Old Tab Navigation
- [ ] Delete `(tabs)/_layout.tsx` (old Tabs navigator)
- [ ] Remove all references to `/tabs` navigation in codebase

## 2. Update Navigation Calls
- [ ] Update all `router.replace('/(tabs)/(home)')` and similar calls to use Drawer navigation (e.g., `navigation.navigate('Home')`)
- [ ] Update deep links and navigation helpers

## 3. Ensure DrawerNavigator is Root
- [ ] Confirm `DrawerNavigator` is used in `app/_layout.tsx` as the root navigator
- [ ] Remove any legacy navigation wrappers

## 4. Polish Drawer UI
- [ ] Add icons, labels, and user info to Drawer
- [ ] Style Drawer for accessibility and modern look

## 5. Test Navigation Flows
- [ ] Manually test all navigation flows (open/close drawer, navigate to Home, Friends, Calendar, Settings)
- [ ] Test edge cases (back navigation, gestures, reloads)

## 6. Update/Write Navigation Tests
- [ ] Update or add unit/integration tests for navigation

## 7. Documentation
- [ ] Update README and architecture docs to describe Drawer navigation
- [ ] Add code comments explaining Drawer setup

## 8. QA & Deployment
- [ ] Validate in staging
- [ ] Deploy to production

---

| Step | Action | File(s) | Owner |
|------|--------|---------|-------|
| 1    | Remove old Tabs nav | app/(tabs)/_layout.tsx | Frontend |
| 2    | Update navigation calls | app/(tabs)/*, app/(auth)/*, app/index.tsx | Frontend |
| 3    | Ensure Drawer is root | app/_layout.tsx | Frontend |
| 4    | Polish Drawer UI | app/navigation/DrawerNavigator.tsx | Frontend |
| 5    | Test navigation | All | QA |
| 6    | Update tests | app/__tests__/* | Frontend |
| 7    | Update docs | README, docs | Both |
| 8    | QA & deploy | All | DevOps |
