import json
import pprint
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync

from django.contrib.auth import get_user_model

from accounts.serializers import MatchSerializer


class PresenceConsumer(WebsocketConsumer):

    def connect(self):
        pp = pprint.PrettyPrinter(indent=4)
        # pp.pprint(self.scope)

        self.group_name = self.scope["url_route"]["kwargs"]["group_name"]
        # print(f"Group_Name: {self.group_name}")
        self.match_name = f"{self.group_name}_match"
        # print(f"Match_Name: {self.match_name}")

        async_to_sync(self.channel_layer.group_add)(
            self.match_name, self.channel_name)
        
        self.user = self.scope["user"]
        # print(f"User from scope: {self.user}")       
        
        self.accept()
        async_to_sync(self.channel_layer.group_send)(
            self.match_name, 
            {
                'type': 'match.message',
                'message': f"{self.user} joined the match"
            }
        )

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(
            self.match_name, self.channel_name
        )
        async_to_sync(self.channel_layer.group_send)(
            self.match_name, 
            {
                'type': 'match.message',
                'message': f"{self.user} left the match"
            }
        )
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
        message = event["message"]
        self.send(text_data=json.dumps({"message": message}))


class PongConsumer(WebsocketConsumer):
    
    def connect(self):
        self.group_name = self.scope["url_route"]["kwargs"]["pong_match"]
        self.pong_match = f"{self.group_name}_match"
        self.user = self.scope["user"]

        async_to_sync(self.channel_layer.group_add)(
            self.pong_match, self.channel_name)
        
        self.accept()
        async_to_sync(self.channel_layer.group_send)(
            self.pong_match, 
            {
                'type': 'pong.log',
                'message': f"{self.user} joined the match"
            }
        )

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(
            self.pong_match, self.channel_name
        )
        # async_to_sync(self.channel_layer.group_send)(
        #     self.pong_match, 
        #     {
        #         'type': 'match.message',
        #         'message': f"{self.user} left the match"
        #     }
        # )
        return super().disconnect(close_code)

    def receive(self, text_data=None):
        # print(f"Data: {text_data}")
        # print(f"User: {self.user}")

        data = json.loads(text_data)
        user_id = data["user"]['id'] # Test using user in scope

        User = get_user_model()
        user = User.objects.select_related('player').get(id=user_id)

        if data.get('action') == 'create_match':
            game = data['game']
            players = data['players']

            if user.player.id == players[0]:
                serializer = MatchSerializer(data={
                    'game': game,
                    'players': players
                })
                if serializer.is_valid():
                    try:
                        match = serializer.save()
                        self.send(text_data=json.dumps({
                            'action': 'match_created',
                            'match_id': match.id,
                            'game': match.game,
                            'players': match.players
                        }))
                        return 
                    except:
                        self.send(text_data=json.dumps({
                        'action': 'error',
                        'errors': serializer.errors
                    }))

        if data.get('action') == 'move':
            key = data["key"]

            async_to_sync(self.channel_layer.group_send)(
                self.pong_match, 
                {
                    "type": "pong.move",
                    "user_id": user_id,
                    "key_move": key
                }
            )

    def pong_move(self, event):
        # print(f"Event: {event}")
        user_id = event["user_id"]
        key = event["key_move"]
        self.send(text_data=json.dumps({
        "user_id": user_id,
            "key": key
        }))

    def pong_log(self, event):
        message = event["message"]
        self.send(text_data=json.dumps({"message": message}))