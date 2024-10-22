from .serializers import *
from .models import CustomUser, Player, FriendRequest, Match
from django.http import Http404
from django.db.models import Count, Q
from rest_framework.views import APIView
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.permissions import IsAuthenticated
from rest_framework.serializers import ValidationError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.shortcuts import redirect
from django.contrib.auth import authenticate
import os

import random
from datetime import timedelta
from django.utils import timezone
from django.core.mail import send_mail


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


def generate_random_digits(len):
    return "".join(map(str, random.sample(range(0, 10), len)))


class OneTimePasswordLogin(APIView):

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        user = authenticate(request, email=email, password=password)

        if user is not None:
            verification_token = generate_random_digits(len=6)
            user.otp_agreement = True
            user.otp = verification_token
            user.otp_expiry_time = timezone.now() + timedelta(hours=1)
            user.save()

            send_mail(
                'Verification Code',
                f'Your verification code is: {verification_token}',
                'from@transcendence.com',
                [user.email],
                fail_silently=False,
            )

            return Response(
                {'detail': 'Verification code sent successfully.'},
                status=status.HTTP_200_OK
            )
        return Response({'detail': "Invalid Credentials"})


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
            }
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

    permission_classes = [IsAuthenticated]
    def get(self, request):
        player = Player.objects.all()
        serializer = PlayerSerializer(player, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
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
    
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        try:
            player = Player.objects.annotate(
                total_winner=Count('players', filter=Q(players__winner_id=pk)),
                pong_winner=Count('players', filter=Q(players__winner_id=pk, players__game__name='Pong')),
                linha_winner=Count('players', filter=Q(players__winner_id=pk, players__game__name='Quatro Em Linha')),
            ).get(id=pk)
            serializer = PlayerSerializer(player)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Player.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
    def put(self, request, pk):
        try:
            player = Player.objects.get(id=pk)
        except Player.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        
        serializer = PlayerSerializer(
            player,
            data=request.data,
            partial=True
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    def put(self, request, pk):
        try:
            player = Player.objects.get(id=pk)
        except Player.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        
        serializer = PlayerSerializer(
            player,
            data=request.data,
            partial=True
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            

class FriendRequestList(APIView):
    '''
    Get all requests sent to or by player logged in.
    '''
    permission_classes = [IsAuthenticated]
    def get(self, request):
        friend_request = FriendRequest.objects.filter(
            Q(sender=request.user.player) | Q(invited=request.user.player)
        ).select_related('sender', 'invited')

        serializer = FriendRequestSerializer(friend_request, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    
class SendFriendRequest(APIView):
    '''
    Send friend request from logged in player to player nickname in the URL.
    '''
    permission_classes = [IsAuthenticated]
    def post(self, request, nickname):
        sender = request.user.player
        invited = Player.objects.prefetch_related('friends').get(nickname=nickname)

        if sender == invited:
            return Response(data={'You cannot invite yourself'}, 
                            status=status.HTTP_403_FORBIDDEN)

        serializer = FriendRequestSerializer(
            data=request.data, 
            context={
                'sender': sender, 
                'invited': invited
                })
        
        if serializer.is_valid():
            try:
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except ValidationError as e:
                raise Response(e.detail, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class RespondFriendRequest(APIView):

    permission_classes = [IsAuthenticated]
    def post(self, request, pk):
        invited_player = request.user.player
        try:
            friend_request = FriendRequest.objects.select_related(
                'sender', 
                'invited'
            ).get(id=pk)
        except:
            raise Http404('Friend Request was not found')
        if friend_request.invited == invited_player:
            invited_player.friends.add(friend_request.sender)
            friend_request.sender.friends.add(invited_player)
            friend_request.delete()
            return Response(data={'Friend request accepted'}, status=status.HTTP_204_NO_CONTENT)
        else:
            return Response(data={'Not allowed'}, status=status.HTTP_403_FORBIDDEN)


# Tem que sair daqui
def oauth_login(request):
    authorization_url = 'https://api.intra.42.fr/oauth/authorize'
    redirect_uri = 'http://localhost:8080/game-selection' 
    client_id = os.getenv('CLIENT_ID')
    
    return redirect(f'{authorization_url}?client_id={client_id}&redirect_uri={redirect_uri}&response_type=code')


# Tem que sair daqui
@api_view(['POST'])
def oauth_callback(request):
    code = request.data.get('code')
    
    try:
        user = authenticate(request, code=code)
    except ValidationError as e:
        return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)
    
    if user is not None:
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
        avatar_url = user.avatar.url.replace('/media/https%3A/', 'https://')

        response_data = {
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'avatar': avatar_url,
            }
        }
        return Response(response_data, status=status.HTTP_201_CREATED)
    else:
        return Response(data='Authentication failed', status=status.HTTP_400_BAD_REQUEST)


#Matches
class MatchList(APIView):

    def get(self, request):
        matches = Match.objects.all()
        serializer = MatchSerializer(
            matches, many=True
        )
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request):
        print("Dados recebidos no POST:", request.data) 
        serializer = MatchSerializer(
            data=request.data
        )
        if serializer.is_valid():
            try:
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except ValidationError as e:
                raise Response(e.detail, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class MatchDetail(APIView):
    
    def get(self, request, pk):
        match = Match.objects.get(id=pk)
        serializer = MatchSerializer(
            match
        )
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def put(self, request, pk):
        match = Match.objects.get(id=pk)
        serializer = MatchSerializer(
            match,
            data = request.data,
            partial = True
        )
        if serializer.is_valid():
            try:
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            except ValidationError as e:
                raise Response(e.detail, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

