up:
	docker-compose up -d
down:
	docker-compose down
test:
	docker-compose exec app yarn test
shell:
	docker-compose exec app bash


.PHONY: up down test shell
