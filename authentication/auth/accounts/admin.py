from django.contrib import admin
from .models import *


@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('email', 'username', 'is_active', \
                    'date_joined', 'otp', 'otp_agreement', 'id')


@admin.register(Player)
class PlayerAdmin(admin.ModelAdmin):
    list_display = ('nickname', 'id', 'created_at', 'user', 'status')
    ordering = ('nickname',)

    
@admin.register(FriendRequest)
class FriendRequestAdmin(admin.ModelAdmin):
    list_display = ('id', 'sender', 'invited')

@admin.register(MatchGroup)
class MatchGroupAdmin(admin.ModelAdmin):
    list_display = ('group_name', 'id', 'player', 'opponent', 'is_active')


admin.site.register(Game)
admin.site.register(Match)
admin.site.register(PlayerChannel)
admin.site.register(PrivateGroup)