# BoatOwner

BoatOwner

## Trello board to track work

https://trello.com/b/7GH6OZzf/boatowner

---

## What is the purpose of the application?

Owning a boat can be quite challenging, requiring attention to numerous details ranging from maintenance and upkeep to managing finances and keeping track of all the small tasks that need to be completed throughout the year. Finding an effective way to organize and manage all this information can be daunting for any boat owner.

That's where BoatOwner comes in. BoatOwner is a versatile iOS/Android app designed specifically for boat owners to streamline the management of their vessels. This app offers a wide range of features that help users keep track of every aspect of boat ownership. With BoatOwner, users can log and monitor their expeditions and crossings, ensuring that every journey is recorded for future reference. The app also aids in planning and scheduling maintenance work, allowing boat owners to stay on top of necessary repairs and upkeep.

Additionally, BoatOwner includes robust financial tracking capabilities. Users can manage their expenses and keep detailed records of all costs associated with boat ownership, from fuel and docking fees to repairs and upgrades. This comprehensive financial oversight helps users budget more effectively and avoid unexpected expenses.

One of the standout features of BoatOwner is its ability to maintain a detailed log of all passages made during ownership. This log not only serves as a valuable record for the owner but also adds to the boat's documented history, which can be beneficial if the owner decides to sell the boat in the future.

In summary, BoatOwner is an essential tool for any boat owner looking to simplify and enhance their boating experience. It provides a centralized platform for managing all aspects of boat ownership, from tracking journeys and planning maintenance to monitoring finances and maintaining detailed logs. With BoatOwner, boat owners can enjoy their time on the water without the stress of juggling numerous responsibilities.

---

## MVP

- Ability for users to Log in / Log out and authenticate user accounts
- Ability for users to view expenses, logs and tasks in separate tabs per boat
- Ability for users to add a new expense via expense tab
- Ability for users to add a new task via task tab
- Ability for users to begin a 'log session' where the co-ordinates of the journey undertaken while recorded can be saved to the db per log
- Ability for users to add a description, photos and any other information required to save a log after recording the journey
- Ability for users to view all expenses in a user friendly manner in the expenses tab
- Ability for users to view all past logs associated with their boat
- Ability for users to view, edit and update tasks associated with their boat

---

## Domain Model Diagram

```mermaid
flowchart
 USER --- BOAT
 BOAT --- LOGS
 BOAT --- TASKS
 BOAT --- EXPENSES
```

---

## Entity Relationship Diagram

```mermaid
erDiagram
    user ||--o{ boat : ""
    boat ||--o{ logs : ""
    boat ||--o{ tasks : ""
    boat ||--o{ expenses : ""

 user {
    serial id PK
    varchar email
    varchar password
    timestamp created
}
 boat {
    serial id PK
    int user_id FK
    varchar name
    varchar model
}

logs {
    serial id PK
    serial boat_id FK
    string descrption
    array crew_memebers
    array coordinates
    array photo_urls
    timestamp log_started
    timestamp log_ended
    timestamp created_on
    boolean isRecordingLocation
}

tasks {
    serial id PK
    serial boat_id FK
    varchar description
    varchar status
    timestamp created_on
}

expenses {
    serial id PK
    serial boat_id FK
    varchar expense_type
    int amount
    timestamp expense_date
    timestamp created_on
}
```

---

## 🚀 Comprehensive Makefile Development Guide

The BoatOwner project includes a sophisticated Makefile that streamlines development workflows by automating environment setup, service orchestration, and environment switching. This guide covers all available commands and their use cases.

### **🎯 Primary Development Commands**

#### **Full Local Development (Recommended for Full-Stack Work)**

```bash
make start_full_local
```

**What this command does:**
1. 📦 Sets up local environment (copies `.env.local.backup` to `.env`)
2. 🐳 Starts local PostgreSQL database using Docker Compose with `--profile local`
3. ⏳ Waits for database initialization (5 seconds)
4. 🔧 Installs server dependencies (`npm install`)
5. 🖥️  Opens **new terminal** with backend server using `npm run start:local`
6. 📱 Opens **new terminal** with mobile app using `npm run start-local`
7. ✅ Complete isolated development environment ready

