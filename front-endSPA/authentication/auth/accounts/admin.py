# accounts/admin.py
from django.contrib import admin
from .models import CustomUser, Player, Match, Game, Friendship

@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('email', 'username', 'is_active', 'date_joined', 'id')

@admin.register(Player)
class PlayerAdmin(admin.ModelAdmin):
    list_display = ('nickname', 'id', 'status', 'created_at')
    ordering = ('nickname',)

admin.site.register(Match)
admin.site.register(Game)
admin.site.register(Friendship)
