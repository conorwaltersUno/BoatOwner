# DEVELOPMENT RULES - BoatOwner Project

**⚠️ MANDATORY COMPLIANCE: All developers MUST follow these rules when creating new features. No exceptions.**

---

## 🚨 CRITICAL PREREQUISITES

### Before Starting ANY Feature Development:
1. **Read and understand the entire README.md**
2. **Review existing code architecture in the same domain**
3. **Check Trello board for related tasks**: https://trello.com/b/7GH6OZzf/boatowner
4. **Update your local environment and dependencies**
5. **Run all existing tests to ensure clean baseline**

---

## 📋 FEATURE DEVELOPMENT CHECKLIST

### Phase 1: Planning & Design
- [ ] **Domain Analysis**: Identify which domain entities are affected (User, Boat, Logs, Tasks, Expenses)
- [ ] **Database Impact**: Determine if schema changes are needed
- [ ] **API Design**: Plan RESTful endpoints following existing patterns
- [ ] **UI/UX Flow**: Sketch user interaction flow
- [ ] **Security Review**: Identify authentication/authorization requirements

### Phase 2: Backend Implementation
- [ ] **Database Migration**: Create Flyway migration if schema changes needed
- [ ] **Database Restart**: run 'docker compose down 
- [ ] **Prisma Schema**: Never manually update schema.prisma files. Always run 'npx run prisma db pull' and 'npx prisma generate' to refresh the schema after restarting the docker
- [ ] **TypeScript Interfaces**: Define/update interfaces in `interfaces/`
- [ ] **Service Layer**: Implement business logic in `services/`
- [ ] **Controller Layer**: Handle HTTP requests in `controllers/`
- [ ] **Router Configuration**: Add routes in `routers/`
- [ ] **Middleware**: Implement validation/auth middleware
- [ ] **Swagger Documentation**: Document all new endpoints
- [ ] **Unit Tests**: Write comprehensive tests
- [ ] **Integration Tests**: Test full request/response cycle

### Phase 3: Frontend Implementation
- [ ] **TypeScript Types**: Create/update interfaces in `interfaces/`
- [ ] **API Integration**: Create fetch functions in `api/fetch/`
- [ ] **Custom Hooks**: Implement React Query hooks in `hooks/`
- [ ] **Components**: Build reusable UI components
- [ ] **Screens**: Create/update screens in `app/`
- [ ] **Navigation**: Update routing if needed
- [ ] **State Management**: Implement with React Query + Context
- [ ] **Form Validation**: Use Formik + Yup for forms
- [ ] **Error Handling**: Implement comprehensive error states
- [ ] **Loading States**: Add loading indicators
- [ ] **Testing**: Write unit tests for components and hooks

### Phase 4: Integration & Deployment
- [ ] **End-to-End Testing**: Test complete feature flow
- [ ] **Performance Testing**: Ensure no performance regression
- [ ] **Security Testing**: Validate authentication and authorization
- [ ] **Code Review**: Get peer review before merging
- [ ] **Documentation**: Update README and architectural docs
- [ ] **Migration Testing**: Test database migrations in staging

---

## 🏗️ ARCHITECTURAL REQUIREMENTS

### Backend Architecture (MANDATORY)
```
📁 Feature Implementation Structure:
├── database/migrations/     # Flyway SQL migrations
├── server/
│   ├── interfaces/         # TypeScript interfaces
│   ├── services/          # Business logic (NO database calls in controllers)
│   ├── controllers/       # HTTP request/response handling
│   ├── routers/          # Route definitions
│   ├── middleware/       # Validation, auth, error handling
│   └── __tests__/        # Unit and integration tests
```

**STRICT RULES:**
- **Controllers MUST NOT contain business logic** - only HTTP handling
- **Services MUST handle all business logic** - controllers call services
- **All database access MUST go through Prisma ORM**
- **Every endpoint MUST have authentication** (except /health)
- **All inputs MUST be validated** using express-validator
- **All endpoints MUST be documented** in Swagger
- **All functions MUST have TypeScript types**
- **All errors MUST be handled** with proper HTTP status codes