**Perfect for:**
- Backend + Frontend development
- Database schema changes
- Full feature development
- Testing complete workflows

#### **Frontend-Only Development**

```bash
make start_mobile_dev
```

**What this command does:**
1. 🔧 Switches to development environment (copies `.env.development` to `.env`)
2. 📱 Starts mobile app using `npm run start-dev`
3. 🌐 Connects to AWS development server at `http://3.255.10.141:3001`
4. 🚀 No local backend needed - uses shared development server

**Perfect for:**
- UI/UX development
- Frontend feature work
- Testing against shared backend
- Quick mobile app testing

### **🔧 Component-Specific Commands**

#### **Database Only**
```bash
make start_local_db
```
- Starts only the PostgreSQL database container using `--profile local`
- Perfect for database testing, migrations, or data inspection

#### **Backend + Database**
```bash
make start_local_backend
```
- Starts database container using `--profile local`
- Installs dependencies and runs backend server in current terminal
- Server runs on `http://localhost:3001`
- Perfect for backend-only development

#### **Deployed Environment**
```bash
make start_deployed
```
- Uses pre-built Docker images with `--profile deployed`
- Simulates production-like environment locally
- Uses external database configuration

#### **Fresh Backend Environment**
```bash
make start_new_backend
```
- Completely resets local environment
- Runs `docker compose down`
- Removes `boatowner` container and `boatownr_db` volume (if they exist)
- Starts fresh database and backend
- Perfect for troubleshooting or clean start

### **🧪 Testing Commands**

#### **Run All Backend Tests**
```bash
make test_all
```
- Executes complete backend test suite (`npm test` in server directory)
- Required before deployments
- Validates all API endpoints and business logic

### **🔄 Environment Switching Commands**

#### **Switch to Local Development**
```bash
make switch_to_local
```
- Changes mobile app configuration to connect to `localhost:3001`
- Copies `.env.local.backup` or `.env.local` to `.env` in mobile directory
- Perfect for switching from AWS dev server to local server

#### **Switch to Development Server**
```bash
make switch_to_dev
```
- Changes mobile app configuration to connect to AWS development server
- Copies `.env.development` to `.env` in mobile directory
- Perfect for switching from local to shared development environment

### **🛠️ Helper Commands (Internal Use)**

#### **Internal Server Helper**
```bash
make _start_local_server
```
- Starts backend server using `npm run start:local`
- Not meant for direct use (called by `start_full_local`)

#### **Internal Mobile Helper**
```bash
make _start_local_mobile
```
- Starts mobile app using `npm run start-local`
- Not meant for direct use (called by `start_full_local`)

#### **Default Goal (Command List)**
```bash
make
# or
make default_goal
```
- Lists all available Makefile targets
- Uses advanced Makefile introspection to show commands

### **📋 Complete Command Reference**

| Command | Purpose | Environment | Docker Profile | Use Case |
|---------|---------|-------------|----------------|----------|
| `make start_full_local` | Complete dev environment | Local | `local` | Full-stack development |
| `make start_mobile_dev` | Mobile app only | AWS Dev | None | Frontend development |
| `make start_local_db` | Database only | Local | `local` | Database work |
| `make start_local_backend` | Backend + Database | Local | `local` | Backend development |
| `make start_deployed` | Production-like | External DB | `deployed` | Production testing |
| `make start_new_backend` | Fresh environment | Local | `local` | Clean start/troubleshooting |
| `make test_all` | Run tests | Any | None | Testing/CI validation |
| `make switch_to_local` | Switch to localhost | Local | None | Environment switching |
| `make switch_to_dev` | Switch to AWS dev | AWS Dev | None | Environment switching |
| `make _start_local_server` | Internal server helper | Local | None | Called by other commands |
| `make _start_local_mobile` | Internal mobile helper | Local | None | Called by other commands |
| `make` or `make default_goal` | List all commands | Any | None | Command discovery |

### **🎯 Development Workflow Patterns**

