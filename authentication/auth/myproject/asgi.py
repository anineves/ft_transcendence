import os

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter # <- Add this
from channels.auth import AuthMiddlewareStack # <- Add this
from presence.consumers import PresenceConsumer # <- Add this

from myproject.chat_config import routing
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
