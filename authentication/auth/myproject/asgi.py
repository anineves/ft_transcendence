import os

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from presence.routing import websocket_urlpatterns

from myproject.chat_config.jwt_middleware import JWTAuthMiddleware 


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django_asgi_application = get_asgi_application()

application = ProtocolTypeRouter(
    {
        "http": django_asgi_application,
        "websocket": JWTAuthMiddleware(
            URLRouter(websocket_urlpatterns)
        ),
    }
)
