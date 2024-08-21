import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import GameSession, Invitation

class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'game_{self.room_name}'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        action = text_data_json['action']

        if action == 'invite':
            await self.handle_invite(text_data_json)
        elif action == 'join':
            await self.handle_join(text_data_json)
        elif action == 'message':
            await self.handle_message(text_data_json)

    async def handle_invite(self, data):
        # Process invitation logic here
        sender = data['sender']
        recipient = data['recipient']
        game_mode = data['game_mode']
        await database_sync_to_async(self.save_invitation)(sender, recipient, game_mode)

    async def handle_join(self, data):
        # Process join logic here
        room_name = data['room_name']
        await self.channel_layer.group_send(
            f'game_{room_name}',
            {
                'type': 'game_start',
                'message': 'A new player has joined the game.'
            }
        )

    async def handle_message(self, data):
        message = data['message']

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message
            }
        )

    async def chat_message(self, event):
        message = event['message']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message
        }))

    @database_sync_to_async
    def save_invitation(self, sender, recipient, game_mode):
        Invitation.objects.create(sender=sender, recipient=recipient, game_mode=game_mode)
