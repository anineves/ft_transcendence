from django.contrib.auth.backends import BaseBackend
from django.contrib.auth import get_user_model
from rest_framework.serializers import ValidationError
import requests
import os
from django.db import IntegrityError


class CustomOAuth2Backend(BaseBackend):
    def authenticate(self, request, code):
        host = os.getenv('MAIN_HOST', 0)
        token_url = 'https://api.intra.42.fr/oauth/token'
        user_info_url = 'https://api.intra.42.fr/v2/me'
        redirect_uri = f'https://{host}:8443/game-selection'

        token_response = requests.post(token_url, data={
            'grant_type': 'authorization_code',
            'client_id': os.getenv('CLIENT_ID'),
            'client_secret': os.getenv('CLIENT_SECRET'),
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

        try:
            user, created = User.objects.get_or_create(
                email=email,
                ft_student = True,
                defaults={
                    'username': username,
                    'first_name': first_name,
                    'last_name': last_name,
                    'avatar': avatar
                }
            )
        except IntegrityError as e:
            raise ValidationError({"Email already exists."})
        return user