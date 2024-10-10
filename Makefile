

NAME = ft_transcendence
COMPOSE = ./docker-compose.yml


all: up 

up:
	docker compose -p $(NAME) -f $(COMPOSE) up --build -d
	@sudo chown $(whoami):$(whoami) ./elk
	@sudo chmod 755 ./elk

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
	@sudo rm -rf ./logs
	@sudo rm -rf ./elk/elastic/data/*

re: fclean up