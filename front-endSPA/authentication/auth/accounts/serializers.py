# serializers.py
from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import CustomUser, Player
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class UserRegisterSerializer(serializers.ModelSerializer):
    
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ['email', 'username', 'first_name', 'last_name', 'password', 'password2']
        extra_kwargs = {'password': {'write_only': True}}

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError("The passwords don't match")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password2')
        try:
            user = CustomUser.objects.create_user(
                email=validated_data['email'],
                username=validated_data['username'],
                first_name=validated_data.get('first_name', ''),
                last_name=validated_data.get('last_name', ''),
                password=validated_data['password']
            )
        except Exception as e:
            raise serializers.ValidationError({"error": str(e)})
        return user


class CustomeTokenObtainPairSerializer(TokenObtainPairSerializer):

    def validate(self, attrs):

        data = super().validate(attrs)
        data.update({
            'user': {
                'id': self.user.id,
                'email': self.user.email,
                'username': self.user.username,
                'first_name': self.user.first_name,
                'last_name': self.user.last_name,
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
                  'last_name', 'date_joined']

class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = ['id', 'nickname', 'created_at' ,'friendship']


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['first_name', 'last_name', 'username', 'email']
