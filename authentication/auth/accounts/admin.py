# accounts/admin.py
from django.contrib import admin
from .models import CustomUser, Player, Match, Game, FriendRequest


@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('email', 'username', 'is_active', 'date_joined', 'id')


@admin.register(Player)
class PlayerAdmin(admin.ModelAdmin):
    list_display = ('nickname', 'id', 'created_at', 'user')
    ordering = ('nickname',)


admin.site.register(Match)
admin.site.register(Game)
admin.site.register(FriendRequest)