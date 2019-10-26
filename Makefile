up:
	docker-compose up -d --build
down:
	docker-compose down
test:
	docker-compose exec -T app yarn test
shell:
	docker-compose exec app bash


.PHONY: up down test shell
