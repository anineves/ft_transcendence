from channels.middleware import BaseMiddleware
from rest_framework_simplejwt.tokens import AccessToken
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser

from accounts.models import PlayerChannel 
from asgiref.sync import async_to_sync


class JWTAuthMiddleware(BaseMiddleware):
    

    async def __call__(self, scope, receive, send):

        token = self.get_token_from_scope(scope)
        
        if token != None:
            user = await self.get_user_from_token(token) 
            scope['user'] = user
        else:
            scope['user'] = AnonymousUser()   
        return await super().__call__(scope, receive, send)

    def get_token_from_scope(self, scope):
        headers = dict(scope.get("headers", []))
        subprotocols = scope.get("subprotocols", [])
        if subprotocols:
            return subprotocols[0]
        
        auth_header = headers.get(b'authorization', b'').decode('utf-8')
        
        if auth_header.startswith('Bearer '):
            return auth_header.split(' ')[1]
        
        return None
        
    @database_sync_to_async
    def get_user_from_token(self, token):
            '''
            Check for user and is the token has expired.
            '''
            try:
                access_token = AccessToken(token)
                user_id = access_token['user_id']
                User = get_user_model()
                user = User.objects.get(id=user_id)
                return user
            except:
                return AnonymousUser()
            

def authenticate_user(token):

    try:
        access_token = AccessToken(token)
        user_id = access_token['user_id']
        User = get_user_model()
        user = User.objects.get(id=user_id)
        return user
    except:
        return None
    

def handle_authentication(obj, token):

    obj.user = authenticate_user(token)
    print(f"In handle auth: {obj.user}")
    if obj.user:
        try:
            player, created = PlayerChannel.objects.update_or_create(
                player=obj.user.player,
                defaults={'channel_name': obj.channel_name}
            )
            print("Created Channel")
            return obj.user
        except Exception as e:
            print(f"Exception: {e}")
    return None