NAME = ft_transcendence
COMPOSE = ./docker-compose.yml

all: up 

up: 
	@if ! docker compose -p $(NAME) ps | grep -q 'Up'; then \
	    docker compose -p $(NAME) -f $(COMPOSE) up -d --build; \
	else \
	    echo "$(NAME) containers are already running."; \
	fi

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

re: fclean up

