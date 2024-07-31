# views.py
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from .models import CustomUser, Player
from .serializers import UserRegisterSerializer, UserSerializer, PlayerSerializer, CustomeTokenObtainPairSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.http import Http404
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken

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

# class UserLogin(viewsets.ViewSet):

#     def create(self, request):
#         serializer = UserLoginSerializer(data=request.data)
#         if serializer.is_valid():
#             user = serializer.validated_data['user']
#             return Response({'email': user.email, 'username': user.username, 'first_name': user.first_name, 'last_name': user.last_name, 'id': user.id}, status=status.HTTP_200_OK)
#         else:
#             print(serializer.errors)  
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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
                'last_name': user.last_name
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
            return Response(serializer.data)
        return Response(status=status.HTTP_400_BAD_REQUEST)


class PlayerList(APIView):

    def get(self, request):
        player = Player.objects.all()
        serializer = PlayerSerializer(player, many=True)
        return Response(serializer.data)


class PlayerDetail(APIView):
    
    def get(self, request, pk):
        try:
            player = Player.objects.get(id=pk)
            serializer = PlayerSerializer(player)
            return Response(serializer.data)
        except CustomUser.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)


# class UserUpdate(APIView):
#     permission_classes = [IsAuthenticated]

#     def put(self, request):
#         user = request.user
#         serializer = UserUpdateSerializer(user, data=request.data, partial=True)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)