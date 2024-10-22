

NAME = ft_transcendence
COMPOSE = ./docker-compose.yml


all: up 

up:
	docker compose -p $(NAME) -f $(COMPOSE) up --build -d
	@sudo chown $(whoami):$(whoami) ./elk
	@sudo chown -R 1000:1000 ./elk/elastic/data
	@sudo chmod -R 777 ./elk/elastic/data ./authentication/auth/logs
	@sudo chmod 755 ./elk
	@sudo chmod -R 755 ./data/web
	@echo "Waiting for kibana to be ready..."
	@echo "Creating Data view..."
	@sleep 30
	@docker exec -it kibana sh -c "./script.sh"
	@echo "\nData view Created!"

down:
	docker compose -p $(NAME) down --volumes

start:
	docker compose -p $(NAME) start

stop:
	docker compose -p $(NAME) stop

rm-image:
	docker rmi -f $$(docker images -q)

clean: down rm-image

fclean: clean
	
	@docker system prune -a
	@sudo rm -rf ./logs ./authentication/auth/logs/
	@sudo rm -rf ./elk/elastic/data/*

re: fclean up