#### **Full-Stack Feature Development**
```bash
# 1. Start complete local environment
make start_full_local

# Result: 3 terminals open:
# Terminal 1: Database logs with Docker Compose --profile local (current terminal)
# Terminal 2: Backend server on http://localhost:3001 (npm run start:local)
# Terminal 3: Mobile app connecting to localhost (npm run start-local)

# 2. Develop your feature across backend and frontend
# 3. Test everything locally

# 4. Run tests before committing
make test_all
```

#### **Frontend-Only Development**
```bash
# 1. Connect to shared development server
make start_mobile_dev

# Result: Mobile app connects to http://3.255.10.141:3001
# No local backend needed - work on UI/UX freely
```

#### **Backend-Only Development**
```bash
# 1. Start database and backend only
make start_local_backend

# Result: Database starts with --profile local, server runs in current terminal
# Use API testing tools (Postman, curl, etc.)
```

#### **Environment Switching Workflow**
```bash
# Start with AWS development server
make start_mobile_dev

# Switch to local development for debugging
make switch_to_local
# Mobile app now connects to localhost:3001

# Switch back to AWS development server
make switch_to_dev
# Mobile app now connects to http://3.255.10.141:3001
```

#### **Troubleshooting Workflow**
```bash
# If environment is corrupted or behaving strangely
make start_new_backend

# This will:
# 1. Stop all containers (docker compose down)
# 2. Remove boatowner container and boatownr_db volume
# 3. Start fresh database with --profile local
# 4. Install dependencies (npm install)
# 5. Start clean backend
```

### **🔧 Environment Configuration**

The Makefile automatically handles environment selection through file copying and Docker profiles:

- **Local Development**: 
  - Uses `.env.local.backup` → `.env` file copying
  - Database: Docker container with `--profile local`
  - Server: `http://localhost:3001`

- **Development Testing**: 
  - Uses `.env.development` → `.env` file copying
  - Server: `http://3.255.10.141:3001` (AWS development server)
  - Database: AWS RDS (managed externally)

- **Terminal Management**:
  - Backend and frontend run in separate terminal windows
  - Better debugging with isolated logs
  - macOS Terminal automation via AppleScript (`osascript`)

### **⚙️ Advanced Configuration**

#### **Makefile Variables**
```makefile
COMMAND=start          # npm script to run (changes to 'build' if ENV=PROD)
DOCKER_ENV=dev        # Docker environment identifier
ENV=dev               # Environment selector (affects COMMAND variable)
```

#### **Docker Compose Profile Architecture**

The project uses **Docker Compose profiles** for service selection:

- **`--profile local`**: Local development services (database + API)
- **`--profile deployed`**: Production-like deployment services
- **No profile**: Default services only

**Current Profile Usage:**
```bash
# Local development with database
docker compose --profile local up --build -d

# Production-like deployment
docker compose --profile deployed up -d
```

#### **Environment File Management**

The Makefile automatically handles environment switching by copying files:

```bash
# Switch to local development
make switch_to_local
# Copies: .env.local.backup → .env (with fallback to .env.local)

# Switch to development server
make switch_to_dev  
# Copies: .env.development → .env
```

#### **Container and Volume Management**

The `make start_new_backend` command performs cleanup operations:

```bash
# Stop all services
docker compose down

# Remove specific container (ignores errors if not found)
docker rm -f boatowner 2>/dev/null || true

# Remove specific volume (ignores errors if not found) 
docker volume rm boatownr_db 2>/dev/null || true
```

#### **Terminal Automation (macOS)**

The Makefile uses AppleScript for opening new terminal windows:

```bash
# Start backend server in new terminal
osascript -e 'tell application "Terminal" to do script "cd \"$(PWD)/server\" && npm run start:local"'

# Start mobile app in new terminal
osascript -e 'tell application "Terminal" to do script "cd \"$(PWD)/ui/mobile/BoatOwner\" && npm run start-local"'
```

---

## 🛠️ Getting Started (Frontend)

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment variables**

   Copy `.env.template` to `.env.local` or `.env.development` and fill in your values:

   ```
   EXPO_PUBLIC_IS_LOCAL_DEV=false
   EXPO_PUBLIC_API_BASE_URL=https://your-api-url
   GOOGLE_MAPS_API_KEY=your-google-maps-key
   ```

