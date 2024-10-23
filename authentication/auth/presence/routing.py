from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r"ws/global_chat/", consumers.ChatConsumer.as_asgi()),
    re_path(r"ws/pong_match/(?P<pong_match>\w+)/$", consumers.PongConsumer.as_asgi()),
    re_path(r"ws/snake_match/(?P<snake_match>\w+)/$", consumers.SnakeConsumer.as_asgi()),
    re_path(r"ws/tournament/", consumers.TournamentConsumer.as_asgi()),
]