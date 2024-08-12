# views.py
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from .models import CustomUser, Player, FriendRequest
from .serializers import UserRegisterSerializer, UserSerializer, PlayerSerializer, CustomeTokenObtainPairSerializer, FriendRequestSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.http import Http404
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
from django.shortcuts import redirect, render
import requests
import os

class UserRegister(viewsets.ViewSet):
    def create(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            try:
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except serializer.ValidationError as e:
                return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CustomTokenObtainPairView(TokenObtainPairView):
    
    serializer_class = CustomeTokenObtainPairSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        user = serializer.user
        refresh = RefreshToken.for_user(user)
        
        response_data = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'id': user.id,
                'email': user.email,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'avatar': request.build_absolute_uri(user.avatar.url) if user.avatar else None,
                'player': {
                    'nickname': user.player.nickname
                }
            },
        }
        return Response(response_data, status=status.HTTP_200_OK)


class UserInfo(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            'email': user.email,
            'username': user.username,
            'last_name': user.last_name,
        })


class UserList(APIView):

    def get(self, request):
        users = CustomUser.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)
    
    
class UserDetail(APIView):

    permission_classes = [IsAuthenticated]
    def get_object(self, pk):
        try:
            return CustomUser.objects.get(pk=pk)
        except CustomUser.DoesNotExist:
            raise Http404
        
    def get(self, request, pk):
        user = self.get_object(pk)
        serializer = UserSerializer(user)
        return Response(serializer.data)

    def put(self, request, pk):
        user = self.get_object(pk)
        serializer = UserSerializer(user, data=request.data)
        if serializer.is_valid():
            serializer.save()
            updated_user = UserSerializer(user, context={'request': request})
            return Response(updated_user.data)
        return Response(status=status.HTTP_400_BAD_REQUEST)


class PlayerList(APIView):

    def get(self, request):
        player = Player.objects.all()
        serializer = PlayerSerializer(player, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        serializer = PlayerSerializer(data=request.data, context={'user': request.user})
        if serializer.is_valid():
            try:
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except serializer.ValidationError as e:
                return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        

class PlayerDetail(APIView):
    
    def get(self, request, pk):
        try:
            player = Player.objects.get(id=pk)
            serializer = PlayerSerializer(player)
            return Response(serializer.data)
        except CustomUser.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        

class SendFriendRequestList(APIView):

    def get(self, request):
        friend_request = FriendRequest.objects.all()
        serializer = FriendRequestSerializer(friend_request, many=True)
        # print(f"Serializer: {serializer.data}")
        return Response(serializer.data)
    

class SendFriendRequest(APIView):

    def post(self, request, pk):
        from_user = request.user.player
        to_user = Player.objects.get(id=pk)
        from_serializer = PlayerSerializer(from_user)
        to_serializer = PlayerSerializer(to_user)
        # print(f"From User: {from_user}")
        # print(f"To User: {to_user}")
        # print(f"From Serialized User: {from_serializer.data}")
        # print(f"TO Serialized User: {to_serializer.data}")
        return Response(to_serializer.data)

def intra42_login(request):
    client_id = os.getenv('CLIENT_ID')
    redirect_uri = "http://localhost:8080/game-selection"
    url = f'https://api.intra.42.fr/oauth/authorize?client_id={client_id}&redirect_uri={redirect_uri}&response_type=code'
    return redirect(url)

def intra42_callback(request):
    code = request.GET.get('code')
    client_id = os.getenv('CLIENT_ID')
    client_secret = os.getenv('ClIENT_SECRET')
    redirect_uri = "http://localhost:8080/game-selection"
    token_url = 'https://api.intra.42.fr/oauth/token'
    data = {
        'grant_type': 'authorization_code',
        'client_id': client_id,
        'client_secret': client_secret,
        'code': code,
        'redirect_uri': redirect_uri,
    }

    response = request.post(token_url, data=data)
    response_data = response.json()
    access_token = response_data.get('access_token')

    user_info_url = 'https://api.intra.42.fr/v2/me'
    headers = {'Authorization': f'Bearer {access_token}'}
    user_response = requests.get(user_info_url, headers=headers)
    user, created = user.objects.get_or_create(username=user_data['login'])
    user.username = user_data['username']
    user.first_name = user_data['first_name']
    user.last_name = user_data['last_name']
    user.email = user_data['email']
    user.save()
    user_data = user_response.json()

    return render(request, 'login_success.html', {'access_token': access_token})