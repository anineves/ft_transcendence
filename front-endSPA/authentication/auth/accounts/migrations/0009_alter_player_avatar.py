# Generated by Django 5.0.7 on 2024-07-26 16:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0008_alter_player_avatar'),
    ]

    operations = [
        migrations.AlterField(
            model_name='player',
            name='avatar',
            field=models.ImageField(blank=True, null=True, upload_to=''),
        ),
    ]
