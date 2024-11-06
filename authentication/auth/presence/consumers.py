import json

from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync

from accounts.models import PlayerChannel, Player, PrivateGroup, MatchGroup, Tournament

from myproject.chat_config.jwt_middleware import handle_authentication

from rest_framework.exceptions import ValidationError


class ChatConsumer(WebsocketConsumer):


    def connect(self):

        self.global_chat = "global_chat"
        async_to_sync(self.channel_layer.group_add)(
            self.global_chat, self.channel_name
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
                    'message': {
                        'content': f"{self.user.player} left the chat"
                    }
                }
            )
        if close_code == 400:
            self.send_self_channel_messages("You must have a player to use this feature")
        return super().disconnect(close_code)

    def receive(self, text_data=None):
        data = json.loads(text_data)

        if data.get('Authorization'):
            print("Authorization")
            user = handle_authentication(self, data.get('Authorization'))
            print(f"Authorization User {user}")
            if user:
                async_to_sync(self.channel_layer.group_send)(
                    self.global_chat, 
                    {
                        'type': 'chat.message',
                        'message': {
                            'content': f"{self.user.player.nickname} has joined the chat"
                        }
                    }   
                )
                print(f"Return Authorized")
                return
            else:
                print(f"Return Not Authorized")
                return self.disconnect(400)
        
        if data.get('action') == "block" or data.get('action') == "unblock":
            return self.block_player(data.get('player'), data.get('action'))
        
        message = data["message"]
        sender = self.user.player
        if data.get("is_private"):
            self.handle_private_chat(data)
        else:
            async_to_sync(self.channel_layer.group_send)(
                self.global_chat, 
                {
                    "type": "chat.message",
                    "message": {
                        'content': f"{sender}: {message}",
                        "from_player": sender.id
                    }
                }
            )

    def chat_message(self, event):
        message = event["message"]
        action = event.get("action")
        self.send(text_data=json.dumps({
            "action": action if action else "Null",
            "message": message
        }))

    def handle_private_chat(self, data):
        message = data.get("message")
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
            async_to_sync(self.channel_layer.group_send)(   
                self.private_group.group_name,
                    {                
                        "type": "chat.message",
                        "action": "duel",
                        "message": {
                            'content': f"{self.user.player}: {message}",
                            "from_user": self.user.id,
                            "group_name": self.private_group.group_name
                        }
                    }
            )
        elif data.get("action") == "duel-snake":
            async_to_sync(self.channel_layer.group_send)(   
                self.private_group.group_name,
                    {                
                        "type": "chat.message",
                        "action": "duel-snake",
                        "message": {
                            'content': f"{self.user.player}: {message}",
                            "from_user": self.user.id,
                            "group_name": self.private_group.group_name
                        }
                    }
            )
        else:
            async_to_sync(self.channel_layer.group_send)(   
                self.private_group.group_name,
                    {                
                        "type": "chat.message",
                        "message": {
                            'content': f"{self.user.player}: {message}",
                            "from_player": self.user.player.id
                        }
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
                "action": "self_message",
                "message": {'content': message}
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
            if action == "block" and group_to_block.blocked == False:
                group_to_block.blocked = True
                group_to_block.blocked_id = player_to_block.id
            elif action == "unblock" and group_to_block.blocked_id != self.user.player.id:
                group_to_block.blocked = False
                group_to_block.blocked_id = None
            else:
                return self.send_self_channel_messages("Cannot block or unblock this user.")
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
        
        if close_code == 1001:
            self.match_group.is_active = False
            self.match_group.save()

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
        
        if data.get('action') == 'end_game':
            print("EndGame Pong")
            return self.disconnect(401)

        if data.get('action') == 'player_disconnect':
            message = data.get('message')
            async_to_sync(self.channel_layer.group_send)(
                self.match_group.group_name, 
                {
                    "type": "pong.log",
                    "action": data.get('action'),
                    "message": message
                }
            )

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
                if self.match_group.is_active == False:
                    raise ValidationError("A player was disconnected from the match.")
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
        except ValidationError as e:
            self.send_self_channel_messages("failed_match")
        return


class TournamentConsumer(WebsocketConsumer):
    tournament_players = []
    max_players = 2


    def connect(self):
        self.tournament_group_name = "tournament_group"
        async_to_sync(self.channel_layer.group_add)(
            self.tournament_group_name, self.channel_name
        )
        self.accept()

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(self.tournament_group_name, self.channel_name)

    def receive(self, text_data):
        data = json.loads(text_data)

        if data.get('action') == 'create_tournament':
            self.create_tournament()
        elif data.get('action') == 'join_tournament':
            player = data.get('player')  
            self.add_player_to_tournament(player)

    def create_tournament(self):
        TournamentConsumer.tournament_players.clear()
        async_to_sync(self.channel_layer.group_send)(
            self.tournament_group_name,
            {
                'type': 'created_tournament',
                'message': "Tournament created! Players can now join."
            }
        )
    

    def add_player_to_tournament(self, player):
        if player not in TournamentConsumer.tournament_players:
            TournamentConsumer.tournament_players.append(player)
            async_to_sync(self.channel_layer.group_send)(
                self.tournament_group_name,
                {
                    'type': 'tournament_message',
                    'message': f"{player['nickname']} joined the tournament."
                }
            )

        if len(TournamentConsumer.tournament_players) >= TournamentConsumer.max_players:
            self.start_tournament()

    def start_tournament(self):
        async_to_sync(self.channel_layer.group_send)(
            self.tournament_group_name,
            {
                'type': 'tournament_full',
                'message': "The tournament has started!",
                'participants': TournamentConsumer.tournament_players  
            }
        )

    def tournament_message(self, event):
        message = event['message']
        self.send(text_data=json.dumps({
            'action': 'tournament_message',
            'message': message
        }))

    def created_tournament(self, event):
        message = event['message']
        self.send(text_data=json.dumps({
            'action': 'created_tournament',
            'message': message
        }))

    def tournament_full(self, event):  
        message = event['message']
        participants = event['participants']  
        self.send(text_data=json.dumps({
            'action': 'tournament_full',
            'message': message,
            'participants': TournamentConsumer.tournament_players  
        }))


class SnakeConsumer(WebsocketConsumer):
    
    def connect(self):
        self.group_name = self.scope["url_route"]["kwargs"]["snake_match"]
        self.snake_match = f"snake_group_{self.group_name}"
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
            print(f"Called 401 (delete): {self.user.player} | {self.match_group} ")
            self.match_group.delete()

        if close_code == 1001:
            print(f"Called 1001 (save): {self.user.player} | {self.match_group} ")
            self.match_group.is_active = False
            self.match_group.save()
        
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

        if data.get('action') == 'end_game':
            print
            return self.disconnect(401)
    
        if data.get('action') == 'player_disconnect':
            message = data.get('message')
            async_to_sync(self.channel_layer.group_send)(
                self.match_group.group_name, 
                {
                    "type": "snake.log",
                    "action": data.get('action'),
                    "message": message
                }
        )
        elif data.get('action') != None:
            message = data.get('message')
            print(f"Calling random action {message}")
            async_to_sync(self.channel_layer.group_send)(
                self.match_group.group_name, 
                {
                    "type": "snake.log",
                    "action": data.get('action'),
                    "message": message
                }
            )

    def snake_log(self, event):
        message = event["message"]
        action = event.get("action")
        
        self.send(text_data=json.dumps({
            "action": action if action else "Null",
            "message": message
        }))

    def send_self_channel_messages(self, message):
        async_to_sync(self.channel_layer.send)(self.channel_name, 
            {
                "type": "snake.log",
                "message": message
            })
        
    def get_or_create_new_room(self):
        player = self.user.player
        try:
            self.match_group, created = MatchGroup.objects.get_or_create(
                group_name=self.snake_match
            )
            if created:
                print(f"Created -> Player:{player} - self.match_group: {self.match_group}")
                self.match_group.player = player
                async_to_sync(self.channel_layer.group_add)(
                    self.match_group.group_name, self.channel_name)
            else:
                if self.match_group.is_active == False:
                    raise ValidationError("A player was disconnected from the match.")
                self.match_group.opponent = player
                async_to_sync(self.channel_layer.group_add)(
                    self.match_group.group_name, self.channel_name)
                async_to_sync(self.channel_layer.group_send)(
                    self.match_group.group_name, 
                    {
                        'type': 'snake.log',
                        'action': 'full_lobby',
                        'message': {
                            'player': self.match_group.player.id,
                            'opponent': self.match_group.opponent.id
                        }
                    }
                )
            self.match_group.save()
        except ValidationError as e:
            print(f"ValidationError -> Error:{e} | Player: {player}")
            self.send_self_channel_messages("failed_match")
        return

class TournamentConsumerSnake(WebsocketConsumer):
    tournament_players = []
    max_players = 2

    def connect(self):
        self.tournament_group_name = "tournament_group_snake"
        async_to_sync(self.channel_layer.group_add)(
            self.tournament_group_name, self.channel_name
        )
        self.accept()

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(
            self.tournament_group_name, self.channel_name
        )

    def receive(self, text_data):
        data = json.loads(text_data)

        if data.get('action') == 'create_tournament_snake':
            self.create_tournament()
        elif data.get('action') == 'join_tournament_snake':
            player = data.get('player')  
            self.add_player_to_tournament_snake(player)

    def create_tournament(self):
        TournamentConsumerSnake.tournament_players.clear()
        async_to_sync(self.channel_layer.group_send)(
            self.tournament_group_name,
            {
                'type': 'created_tournament_snake', 
                'message': "Tournament created! Players can now join."
            }
        )

    def add_player_to_tournament_snake(self, player):
        if player not in TournamentConsumerSnake.tournament_players:
            TournamentConsumerSnake.tournament_players.append(player)
            async_to_sync(self.channel_layer.group_send)(
                self.tournament_group_name,
                {
                    'type': 'tournament_message_snake',
                    'message': f"{player['nickname']} joined the tournament."
                }
            )

        if len(TournamentConsumerSnake.tournament_players) >= TournamentConsumerSnake.max_players:
            self.start_tournament_snake()

    def start_tournament_snake(self):
        async_to_sync(self.channel_layer.group_send)(
            self.tournament_group_name,
            {
                'type': 'tournament_full_snake',
                'message': "The tournament has started!",
                'participants': TournamentConsumerSnake.tournament_players  
            }
        )

    def tournament_message_snake(self, event):
        message = event['message']
        self.send(text_data=json.dumps({
            'action': 'tournament_message_snake',
            'message': message
        }))

    def created_tournament_snake(self, event): 
        message = event['message']
        self.send(text_data=json.dumps({
            'action': 'created_tournament_snake',
            'message': message
        }))

    def tournament_full_snake(self, event): 
        message = event['message']
        participants = event['participants']  
        self.send(text_data=json.dumps({
            'action': 'tournament_full_snake',
            'message': message,
            'participants': participants  
        }))
