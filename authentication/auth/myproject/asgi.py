import os

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter
from presence.consumers import PresenceConsumer

from myproject.chat_config.jwt_middleware import JWTAuthMiddleware 


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django_asgi_application = get_asgi_application()

application = ProtocolTypeRouter(
    {
        "http": django_asgi_application,
        "websocket": JWTAuthMiddleware(
            PresenceConsumer.as_asgi()
        ),
    }
)
