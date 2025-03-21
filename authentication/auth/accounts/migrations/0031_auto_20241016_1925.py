# Generated by Django 5.0.7 on 2024-10-16 19:25

from django.db import migrations


def create_bot_player(apps, schema_editor):
        User = apps.get_model("accounts", "CustomUser")
        user_bot = User.objects.create(
            email="bot@bot.com",
            username="bot"
        )
        Player = apps.get_model("accounts", "Player")
        player_bot = Player.objects.create(
            user=user_bot,
            nickname="bot"
        )

def create_games(apps, schema_editor):
        Game = apps.get_model("accounts", "Game")
        games = Game.objects.bulk_create(
            [
                Game(name="Pong", version="1.0"),
                Game(name="Snake", version="1.0"),
            ]
        )
        # pong = Game.objects.create(
        #     id=1,
        #     name="Pong",
        #     version="1.0"
        # )
        # snake = Game.objects.create(
        #     id=2,
        #     name="Snake",
        #     version="1.0"
        # )

class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0030_alter_match_match_type'),
    ]

    operations = [
        migrations.RunPython(create_bot_player),
        migrations.RunPython(create_games),
    ]
