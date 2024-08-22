# remote/serializers.py
from rest_framework import serializers
from .models import MatchInvite

class MatchInviteSerializer(serializers.ModelSerializer):
    class Meta:
        model = MatchInvite
        fields = ['id', 'receiver', 'accepted']
