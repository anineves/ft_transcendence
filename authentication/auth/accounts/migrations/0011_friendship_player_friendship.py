# Generated by Django 5.0.7 on 2024-07-29 20:49

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0010_match_winner_id'),
    ]

    operations = [
        migrations.CreateModel(
            name='Friendship',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('invited', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='invited', to='accounts.player')),
                ('sender', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sender', to='accounts.player')),
            ],
        ),
        migrations.AddField(
            model_name='player',
            name='friendship',
            field=models.ManyToManyField(through='accounts.Friendship', to='accounts.player'),
        ),
    ]
