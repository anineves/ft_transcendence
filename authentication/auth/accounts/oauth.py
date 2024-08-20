from django.contrib.auth.backends import BaseBackend
from django.contrib.auth import get_user_model
from rest_framework.serializers import ValidationError
import requests


class CustomOAuth2Backend(BaseBackend):
    def authenticate(self, request, code):
        token_url = 'https://api.intra.42.fr/oauth/token'
        user_info_url = 'https://api.intra.42.fr/v2/me'
        redirect_uri = 'http://localhost:8080/game-selection'
        token_response = requests.post(token_url, data={
            'grant_type': 'authorization_code',
            'client_id': 'u-s4t2ud-355d0e118e95085d20b1170e02ecadf3af3030e1ee913f299b9dacc50df1348f',
            'client_secret': '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',
            'code': code,
            'redirect_uri': redirect_uri,
        })
        
     
        if (token_response.status_code != 200):
            raise ValidationError("Post request got an error or response is None")
        
        token_json = token_response.json()

        access_token = token_json.get('access_token')
        
        user_info_response = requests.get(user_info_url, headers={
            'Authorization': f'Bearer {access_token}'
        })

        if 'application/json' in user_info_response.headers.get('Content-Type', ''):
            user_info = user_info_response.json()
        else:
            raise ValidationError("Unexpected content-type in user info response")

        email = user_info.get('email')
        username = user_info.get('login')
        first_name = user_info.get('first_name')
        last_name = user_info.get('last_name')
        avatar = user_info.get('image').get('link')
        
        User = get_user_model()
        user, created = User.objects.get_or_create(
            email=email,
            username = username,
            defaults={
                'first_name': first_name,
                'last_name': last_name,
                'avatar': avatar
            }
        )

        return user