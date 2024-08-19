import json
import pprint
from channels.generic.websocket import WebsocketConsumer


class PresenceConsumer(WebsocketConsumer):

    connections = []

    def connect(self):
        self.accept()
        pp = pprint.PrettyPrinter(indent=4)
        pp.pprint(f"Scope: {self.scope}")
        self.user = self.scope["user"]
        print(f"User from scope: {self.user}")
        self.connections.append(self)
        self.update_indicator(msg="Connected")

    def disconnect(self, code):
        self.update_indicator(msg="Disconnected")
        self.connections.remove(self)
        return super().disconnect(code)

    def update_indicator(self, msg):
        for connection in self.connections:
            connection.send(
                text_data=json.dumps(
                    {
                        "msg": f"{self.user.username} {msg}" if self.user.is_authenticated else "Guest",
                        "online": len(self.connections),
                        "users": [
                            {
                                "username": user.scope.get("user").username or "Guest",
                                "id": user.scope.get("user").id or None
                            }
                            for user in self.connections
                        ]
                    }
                )
            )
        print(f"MSG: {msg}")

    def receive(self, text_data=None, bytes_data=None):
        for connection in self.connections:
            connection.send(
                text_data=json.dumps(
                    {
                        "msg": f"{self.user.username}" if self.user.is_authenticated else f"Guest {text_data}",
                        "online": len(self.connections),
                        "users": [
                            {
                                "username": user.scope.get("user").username or "Guest",
                                "id": user.scope.get("user").id or None
                            }
                            for user in self.connections
                        ]
                    }
                )
            )