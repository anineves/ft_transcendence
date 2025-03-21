# Generated by Django 5.0.7 on 2024-09-01 19:21

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0022_playerchannel'),
    ]

    operations = [
        migrations.CreateModel(
            name='PrivateGroup',
            fields=[
                ('id', models.IntegerField(primary_key=True, serialize=False, unique=True)),
                ('group_name', models.CharField(max_length=255, unique=True)),
                ('blocked', models.BooleanField(default=False)),
                ('players', models.ManyToManyField(related_name='players_group', to='accounts.player')),
            ],
        ),
    ]
