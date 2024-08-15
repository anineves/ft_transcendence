from django.contrib.auth.backends import BaseBackend
from django.contrib.auth import get_user_model
import requests


class CustomOAuth2Backend(BaseBackend):
    def authenticate(self, request, code=None):
        token_url = 'https://api.intra.42.fr/oauth/token'
        user_info_url = 'https://api.intra.42.fr/v2/me'
        redirect_uri = 'http://127.0.0.1:8000/oauth/callback/'
        # Set Client_ID and Secret in .env
        token_response = requests.post(token_url, data={
            'grant_type': 'authorization_code',
            'client_id': 'u-s4t2ud-84f82297edeb244de73ec702342aa78c84ff40652725da6e93f949ed9eefd222',
            'client_secret': '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',
            'code': code,
            'redirect_uri': redirect_uri,
        })
        
        if (token_response.status_code != 200):
            raise ValueError("post request got an error or response is None")
            
        token_json = token_response.json()
        access_token = token_json.get('access_token')
        
        user_info_response = requests.get(user_info_url, headers={
            'Authorization': f'Bearer {access_token}'
        })
        
        if 'application/json' in user_info_response.headers.get('Content-Type', ''):
            user_info = user_info_response.json()
        else:
            raise ValueError("Unexpected content-type in user info response")

        email = user_info.get('email')
        username = user_info.get('login')
        first_name = user_info.get('first_name')
        last_name = user_info.get('last_name')
        avatar = user_info.get('image').get('link')
        
        User = get_user_model()
        user, created = User.objects.get_or_create(
            email=email,
            username = username,
            first_name = first_name,
            last_name = last_name,
            avatar = avatar
        )
        
        return user