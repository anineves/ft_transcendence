from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.core.validators import FileExtensionValidator
from django.utils.translation import gettext_lazy as _


class CustomUserManager(BaseUserManager):
    def create_user(self, email, username, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        print(f"Senha hasheada2: {password}")
        return self.create_user(email, username, password, **extra_fields)


class CustomUser(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=30, unique=True)
    first_name = models.CharField(max_length=30, blank=True)
    last_name = models.CharField(max_length=30, blank=True)
    date_joined = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    avatar = models.ImageField(height_field=None, width_field=None, null=True, blank=True)

    otp = models.CharField(max_length=6, blank=True)
    otp_agreement = models.BooleanField(default=False)
    otp_expiry_time = models.DateTimeField(blank=True, null=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email


class Player(models.Model):
    class OnlineStatus(models.TextChoices):
        ONLINE = "ON", _("Online")
        OFFLINE = "OF", _("Offline")

    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    nickname = models.CharField(max_length=15, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    friendship = models.ManyToManyField('self', symmetrical=False, blank=True, related_name="friends")
    status = models.CharField(max_length=2, choices=OnlineStatus, default=OnlineStatus.OFFLINE)

    def __str__(self):
        return self.nickname


class FriendRequest(models.Model):

    sender = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='sender')
    invited = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='invited')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender.nickname} and {self.invited.nickname}"


class Game(models.Model):

    name = models.CharField(max_length=15)
    version = models.CharField(max_length=15)

    def __str__(self):
        return self.name


class Match(models.Model):
    class MatchType(models.TextChoices):
        AI = "AI", ("AI")
        REMOTE = "RM", ("Remote")
        PVP = "MP", ("Player vs Player")
        TORN = "TN", ("Tournament")
        THREE = "3D", ("3D-Player vs Player")
    date = models.DateTimeField(auto_now_add=True)
    duration = models.DurationField(null=True, blank=True)
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='game')
    players = models.ManyToManyField(Player, related_name='players')
    winner_id = models.IntegerField(null=True, blank=True)
    score = models.CharField(max_length=5, null=True, blank=True)
    match_type = models.CharField(max_length=2, choices=MatchType, null=True)

    def get_winner(self):
        try:
            winner = self.players.get(id=self.winner_id)
            return winner
        except:
            return None

    def __str__(self):        
        return f"{self.game}: {self.date} -- {self.get_winner()}"
    

class PlayerChannel(models.Model):

    channel_name = models.CharField(max_length=125)
    player = models.OneToOneField(Player, on_delete=models.CASCADE, related_name="player_channel")

    def __str__(self):        
        return f"{self.player} channel_name: {self.channel_name}"
    

class PrivateGroup(models.Model):
    id = models.IntegerField(unique=True, primary_key=True)
    group_name = models.CharField(max_length=255, unique=True)
    blocked = models.BooleanField(default=False)
    players = models.ManyToManyField(Player, related_name="players_group")
    blocked_id = models.IntegerField(default=None, null=True)

    def __str__(self):        
        return f"{self.group_name}"
    

class MatchGroup(models.Model):
    group_name = models.CharField(max_length=255, unique=True)
    player = models.ForeignKey(Player, on_delete=models.CASCADE, null=True, related_name="player")
    opponent = models.ForeignKey(Player, on_delete=models.CASCADE, null=True, related_name="opponent")
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.group_name}"


class Tournament(models.Model):
    name = models.CharField(max_length=50)
    game = models.ForeignKey(Game, on_delete=models.CASCADE)
    max_players = models.IntegerField(default=4) 
    players = models.ManyToManyField(Player, related_name='tournament_players')
    is_active = models.BooleanField(default=True)
    winner = models.ForeignKey(Player, null=True, blank=True, on_delete=models.SET_NULL, related_name='tournament_winner')
    created_at = models.DateTimeField(auto_now_add=True)

    def add_player(self, player):
        if self.players.count() < self.max_players and player not in self.players.all():
            self.players.add(player)
            return True
        return False

    def start_tournament(self):
        if self.players.count() == self.max_players:
            self.is_active = False
            return True
        return False

    def set_winner(self, player):
        if player in self.players.all():
            self.winner = player
            self.is_active = False
            self.save()

    def __str__(self):
        return f"Tournament: {self.name} - Game: {self.game} - Winner: {self.winner if self.winner else 'TBD'}"