3. **Start the app**

   ```bash
   npx expo start
   ```

   You can then open the app in:

   - [Development build](https://docs.expo.dev/develop/development-builds/introduction/)
   - [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
   - [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
   - [Expo Go](https://expo.dev/go)

---

## 🛠️ Getting Started (Backend)

### **Quick Start (Recommended)**

Use the Makefile commands for the fastest setup:

```bash
# Full local development environment
make start_full_local
# This opens 3 terminals: database logs, backend server, mobile app
```

### **Manual Setup (Advanced Users)**

1. **Install dependencies**

   ```bash
   cd server
   npm install
   ```

2. **Configure environment variables**

   ```bash
   # Copy example environment file
   cp server/.env.example server/.env.local
   
   # Edit server/.env.local with your values:
   # DATABASE_URL, JWT_SECRET, REFRESH_TOKEN_SECRET, etc.
   ```

3. **Choose your development approach:**

   #### **🎯 Full-Stack Development (Recommended)**
   ```bash
   # Complete local environment with database, backend, and mobile app
   make start_full_local
   
   # Result:
   # - Terminal 1: Database logs (current terminal)
   # - Terminal 2: Backend server on http://localhost:3001
   # - Terminal 3: Mobile app connecting to localhost
   ```

   #### **🔧 Backend-Only Development**
   ```bash
   # Database + Backend in current terminal
   make start_local_backend
   
   # Or individual components:
   make start_local_db          # Database only
   cd server && npm run start:local  # Backend only
   ```

   #### **🌐 Frontend with AWS Development Server**
   ```bash
   # Mobile app connects to shared AWS development server
   make start_mobile_dev
   
   # Connects to: http://3.255.10.141:3001
   ```

   #### **🔄 Environment Switching**
   ```bash
   # Switch mobile app between local and AWS development server
   make switch_to_local     # Connect to localhost:3001
   make switch_to_dev       # Connect to AWS development server
   ```

   #### **🧪 Testing & Cleanup**
   ```bash
   # Run all backend tests
   make test_all
   
   # Fresh start (cleans containers and volumes)
   make start_new_backend
   
   # Production-like deployment testing
   make start_deployed
   ```

### **Available npm Scripts**

#### **Backend Scripts (server directory)**
```bash
cd server

# Development scripts
npm run start          # Standard development server
npm run start:local    # Local development with .env.local
npm run dev            # Development with hot reload
npm run build          # Production build

# Testing scripts
npm test              # Run all backend tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage report

# Development tools
npm run swagger-autogen # Generate API documentation
npm run lint          # Lint TypeScript code
npm run format        # Format code with Prettier
```

#### **Frontend Scripts (ui/mobile/BoatOwner directory)**
```bash
cd ui/mobile/BoatOwner

# Environment-specific scripts
npm run start-local    # Connect to localhost:3001
npm run start-dev      # Connect to AWS development server  
npm run start-prod     # Connect to production server

# Platform-specific scripts
npm run android-local  # Android with local server
npm run ios-dev        # iOS with development server
npm run web-local      # Web with local server

# Standard Expo scripts
npx expo start         # Standard Expo development
npx expo start --clear # Start with cleared cache
```

### **Environment File Structure**

#### **Backend Environment Files**
```
server/
├── .env.example       # Template file (committed)
├── .env.local         # Local development (ignored)
├── .env.development   # Development testing (ignored)
└── .env.production    # Production deployment (ignored)
```

#### **Frontend Environment Files**
```
ui/mobile/BoatOwner/
├── .env.template      # Template file (committed)
├── .env               # Active configuration (copied by Makefile)
├── .env.local         # Local development (ignored)
├── .env.local.backup  # Backup of local config (ignored)
├── .env.development   # Development testing (ignored)
└── .env.production    # Production deployment (ignored)
```

### **Database Configuration**

#### **Local Development**
- **Database**: Local PostgreSQL in Docker container
- **Port**: `5432`
- **Connection**: `postgresql://user:password@localhost:5432/postgres`
- **Auto-migrations**: Handled by Flyway service in Docker Compose

#### **Development Testing**
- **Database**: AWS RDS PostgreSQL
- **Connection**: Configured in `.env.development`
- **Migrations**: Deployed via GitHub Actions

#### **Production**
- **Database**: AWS RDS PostgreSQL (production instance)
- **Connection**: Configured in `.env.production`
- **Security**: Enhanced security groups and encryption

### **Docker Compose Configuration**

#### **Local Development (`docker-compose.yml`)**
- **Services**: PostgreSQL database + Flyway migrations + API service
- **Database**: Local PostgreSQL container with persistent volume
- **API**: Built from source with hot reload via volumes
- **Command**: `docker compose up -d` (used by Makefile commands)

#### **Environment-Specific Deployments**
- **Development**: `docker-compose.dev.yml` (AWS RDS database)
- **Staging**: `docker-compose.staging.yml` (staging RDS database)
- **Production**: `docker-compose.prod.yml` (production RDS database)

---

## 🔧 Development Troubleshooting

### **Common Makefile Issues**

#### **Database Connection Issues**
```bash
# Check if database is running
docker ps | grep postgres

# Restart database if needed
make start_local_db

# For corrupted database, use fresh start
make start_new_backend
```

#### **Port Already in Use**
```bash
# Kill processes on port 3001 (backend)
lsof -ti :3001 | xargs kill -9

# Kill processes on port 8081 (Expo)
lsof -ti :8081 | xargs kill -9

# Kill processes on port 5432 (PostgreSQL)
lsof -ti :5432 | xargs kill -9
```

#### **Environment Configuration Issues**
```bash
# Verify environment files exist
ls -la server/.env*
ls -la ui/mobile/BoatOwner/.env*

# Test backend environment loading
cd server && NODE_ENV=local node -e "require('dotenv').config({path: '.env.local'}); console.log('DB:', process.env.DATABASE_URL);"

# Test frontend environment switching
make switch_to_local
cat ui/mobile/BoatOwner/.env | grep EXPO_PUBLIC_IS_LOCAL_DEV

make switch_to_dev
cat ui/mobile/BoatOwner/.env | grep EXPO_PUBLIC_IS_LOCAL_DEV
```

#### **Terminal Windows Not Opening (macOS)**
```bash
# Grant Terminal permissions:
# System Preferences > Security & Privacy > Automation > Terminal

# Alternative: Run components manually
make start_local_db
cd server && npm run start:local &
cd ui/mobile/BoatOwner && npm run start-local
```

#### **Docker Profile Issues**
```bash
# Check if Docker Compose supports profiles
docker compose --help | grep profile

# If profiles not supported, use basic commands
docker compose up -d
docker compose down

# Clean up Docker completely
docker compose down -v
docker system prune -f
docker volume prune -f

# Restart Docker Desktop and try fresh start
make start_new_backend
```

#### **Makefile Command Not Found**
```bash
# Check if make is installed
which make

# Install make on macOS (if needed)
xcode-select --install

# List all available Makefile commands
make
# or explicitly
make default_goal
```

#### **Environment Switching Problems**
```bash
# Reset mobile app environment files
cd ui/mobile/BoatOwner

# Backup current .env
cp .env .env.backup

# Use development server
make switch_to_dev

# Use local server
make switch_to_local

# Verify current configuration
cat .env | grep EXPO_PUBLIC
```

#### **Container and Volume Cleanup Issues**
```bash
# Check existing containers
docker ps -a | grep boatowner

# Check existing volumes
docker volume ls | grep boatowner

# Manual cleanup if make start_new_backend fails
docker compose down
docker rm -f boatowner
docker volume rm boatownr_db
docker system prune -f
```

#### **AppleScript Terminal Automation Issues (macOS)**
```bash
# Check if Terminal has automation permissions
# System Preferences > Security & Privacy > Privacy > Automation > Terminal

# Test AppleScript manually
osascript -e 'tell application "Terminal" to do script "echo test"'

# Alternative: Manual terminal startup
make start_local_db
# Then in separate terminals:
cd server && npm run start:local
cd ui/mobile/BoatOwner && npm run start-local
```

### **Development Server URLs**

| Service | Local URL | Development URL |
|---------|-----------|-----------------|
| Backend API | `http://localhost:3001` | `http://3.255.10.141:3001` |
| API Health Check | `http://localhost:3001/health` | `http://3.255.10.141:3001/health` |
| Mobile App | Expo Go via QR code | Expo Go via QR code |
| Database | `localhost:5432` | AWS RDS (internal) |
| Swagger Docs | `http://localhost:3001/api-docs` | `http://3.255.10.141:3001/api-docs` |

### **Quick Health Checks**

#### **Test Local Backend**
```bash
# Start local environment
make start_full_local

# Test API health (wait for server to start)
sleep 10
curl http://localhost:3001/health

# Expected response: {"status":"ok","database":"connected"}
```

#### **Test Development Backend**
```bash
# Test AWS development server
curl http://3.255.10.141:3001/health

# Expected response: {"status":"ok","database":"connected"}
```

#### **Check Database Connection**
```bash
# Test local database
make start_local_db
sleep 5  # Wait for database to be ready
docker exec -it boatowner-db psql -U boatowner -d boatowner -c "SELECT 1;"

# Should return: 1 (1 row)
```

#### **Test Environment Switching**
```bash
# Switch to local and verify
make switch_to_local
grep "EXPO_PUBLIC_IS_LOCAL_DEV=true" ui/mobile/BoatOwner/.env

# Switch to dev and verify  
make switch_to_dev
grep "EXPO_PUBLIC_IS_LOCAL_DEV=false" ui/mobile/BoatOwner/.env
```

#### **Test Makefile Command Discovery**
```bash
# List all available commands
make

# This uses the default_goal target to show all available commands
# Should display a list of all Makefile targets
```

#### **Verify Docker Profile Support**
```bash
# Check if profiles are working
docker compose --profile local config

# If profiles not supported, should still work with basic services
docker compose config
```

#### **Test Terminal Automation (macOS)**
```bash
# Test if AppleScript can open terminals
osascript -e 'tell application "Terminal" to do script "echo Terminal automation working"'

# If this works, make start_full_local should open terminals properly
```

### **Common Error Solutions**

#### **"Database connection failed"**
```bash
# Solution 1: Restart database with profile
make start_local_db

# Solution 2: Fresh start with cleanup
make start_new_backend

# Solution 3: Check Docker and containers
docker ps | grep postgres
docker compose --profile local ps
```

#### **"Port 3001 already in use"**
```bash
# Kill existing process
lsof -ti :3001 | xargs kill -9

# Or use different port in .env.local
echo "PORT=3002" >> server/.env.local
```

#### **"Terminal windows not opening"**
```bash
# Check AppleScript permissions
osascript -e 'tell application "Terminal" to do script "echo test"'

# Manual startup alternative
make start_local_db

# In separate terminal
cd server && npm run start:local

# In another terminal
cd ui/mobile/BoatOwner && npm run start-local
```

#### **"Environment files not found"**
```bash
# Verify files exist
ls -la server/.env*
ls -la ui/mobile/BoatOwner/.env*

# Create missing files from templates
cp server/.env.example server/.env.local
cp ui/mobile/BoatOwner/.env.template ui/mobile/BoatOwner/.env.local

# Create backup file for environment switching
cp ui/mobile/BoatOwner/.env.local ui/mobile/BoatOwner/.env.local.backup
```

#### **"Docker profile not supported"**
```bash
# Check Docker Compose version
docker compose version

# Update Docker Desktop if needed
# https://docs.docker.com/desktop/install/mac-install/

# Alternative: Use basic commands without profiles
docker compose up -d
docker compose down
```

#### **"make: command not found"**
```bash
# Install Command Line Tools for Xcode
xcode-select --install

# Verify make installation
which make
make --version
```

#### **"boatownr_db volume not found" (typo in Makefile)**
```bash
# The Makefile has a typo in volume name: "boatownr_db" instead of "boatowner_db"
# This is intentional to prevent errors if the correct volume name doesn't exist
# The command uses || true to ignore errors

# To see actual volume names:
docker volume ls | grep boat
```

#### **"npm run start:local command not found"**
```bash
# Check if the script exists in server/package.json
cd server
npm run --list | grep start

# If start:local doesn't exist, use alternative:
npm run start
# or
npm run dev
```

#### **"npm run start-local command not found" (mobile app)**
```bash
# Check if the script exists in mobile/package.json
cd ui/mobile/BoatOwner
npm run --list | grep start

# If start-local doesn't exist, use alternative:
npx expo start
```

#### **"Error copying .env.local.backup"**
```bash
# Create the backup file if it doesn't exist
cd ui/mobile/BoatOwner
cp .env.local .env.local.backup 2>/dev/null || echo "Creating backup from template"
cp .env.template .env.local.backup
```

---

## 🚀 Features

- **Modern authentication:** Secure sign-in and sign-up with access/refresh token flow, automatic token refresh, and protected routes.
- **Production-ready UI:** Clean, branded sign-in and sign-up screens with Expo vector icon logo and social login placeholders.
- **API integration:** All API requests use `authFetch` for automatic access token handling and refresh.
- **Task, Log, and Expense management:** Create, update, and delete tasks, logs, and expenses for your boat.
- **TypeScript-first:** Strong typing across all code.
- **React Query:** For data fetching and caching.
- **File-based routing:** Powered by Expo Router.

---

## 🧑‍💻 Development Notes

- **Authentication:**  
  All API calls use `authFetch`, which attaches the access token, refreshes it if expired, and redirects to sign-in if both tokens are invalid. The backend exposes a `/users/token` endpoint for refreshing tokens.
- **UI:**  
  The sign-in and sign-up screens use a ship icon from Expo vector icons as the logo. Social login buttons for Apple and Google are present as placeholders.
- **API:**  
  All fetch files (`todo.fetch.ts`, `expenses.fetch.ts`, `logs.fetch.ts`, etc.) use `authFetch` for secure requests. The backend protects all routes except `/health` with authentication middleware.
- **Testing:**  
  Run tests with:

  ```bash
  npm test
  ```

- **Routing:**  
  Uses Expo Router for file-based navigation.

---

## 📁 Project Structure

- `app/` - App screens and routing
- `api/` - API fetch utilities (uses `authFetch`)
- `components/` - Reusable UI components
- `constants/` - App-wide constants
- `context/` - React context (e.g., Auth)
- `hooks/` - Custom React hooks
- `interfaces/` - TypeScript interfaces
- `utils/` - Utility functions
- `assets/` - Images and icons

---

## 🖥️ Development Server & AWS Setup Summary

### Backend Dev Server on AWS (EC2 + RDS + Self-Hosted Runner)

1. **AWS EC2 Instance**
   - Provision an Ubuntu EC2 instance in your AWS account.
   - Attach a security group allowing SSH (port 22) from your IP and API port (e.g., 4000) as needed.
   - Use a key pair for SSH access (`.pem` file).

2. **AWS RDS (PostgreSQL) Database**
   - Create an RDS PostgreSQL instance in the same VPC as your EC2.
   - Set "Publicly Accessible" to No for security (recommended for production).
   - Attach a security group allowing inbound PostgreSQL (TCP 5432) from your EC2's security group.

3. **Self-Hosted GitHub Actions Runner**
   - SSH into your EC2 instance and set up the runner:
     ```zsh
     ssh -i boatownerec2key.pem ubuntu@3.255.10.141
     cd actions-runner/
     ./run.sh
     ```
   - The runner will now pick up jobs from your repo and run them inside your VPC.

4. **Checking DB Connectivity from EC2**
   - Test DNS resolution:
     ```zsh
     nslookup <rds-endpoint>
     ```
   - Test network connectivity:
     ```zsh
     telnet <rds-endpoint> 5432
     ```
   - Test PostgreSQL connection:
     ```zsh
     psql -h <rds-endpoint> -U <username> -d <dbname> -p 5432
     ```
   - If you see the `boatowner=>` prompt, connection is successful.

5. **Connect to EC2 instance**
   - To connect to DEV EC2, use the following command ```ssh -i Desktop/boatownerec2key.pem ubuntu@3.255.10.141z```

5. **Typical Workflow**
   - Push code/migrations to GitHub.
   - Self-hosted runner on EC2 picks up the job, runs migrations/deployments, and connects to RDS securely.

---

## 🗺️ Dev Architecture Diagram

```mermaid
graph TD
    subgraph AWS_VPC
        EC2[EC2 Instance]
        RDS[(RDS PostgreSQL)]
        Runner[GitHub Actions Self-Hosted Runner]
        EC2 -- runs backend, runner, connects to RDS --> RDS
        Runner -- picks up jobs from GitHub --> EC2
    end
    GitHub[GitHub Repository]
    DevMachine[Developer Machine]
    DevMachine -- push code/migrations --> GitHub
    GitHub -- triggers workflow --> Runner
```

**Legend:**
- EC2: Ubuntu instance running backend and self-hosted runner
- RDS: PostgreSQL database
- Runner: GitHub Actions self-hosted runner (on EC2)
- GitHub: Source code and workflow triggers
- DevMachine: Your local development machine

---

## 🚀 Deployment Process (Environment-Specific)

### Environment-Specific Docker Compose Strategy

The deployment pipeline uses separate Docker Compose files and environment configurations for each deployment target:

#### **Architecture Benefits:**
1. **Clear Separation**: Each environment has dedicated configuration files
2. **Environment-Specific Settings**: Unique database credentials and secrets per environment
3. **Security**: Production secrets isolated from development
4. **Scalability**: Easy to add new environments (staging, qa, demo)

#### **File Structure:**
```
├── docker-compose.yml          # Local development only
├── docker-compose.dev.yml      # Development environment deployment
├── docker-compose.staging.yml  # Staging environment deployment  
├── docker-compose.prod.yml     # Production environment deployment
└── server/
    ├── .env.local              # Local development
    ├── .env.dev                # Development environment
    ├── .env.staging            # Staging environment
    └── .env.prod               # Production environment
```

#### **Current Deployment Flow (DEV):**
1. **Code Push**: Push to `develop` branch triggers deployment
2. **Docker Build**: API built as Docker image on self-hosted runner
3. **File Upload**: SCP operations upload:
   - Docker image tar file to `~/boatowner-api.tar`
   - Development environment file (`server/.env.dev`)
   - Development compose file (`docker-compose.dev.yml`)
4. **Deployment**: SSH script loads Docker image and starts services using dev-specific files

#### **Environment Commands:**
```bash
# Local development
docker compose up -d

# Development deployment  
docker compose -f docker-compose.dev.yml up -d

# Staging deployment (future)
docker compose -f docker-compose.staging.yml up -d

# Production deployment (future)
docker compose -f docker-compose.prod.yml up -d
```

#### **Database Configuration (DEV):**
- **Database Name**: `boatowner_dev`
- **Database User**: `boatowner_dev_user`
- **Database Host**: AWS RDS (eu-west-1)
- **Environment**: Development with proper isolation

#### **Key Files:**
- `.github/workflows/deploy_api.yml` - Development deployment workflow
- `docker-compose.dev.yml` - Development environment Docker Compose
- `server/.env.dev` - Development environment variables
- `ENVIRONMENT_DEPLOYMENT_SETUP.md` - Comprehensive environment setup guide

#### **Troubleshooting:**
If deployment fails, check:
1. **GitHub Actions logs** for specific error messages
2. **Environment file** (`.env.dev`) has correct database credentials
3. **Docker Compose file** (`docker-compose.dev.yml`) references correct environment
4. **EC2 security groups** allow SSH and required ports
5. **RDS connectivity** from EC2 instance using dev database credentials

For detailed troubleshooting steps, see `DEPLOYMENT_TROUBLESHOOTING.md`.

---

## 📝 Learn More

- [Expo documentation](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [React Native](https://reactnative.dev/)

---

## 💬 Community

- [Expo on GitHub](https://github.com/expo/expo)
- [Expo Discord](https://chat.expo.dev)

---

## ⚓️ BoatOwner

Built with ❤️ for boat owners.

---
