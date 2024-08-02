# serializers.py
from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import CustomUser, Player
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class UserRegisterSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(write_only=True)
    avatar = serializers.ImageField(required=False, allow_null=True, use_url=True)

    class Meta:
        model = CustomUser
        fields = ['email', 'username', 'first_name', 'last_name', 'password', 'password2', 'avatar']
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

    def validate(self, attrs):
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


# class UserLoginSerializer(serializers.Serializer):
#     email = serializers.EmailField()
#     password = serializers.CharField(write_only=True)

#     def validate(self, data):
#         email = data.get('email')
#         password = data.get('password')

#         if email and password:
#             user = authenticate(request=self.context.get('request'), email=email, password=password)
#             if not user:
#                 raise serializers.ValidationError("Invalid email or password")
#         else:
#             raise serializers.ValidationError("Must include email and password")

#         data['user'] = user
#         return data


class UserSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'username', 'first_name', \
                  'last_name', 'avatar', 'date_joined']
    
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        request = self.context.get('request')
        if instance.avatar and request:
            representation['avatar_url'] = request.build_absolute_uri(instance.avatar.url)
        else:
            representation['avatar_url'] = None
        return representation
    

class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = ['id', 'nickname', 'created_at' ,'friendship', 'status']


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['first_name', 'last_name', 'username', 'email', 'avatar']
