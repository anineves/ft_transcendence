# Generated by Django 5.0.7 on 2024-08-06 16:28

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0015_alter_customuser_avatar'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='player',
            name='avatar',
        ),
        migrations.CreateModel(
            name='FriendRequest',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('invited', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='invited', to='accounts.player')),
                ('sender', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sender', to='accounts.player')),
            ],
        ),
        migrations.DeleteModel(
            name='Friendship',
        ),
    ]
