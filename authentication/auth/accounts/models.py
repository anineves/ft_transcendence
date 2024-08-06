from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.core.validators import FileExtensionValidator

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

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email


class Player(models.Model):

    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    nickname = models.CharField(max_length=15)
    created_at = models.DateTimeField(auto_now_add=True)
    friendship = models.ManyToManyField('self', symmetrical=False, blank=True, related_name="friends")

    def __str__(self):
        return self.nickname


class FriendRequest(models.Model):

    # Add status choices: (Sent, Accepted, declined)

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

    date = models.DateTimeField(auto_now=False)
    duration = models.DurationField()
    game = models.ForeignKey(Game, on_delete=models.CASCADE)
    players = models.ManyToManyField(Player)
    winner_id = models.IntegerField()

    def get_winner(self):
        winner = self.players.get(id=self.winner_id)
        return winner

    def __str__(self):        
        return f"{self.game}: {self.date} -- {self.get_winner()}"