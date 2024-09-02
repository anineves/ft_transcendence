from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import CustomUser, Player, FriendRequest, Match
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.exceptions import ValidationError
from django.db.models import Q


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
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError("The passwords don't match")
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2', None)
        avatar = validated_data.pop('avatar', None)
        
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
    #TODO: Set player to choose if wants to use OTP or not
    #TODO: Set time to refresh code
    def validate(self, attrs):
        otp = self.context['request'].data.get('otp', None)

        user = authenticate(
            request=self.context['request'],
            email=attrs.get('email'),
            password=attrs.get('password'),
        )   

        if user is None or user.otp != otp:
            raise serializers.ValidationError('Invalid credentials or OTP', code='authorization')

        data = super().validate(attrs)
        user = self.user  # Retrieve the user object

        data.update({
            'user': {
                'id': user.id,
                'email': user.email,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'avatar': self.context['request'].build_absolute_uri(user.avatar.url) if user.avatar else None
            }
        })
        return data


class UserSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'username', 'first_name', \
                  'last_name', 'avatar', 'date_joined']
        read_only_fields = ['id', 'email', 'username', 'date_joined']
        
    
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        request = self.context.get('request')
        if instance.avatar and request:
            representation['avatar_url'] = request.build_absolute_uri(instance.avatar.url)
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
                  'created_at', 'total_winner', 'pong_winner', 'linha_winner']
        
        read_only_fields = ['id' ,'created_at', 'user']

    def create(self, validated_data):
        current_user = self.context.get('user')
        validated_data['user'] = current_user
        return super().create(validated_data)


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
    class Meta:
        model = Match
        fields = ['id' ,'date', 'duration', 'game', 'players', 'winner_id', 'score']
        read_only_fields = ['id' ,'date']
    
    def update(self, instance, validated_data):
        instance.winner_id=validated_data.get('winner_id', instance.winner_id)
        instance.score=validated_data.get('score', instance.score)
        instance.duration=validated_data.get('duration', instance.duration)
        instance.save()
        return instance