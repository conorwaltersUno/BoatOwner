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
