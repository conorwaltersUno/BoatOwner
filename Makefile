COMMAND=start
DOCKER_ENV=dev
ENV=dev

ifeq "${ENV}" "PROD"
COMMAND=build
endif

default_goal:
	@echo "options:"
	@$(MAKE) -pRrq -f $(lastword $(MAKEFILE_LIST)) : 2>/dev/null | awk -v RS= -F: '/^# File/,/^# Finished Make data base/ {if ($$1 !~ "^[#.]") {print $$1}}' | sort | egrep -v -e '^[^[:alnum:]]' -e '^$@$$' | xargs

start_local_db:
	docker compose --profile local up --build -d
	
start_local_backend:
	docker compose --profile local up --build -d
	cd server && npm i && npm run ${COMMAND}
	
start_deployed:
	docker compose --profile deployed up -d
	
start_new_backend:
	docker compose down
	-docker rm -f boatowner 2>/dev/null || true
	-docker volume rm boatownr_db 2>/dev/null || true
	$(MAKE) start_local_db
	cd server && npm i && npm run ${COMMAND}

test_all:
	cd server && npm test

# Full local development - starts local DB, local server in one terminal, mobile app in another
start_full_local:
	@echo "🚀 Starting full local development environment..."
	@echo "📦 Step 1: Setting up local environment..."
	cd ui/mobile/BoatOwner && cp .env.local.backup .env 2>/dev/null || echo "Local env ready"
	@echo "📦 Step 2: Starting local database..."
	docker compose --profile local up --build -d
	@echo "⏳ Waiting for database to be ready..."
	sleep 5
	@echo "🔧 Step 3: Installing server dependencies..."
	cd server && npm install
	@echo "🖥️  Step 4: Starting server in new terminal..."
	osascript -e 'tell application "Terminal" to do script "cd \"$(PWD)/server\" && npm run start:local"'
	@echo "⏳ Waiting for server to start..."
	sleep 3
	@echo "📱 Step 5: Starting mobile app in new terminal..."
	osascript -e 'tell application "Terminal" to do script "cd \"$(PWD)/ui/mobile/BoatOwner\" && npm run start-local"'
	@echo "✅ Local server started in separate terminal on http://localhost:3001"
	@echo "✅ Mobile app started in separate terminal (connects to local server)"
	@echo "🎯 Check the new Terminal windows to see server and mobile app logs"

# UI only in development mode - connects to AWS development server
start_mobile_dev:
	@echo "📱 Starting mobile app in development mode..."
	@echo "🔧 Setting up development environment..."
	cd ui/mobile/BoatOwner && cp .env.development .env
	@echo "✅ Mobile app will connect to AWS development server"
	cd ui/mobile/BoatOwner && npm run start-dev

# Switch to local development environment
switch_to_local:
	@echo "🔄 Switching to local development environment..."
	cd ui/mobile/BoatOwner && cp .env.local.backup .env 2>/dev/null || cp .env.local .env 2>/dev/null || echo "No local env file found"
	@echo "✅ Environment switched to local development"

# Switch to development server environment  
switch_to_dev:
	@echo "🔄 Switching to development server environment..."
	cd ui/mobile/BoatOwner && cp .env.development .env
	@echo "✅ Environment switched to development server"

# Helper targets (not meant to be called directly)
_start_local_server:
	cd server && npm run start:local

_start_local_mobile:
	cd ui/mobile/BoatOwner && npm run start-local
