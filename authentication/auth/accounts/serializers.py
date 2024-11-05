from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import CustomUser, Player, FriendRequest, Match
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.exceptions import ValidationError
from django.db.models import Q

import django.contrib.auth.password_validation as validators


class UserRegisterSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(write_only=True)
    avatar = serializers.ImageField(required=False, allow_null=True, use_url=True)

    class Meta:
        model = CustomUser
        fields = ['email', 'username', 'first_name', 'last_name', 
                  'password', 'password2', 'avatar', 'otp', 'otp_expiry_time']
        extra_kwargs = {
            'password': {'write_only': True},
            'avatar': {'required': False} 
        }

    def validate(self, attrs):
        password = attrs.get('password')
        try:
            validators.validate_password(password=password)
        except ValidationError as e:
            raise serializers.ValidationError("CustomValidation error")

        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError("The passwords don't match")
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2', None)
        avatar = validated_data.pop('avatar', None)
        password=validated_data['password']

        try:
            user = CustomUser.objects.create_user(
                email=validated_data['email'],
                username=validated_data['username'],
                first_name=validated_data.get('first_name', ''),
                last_name=validated_data.get('last_name', ''),
                password=validated_data['password'],
                avatar=avatar
            )
        except Exception as e:
            raise serializers.ValidationError({"error": str(e)})
        return user


class CustomeTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):

        user = authenticate(
            request=self.context['request'],
            email=attrs.get('email'),
            password=attrs.get('password'),
        )   

        data = super().validate(attrs)
        user = self.user

        if user is None:
            raise serializers.ValidationError('Invalid credentials', code='authorization')
        scheme = 'https'  # Force to https
        host = "10.12.3.5"  # Remove porta padrão 80 se estiver presente
        port = '8080'  # Defina a porta que deseja usar
        path = user.avatar.url if user.avatar else None # Caminho do arquivo
        absolute_url = f"{scheme}://{host}:{port}{path}"
        print("###################")
        print(absolute_url)
        data.update({
            'user': {
                'id': user.id,
                'email': user.email,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'avatar': absolute_url if user.avatar else None,
                'otp': user.otp_agreement
            }
        })
        return data


class UserSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'username', 'first_name', \
                  'last_name', 'avatar', 'date_joined', 'otp_agreement']
        read_only_fields = ['id', 'email', 'username', 'date_joined', 'otp']
        
    
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        request = self.context.get('request')
        if(instance.avatar and request):
            # Get the request's scheme and host
            scheme = 'https'  # Force to https
            host = request.get_host().replace(':80', '')  # Remove porta padrão 80 se estiver presente
            port = '8080'  # Defina a porta que deseja usar
            path = instance.avatar.url  # Caminho do arquivo
            absolute_url = f"{scheme}://{host}:{port}{path}"
        if instance.avatar and request:
            representation['avatar'] = absolute_url
        else:
            representation['avatar_url'] = None
        return representation
    

class PlayerSerializer(serializers.ModelSerializer):
    total_winner = serializers.IntegerField(read_only=True) 
    pong_winner = serializers.IntegerField(read_only=True)
    linha_winner = serializers.IntegerField(read_only=True)

    class Meta:
        model = Player
        fields = ['id', 'nickname', 'friendship', 'user', \
                  'created_at', 'total_winner', 'pong_winner', 'linha_winner', 'status']
        
        read_only_fields = ['id' ,'created_at', 'user']

    def create(self, validated_data):
        current_user = self.context.get('user')
        validated_data['user'] = current_user
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        instance.status=validated_data.get('status', instance.status)
        instance.save()
        return(instance)


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['first_name', 'last_name', 'username', 'email', 'avatar']


class FriendRequestSerializer(serializers.ModelSerializer):
    sender = serializers.StringRelatedField()
    invited = serializers.StringRelatedField()

    class Meta:
        model = FriendRequest
        fields = ['id', 'sender', 'invited', 'created_at']
        read_only_fields = ['id', 'sender', 'invited', 'created_at']

    def validate(self, attrs):

        sender = self.context['sender']
        invited = self.context['invited']

        if FriendRequest.objects.filter(
            (Q(sender__id=sender.id)) & (Q(invited__id=invited.id))
            | (Q(sender__id=invited.id)) & (Q(invited__id=sender.id))).exists():
            raise ValidationError({'Already Sent': 'You have already sent a friend request to this player.'})
        if sender.friends.filter(id=invited.id).exists():
            raise ValidationError({'Already Friends': 'You are already friend with this player.'})
        return super().validate(attrs)

    def create(self, validated_data):
        player = self.context['invited']
        invited = Player.objects.get(id=player.id)
        sender = self.context.get('sender')
        validated_data['sender'] = sender
        validated_data['invited'] = invited
        return super().create(validated_data)
    
class MatchSerializer(serializers.ModelSerializer):
    match_type = serializers.SerializerMethodField()

    class Meta:
        model = Match
        fields = ['id' ,'date', 'duration', 'game', 'players', 'winner_id', 'score', 'match_type']
        read_only_fields = ['id' ,'date']
    
    def create(self, validated_data):
        print("Dados:", validated_data)
        if 'match_type' not in validated_data:
            validated_data['match_type'] = self.initial_data.get('match_type') 
        return super().create(validated_data)

    def update(self, instance, validated_data):
        instance.winner_id=validated_data.get('winner_id', instance.winner_id)
        instance.score=validated_data.get('score', instance.score)
        instance.duration=validated_data.get('duration', instance.duration)
        instance.save()
        return instance
    
    def get_match_type(self, obj):
        return obj.get_match_type_display()