### Frontend Architecture (MANDATORY)
```
📁 Feature Implementation Structure:
├── app/                   # File-based routing screens
├── components/           # Reusable UI components
├── hooks/               # Custom React hooks (React Query)
├── api/fetch/           # API calls using authFetch
├── interfaces/          # TypeScript interfaces
├── constants/           # API routes, query keys, colors
└── utils/              # Utility functions
```

**STRICT RULES:**
- **All API calls MUST use authFetch** (automatic token handling)
- **All server state MUST use React Query** - no useState for server data
- **All forms MUST use Formik + Yup** for validation
- **All components MUST be TypeScript** with proper interfaces
- **All screens MUST handle loading/error states**
- **All components MUST be tested**
- **Follow FRONTEND_RULES.md** for styling and structure

---

## 🔒 SECURITY REQUIREMENTS

### Authentication & Authorization
- **ALL API endpoints MUST require authentication** (except /health)
- **Use JWT tokens** with access/refresh token flow
- **Validate user ownership** for boat-related resources
- **Sanitize all user inputs** to prevent injection attacks
- **Use HTTPS** in production
- **Store secrets in environment variables** NEVER in code
- **Use Expo SecureStore** for sensitive data on mobile

### Data Protection
- **Validate all inputs** on both client and server
- **Use proper HTTP status codes** for all responses
- **Log security events** (failed auth, invalid tokens, etc.)
- **Implement rate limiting** for API endpoints
- **Use CORS properly** - don't allow all origins in production

---

## 📊 DATABASE REQUIREMENTS

### Schema Changes
- **ALL schema changes MUST use Flyway migrations**
- **Migrations MUST be idempotent** and reversible
- **Use proper foreign key constraints**
- **Add indexes** for performance-critical queries
- **Follow naming conventions**: snake_case for columns/tables
- **Document complex queries** with comments

### Migration Process
1. **Create migration file** in `database/migrations/`
2. **Use format**: `V{major.minor}_{description}.sql`
3. **Test migration** locally first
4. **Backup production** before running migrations
5. **Monitor migration** in production

---

## 🧪 TESTING REQUIREMENTS

### Backend Testing (MANDATORY)
- **Unit tests** for ALL services and controllers
- **Integration tests** for ALL API endpoints
- **Mock external dependencies** (database, external APIs)
- **Test error scenarios** not just happy paths
- **Use Test Containers** for database integration tests
- **Achieve minimum 80% code coverage**

### Frontend Testing (MANDATORY)
- **Unit tests** for ALL components and hooks
- **Integration tests** for critical user flows
- **Mock API calls** in tests
- **Test error states** and loading states
- **Use React Testing Library** for component tests
- **Test accessibility** features

### Testing Commands
```bash
# Backend tests
cd server && npm test

# Frontend tests
cd ui/mobile/BoatOwner && npm test

# Run tests before every commit
```

---

## 📝 DOCUMENTATION REQUIREMENTS

### Code Documentation
- **JSDoc comments** for all public functions
- **Type definitions** for all interfaces
- **README updates** for new features
- **API documentation** in Swagger
- **Architecture decisions** in ADR format

### Commit Messages
```
feat(domain): brief description

- Detailed explanation of changes
- Why this change was made
- Any breaking changes
- Testing performed

Closes #123
```

---

## 🚀 DEPLOYMENT REQUIREMENTS

### Pre-Deployment Checklist
- [ ] **All tests passing** (backend and frontend)
- [ ] **Code review approved** by team lead
- [ ] **Database migrations tested** in staging
- [ ] **Environment variables configured**
- [ ] **Swagger documentation updated**
- [ ] **Performance impact assessed**
- [ ] **Security review completed**

