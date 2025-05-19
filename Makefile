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
	docker compose up -d
start_backend: start_local_db
	cd server && npm i && npm run ${COMMAND}
start_backend_docker:
	docker compose --profile ${DOCKER_ENV} up