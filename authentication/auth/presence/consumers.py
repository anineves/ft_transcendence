import json

import pprint

from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync

from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser

from accounts.serializers import MatchSerializer
from accounts.models import PlayerChannel, Player, PrivateGroup

from myproject.chat_config.jwt_middleware import authenticate_user


class ChatConsumer(WebsocketConsumer):


    def connect(self):

        self.global_chat = "global_chat"
        async_to_sync(self.channel_layer.group_add)(
            self.global_chat, self.channel_name
        )
        
        # self.user = AnonymousUser()

        self.user = self.scope["user"]
        if self.user != AnonymousUser():
            User = get_user_model()
            user = User.objects.select_related('player').get(id=self.user.id)
            PlayerChannel.objects.create(
                channel_name=self.channel_name, 
                player=user.player
            )

        self.accept()

    def disconnect(self, close_code):
        
        async_to_sync(self.channel_layer.group_discard)(
            self.global_chat, self.channel_name
        )

        PlayerChannel.objects.filter(channel_name=self.channel_name).delete()
        
        if close_code != 400:
            async_to_sync(self.channel_layer.group_send)(
                self.global_chat, 
                {
                    'type': 'chat.message',
                    'message': f"{self.user.player} left the chat" \
                        if self.user != AnonymousUser() else "Anonymous left the chat"
                }
            )
        return super().disconnect(close_code)

    def receive(self, text_data=None):
        data = json.loads(text_data)
        
        if data.get('Authorization'):
            return self.handle_authentication(data.get('Authorization'))
        
        message = data["message"]
        is_private = data["is_private"]

        if is_private:
            self.handle_private_chat(message)
        else:
            async_to_sync(self.channel_layer.group_send)(
                self.global_chat, 
                {
                    "type": "chat.message",
                    "message": message,
                    "from_player": self.user.player if self.user != AnonymousUser() else "Anonymous"
                }
            )

    def chat_message(self, event):
        message = event["message"]
        self.send(text_data=json.dumps({"message": message}))

    def handle_private_chat(self, message):

        if self.user == AnonymousUser():
            return self.send_channel_error_messages("Login to send private messages")
        
        try:
            message_split = message.split(" ", 1)
            nickname = message_split[0][1:]
            message = message_split[1]
        except IndexError:
            return self.send_channel_error_messages(f'Cannot send this. Try again.')

        try:
            player2 = Player.objects.prefetch_related("player_channel").get(nickname=nickname)
        except Player.DoesNotExist:
            return self.send_channel_error_messages(f'Player "{nickname}" does not exist')
        
        try: 
            PlayerChannel.objects.get(player=player2.id)
        except:
            return self.send_channel_error_messages("This player is not online")
        
        self.private_group = self.get_or_create_new_room(player2)

        async_to_sync(self.channel_layer.group_send)(
            self.private_group.group_name,
                {                
                    "type": "chat.message",
                    "message": message,
                    "from_player": self.user.player
                }
            )

    def get_or_create_new_room(self, to_player):
        from_player = self.user.player
        room_list = [from_player.id, to_player.id]
        sorted_list = sorted(room_list)
        group_id = ''.join(f"{sorted_list[0]}{sorted_list[1]}")

        try:
            self.private_group, created = PrivateGroup.objects.get_or_create(
                id=int(group_id),
                group_name=f"private_group_{group_id}"
            )
            self.private_group.save()
        except:
            print("# Something went wrong with creating_new_room")
        
        if created:
            self.private_group.players.add(from_player, to_player)
        
        async_to_sync(self.channel_layer.group_add)(
            self.private_group.group_name, self.channel_name)
        
        async_to_sync(self.channel_layer.group_add)(
            self.private_group.group_name, to_player.player_channel.channel_name)

        return self.private_group
    
    def handle_authentication(self, token):

        self.user = authenticate_user(token)
        if self.user != AnonymousUser():
            try:
                PlayerChannel.objects.create(
                    channel_name=self.channel_name, 
                    player=self.user.player
                )
            except:
                self.send_channel_error_messages("You must have a player to chat")
                return self.disconnect(400)

        async_to_sync(self.channel_layer.group_send)(
            self.global_chat, 
            {
                'type': 'chat.message',
                'message': f"{self.user.player.nickname} has joined the chat" \
                        if self.user != AnonymousUser() else "Anonymous has joined the chat"
            }   
        )

    def send_channel_error_messages(self, message):
        async_to_sync(self.channel_layer.send)(self.channel_name, 
            {
                "type": "chat.message",
                "message": message
            })


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