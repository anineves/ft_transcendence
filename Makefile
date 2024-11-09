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
	@if docker compose -p $(NAME) ps | grep -q 'Up'; then \
		echo "entrei aqui no downnn"; \
		docker compose -p $(NAME) down --volumes; \
	else \
		echo "Nothing to go downnnn!"; \
	fi

start:
	docker compose -p $(NAME) start

stop:
	docker compose -p $(NAME) stop

rm-image:
	@if [ -z $$(docker images -aq)] || [ $$(docker images -aq) = ""]; then \
		echo "Nothing to clean!"; \
	else \
		docker rmi -f $$(docker images -q); \
		echo "TO CLEAN IMAGES!"; \
	fi
clean: down rm-image

fclean: clean
	@docker system prune -a

re: fclean up

