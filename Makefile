

NAME = ft_transcendence
COMPOSE = ./docker-compose.yml


all: up 

up:
#	@mkdir -p ./certs
#	@chmod -R 777 ./certs
	docker compose -p $(NAME) -f $(COMPOSE) up --build -d
#	@echo "Creating Dashboard && Data view..."
#	@sleep 15
#	@docker exec -it kibana sh -c "./script.sh" 
#	@echo "\nData view Created!"

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
	@rm -rf ./certs
#	@touch ./elk/elastic/setup_password.sh

re: fclean up