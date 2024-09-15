import json

import pprint

from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync

from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser

from accounts.serializers import MatchSerializer
from accounts.models import PlayerChannel, Player, PrivateGroup, MatchGroup

from myproject.chat_config.jwt_middleware import authenticate_user, handle_authentication

from django.db.models import Q


class ChatConsumer(WebsocketConsumer):


    def connect(self):

        self.global_chat = "global_chat"
        async_to_sync(self.channel_layer.group_add)(
            self.global_chat, self.channel_name
        )
        
        # self.user = AnonymousUser()

        # Using it for Postman tests
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
        if close_code == 400:
            self.send_self_channel_messages("You must have a player to use this feature")
        return super().disconnect(close_code)

    def receive(self, text_data=None):
        data = json.loads(text_data)
        
        if data.get('Authorization'): #Should we receive the token for every message?
            user = handle_authentication(self, data.get('Authorization'))
            if user:
                async_to_sync(self.channel_layer.group_send)(
                    self.global_chat, 
                    {
                        'type': 'chat.message',
                        'message': f"{self.user.player.nickname} has joined the chat"
                    }   
                )
                return
            else:
                return self.disconnect(400)
            # return self.handle_authentication(data.get('Authorization'))
        
        if data.get('action') == "block" or data.get('action') == "unblock":
            return self.block_player(data.get('player'), data.get('action'))
        
        message = data["message"]
        is_private = data["is_private"]
        
        sender = self.user.player if self.user != AnonymousUser() else "Anonymous"
        
        if is_private:
            self.handle_private_chat(data)
        else:
            async_to_sync(self.channel_layer.group_send)(
                self.global_chat, 
                {
                    "type": "chat.message",
                    "message": f"{sender}: {message}",
                    "from_player": self.user.player if self.user != AnonymousUser() else "Anonymous"
                }
            )

    def chat_message(self, event):
        message = event["message"]
        self.send(text_data=json.dumps({"message": message}))
    
    def request_duel(self, event):
        message = event["message"]
        action = event["action"]
        from_user = event["from_user"]
        group_name = event["group_name"]
        self.send(text_data=json.dumps({"action": action, "message": message, "from_user": from_user, "group_name": group_name}))

    def handle_private_chat(self, data):
        message = data.get("message")
        if self.user == AnonymousUser():
            return self.send_self_channel_messages("Login to send private messages")
        #TODO: Handle these three try
        try:
            message_split = message.split(" ", 1)
            nickname = message_split[0][1:]
            message = message_split[1]
        except IndexError:
            return self.send_self_channel_messages(f'Cannot send this. Try again.')

        try:
            player2 = Player.objects.prefetch_related("player_channel").get(nickname=nickname)
        except Player.DoesNotExist:
            return self.send_self_channel_messages(f'Player "{nickname}" does not exist')
        
        try: 
            PlayerChannel.objects.get(player=player2.id)
        except:
            return self.send_self_channel_messages("This player is not online")
    
        self.private_group = self.get_or_create_new_room(player2)

        if self.private_group.blocked == True:
            return self.send_self_channel_messages("Message was not sent")
        
        if data.get("action") == "duel":
            print(f"{data.get('action')}: {data.get('action')}")
            async_to_sync(self.channel_layer.group_send)(   
                        self.private_group.group_name,
                            {                
                                "type": "request.duel",
                                "action": "duel",
                                "message": f"{self.user.player}: {message}",
                                "from_user": self.user.id,
                                "group_name": self.private_group.group_name
                            }
                        )
        else:
            async_to_sync(self.channel_layer.group_send)(   
                self.private_group.group_name,
                    {                
                        "type": "chat.message",
                        "message": f"{self.user.player}: {message}",
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
            if created:
                self.private_group.players.add(from_player, to_player)
        except:
            print("# Something went wrong with creating_new_room")
        
        
        async_to_sync(self.channel_layer.group_add)(
            self.private_group.group_name, self.channel_name)
        
        async_to_sync(self.channel_layer.group_add)(
            self.private_group.group_name, to_player.player_channel.channel_name)

        return self.private_group

    def send_self_channel_messages(self, message):
        async_to_sync(self.channel_layer.send)(self.channel_name, 
            {
                "type": "chat.message",
                "message": message
            })

    def block_player(self, nickname, action):
        try:
            player_to_block = Player.objects.get(nickname=nickname)
        except Player.DoesNotExist:
            return self.send_self_channel_messages("Player does not exist") #TODO Second time I use it. Maybe a new method
        
        if self.user.player.nickname == nickname:
           return self.send_self_channel_messages(f"You cannot block yourself")

        group_to_block = PrivateGroup.objects.filter(
            players__id=self.user.player.id).filter(players__id=player_to_block.id).first()
        if group_to_block:
            if action == "block":
                group_to_block.blocked = True
            else:
                group_to_block.blocked = False
            group_to_block.save()
            self.send_self_channel_messages(f"{nickname} was {action}")
        else:
            self.send_self_channel_messages("Cannot block or unblock this user.")



class PongConsumer(WebsocketConsumer):
    
    def connect(self):
        self.group_name = self.scope["url_route"]["kwargs"]["pong_match"]
        self.pong_match = f"pong_group_{self.group_name}"
        self.user = self.scope["user"]       
        self.accept()

    def disconnect(self, close_code):
        if close_code == 400:
            self.send_self_channel_messages(
                "Authentication failed. \
                Ensure you must have a valid account and a player to access this feature."
            )

        async_to_sync(self.channel_layer.group_discard)(
            self.match_group.group_name, self.channel_name
        )
        if close_code == 401:
            self.match_group.delete()

        self.close()
        return super().disconnect(close_code)

    def receive(self, text_data=None):
        data = json.loads(text_data)
        if data.get('Authorization'):
            self.user = handle_authentication(self, data.get('Authorization'))
            if self.user:
                self.get_or_create_new_room()
            else:
                return self.disconnect(400)


        if data.get('action') == 'move_paddle' or data.get('action') == 'stop_paddle':
            message = data.get('message')
            async_to_sync(self.channel_layer.group_send)(
                self.match_group.group_name, 
                {
                    "type": "pong.log",
                    "action": data.get('action'),
                    "message": message
                }
            )
            
        if data.get('action') == 'end_game':
            return self.disconnect(401)

        if data.get('action') == 'ball_track':
            message = data.get('message')
            async_to_sync(self.channel_layer.group_send)(
                self.match_group.group_name, 
                {
                    "type": "pong.log",
                    "action": data.get('action'),
                    "message": message
                }
            )

        if data.get('action') == 'score_track':
            print("Data:")
            pprint.pp(data)
            print()
            message = data.get('message')
            game_over = message.get('game_over')
            if game_over == True:
                return self.disconnect(401)
            async_to_sync(self.channel_layer.group_send)(
                self.match_group.group_name, 
                {
                    "type": "pong.log",
                    "action": data.get('action'),
                    "message": message
                }
            )

    def pong_log(self, event):
        message = event["message"]
        action = event.get("action")
        
        self.send(text_data=json.dumps({
            "action": action if action else "Null",
            "message": message
        }))

    def send_self_channel_messages(self, message):
        async_to_sync(self.channel_layer.send)(self.channel_name, 
            {
                "type": "pong.log",
                "message": message
            })
        
    def get_or_create_new_room(self):
        player = self.user.player
        try:
            self.match_group, created = MatchGroup.objects.get_or_create(
                group_name=self.pong_match
            )
            if created:
                self.match_group.player = player
                async_to_sync(self.channel_layer.group_add)(
                    self.match_group.group_name, self.channel_name)
            else:
                self.match_group.opponent = player
                async_to_sync(self.channel_layer.group_add)(
                    self.match_group.group_name, self.channel_name)
                async_to_sync(self.channel_layer.group_send)(
                    self.match_group.group_name, 
                    {
                        'type': 'pong.log',
                        'action': 'full_lobby',
                        'message': {
                            'player': self.match_group.player.id,
                            'opponent': self.match_group.opponent.id
                        }
                    }
                )
            self.match_group.save()
        except Exception as e:
            print(f"# Something went wrong with creating_new_room: \n{e}")
        return