

NAME = ft_transcendence
COMPOSE = ./docker-compose.yml


all: up 

up:
	docker compose -p $(NAME) -f $(COMPOSE) up --build -d
#	@chown -R $(whoami):$(whoami) ./elk ./authentication/auth/logs
#	@chown -R 1000:1000 ./elk/elastic/data
#	@chmod -R 777 ./elk/elastic/data ./authentication/auth/logs
#	@chmod 755 ./elk
#	@chmod -R 755 ./data/web
#	@echo "Waiting for kibana to be ready..."
	@echo "Creating Dashboard && Data view..."
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
	@rm -rf ./logs ./authentication/auth/logs/
	@rm -rf ./elk/elastic/data/*

re: fclean up