from .serializers import *
from .models import CustomUser, Player, FriendRequest
from django.http import Http404
from django.db.models import Count, Q
from rest_framework.views import APIView
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.serializers import ValidationError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView


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
    Send friend request from logged in player to player.id (pk) in the URL.
    '''
    permission_classes = [IsAuthenticated]
    def post(self, request, pk):
        sender = request.user.player
        if sender.id == pk:
            return Response(data={'You cannot invite yourself'}, 
                            status=status.HTTP_403_FORBIDDEN)
        
        serializer = FriendRequestSerializer(
            data=request.data, 
            context={
                'sender': sender, 
                'invited': pk
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