### CI/CD Pipeline
- **GitHub Actions** handle automatic deployment
- **Database migrations** deploy automatically on master
- **Backend deploys** to staging first, then production
- **Frontend builds** and deploys through Expo

---

## 🚫 FORBIDDEN PRACTICES

### Absolutely Prohibited:
- **❌ Direct database queries** in controllers
- **❌ Business logic** in controllers
- **❌ Hardcoded API URLs** or secrets
- **❌ Using `any` type** in TypeScript
- **❌ Skipping authentication** on new endpoints
- **❌ Not handling errors** properly
- **❌ Not writing tests** for new features
- **❌ Not validating user inputs**
- **❌ Breaking existing functionality**
- **❌ Not updating documentation**

### Code Quality:
- **❌ No commented-out code** in commits
- **❌ No console.log** statements in production
- **❌ No TODO comments** without GitHub issues
- **❌ No magic numbers** or strings
- **❌ No duplicate code** - use DRY principles
- **❌ No overly complex functions** - keep functions small

---

## 📋 DOMAIN-SPECIFIC RULES

### User Management
- **User authentication** required for all operations
- **Password hashing** with bcrypt
- **JWT token management** with refresh tokens
- **User data validation** on all inputs

### Boat Management
- **User ownership validation** for all boat operations
- **Boat association** required for logs, tasks, expenses
- **Proper foreign key constraints** in database

### Logs Management
- **GPS coordinates** stored as JSON array
- **Crew members** stored as string array
- **Photo URLs** stored as string array
- **Location recording** state management
- **Timestamps** for start/end of logs

### Tasks Management
- **Status tracking** (pending, in-progress, completed)
- **Task assignment** to specific boats
- **Due date management** if implemented
- **Task categories** if implemented

### Expenses Management
- **Decimal precision** for money amounts
- **Expense categories** validation
- **Date validation** for expense dates
- **Currency handling** if multiple currencies

---

## 🔄 FEATURE LIFECYCLE

### 1. Planning Phase
- **Create GitHub issue** with detailed requirements
- **Design database schema** changes if needed
- **Plan API endpoints** following REST conventions
- **Design UI/UX flow** with mockups
- **Estimate development time**

### 2. Implementation Phase
- **Create feature branch** from master
- **Implement backend** following layered architecture
- **Implement frontend** following React Native patterns
- **Write comprehensive tests**
- **Update documentation**

### 3. Review Phase
- **Self-review** code against this checklist
- **Run all tests** locally
- **Create pull request** with detailed description
- **Address review feedback**
- **Ensure CI/CD passes**

### 4. Deployment Phase
- **Deploy to staging** environment
- **Run integration tests** in staging
- **Performance and security testing**
- **Deploy to production** after approval
- **Monitor deployment** for issues

---

## 📞 GETTING HELP

### When Stuck:
1. **Check existing code** in the same domain
2. **Review architectural documentation**
3. **Search GitHub issues** for similar problems
4. **Ask team lead** for guidance
5. **Create detailed GitHub issue** for complex problems

### Resources:
- **Project README**: `/README.md`
- **Backend Architecture**: `/doc/architecture/backend-architectural-patterns.mdc`
- **Frontend Architecture**: `/doc/architecture/mobile-ui-architectural-patters.md`
- **Frontend Rules**: `/ui/mobile/BoatOwner/FRONTEND_RULES.md`
- **Trello Board**: https://trello.com/b/7GH6OZzf/boatowner

---

## ⚖️ ENFORCEMENT

### Code Review Requirements:
- **All code MUST be reviewed** by team lead
- **All tests MUST pass** before merge
- **All documentation MUST be updated**
- **All architectural rules MUST be followed**

### Violations:
- **First violation**: Warning and re-work required
- **Second violation**: Mandatory architecture review
- **Third violation**: Removal from project

---

**Remember: These rules exist to ensure code quality, security, and maintainability. Following them protects both the project and your fellow developers.**

**🚢 Built with ❤️ for boat owners**
