import json
import pprint
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync


class PresenceConsumer(WebsocketConsumer):

    def connect(self):
        pp = pprint.PrettyPrinter(indent=4)
        # pp.pprint(self.scope)

        self.group_name = self.scope["url_route"]["kwargs"]["group_name"]
        # print(f"Group_Name: {self.group_name}")
        self.match_name = f"{self.group_name}_match"
        # print(f"Match_Name: {self.match_name}")

        async_to_sync(self.channel_layer.group_add)(
            self.match_name, self.channel_name
        )

        self.user = self.scope["user"]
        # print(f"User from scope: {self.user}")
        
        
        self.accept()

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(
            self.match_name, self.channel_name
        )
        print(f"THe channel {self.channel_name} was disconnected from {self.match_name}")
        return super().disconnect(close_code)

    def receive(self, text_data=None):
        text_data_json = json.loads(text_data)
        message = text_data_json["message"]

        async_to_sync(self.channel_layer.group_send)(
            self.match_name, 
            {
                "type": "match.message",
                "message": message
            }
        )

    def match_message(self, event):
        # print("Match Message was called")
        message = event["message"]
        self.send(text_data=json.dumps({"message": message}))
