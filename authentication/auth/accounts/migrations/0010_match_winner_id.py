# Generated by Django 5.0.7 on 2024-07-29 17:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0009_alter_player_avatar'),
    ]

    operations = [
        migrations.AddField(
            model_name='match',
            name='winner_id',
            field=models.IntegerField(default=1),
            preserve_default=False,
        ),
    ]
