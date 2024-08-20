# Generated by Django 5.0.7 on 2024-08-20 18:52

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0020_alter_match_players'),
    ]

    operations = [
        migrations.AddField(
            model_name='match',
            name='score',
            field=models.CharField(blank=True, max_length=5, null=True),
        ),
        migrations.AlterField(
            model_name='match',
            name='date',
            field=models.DateTimeField(auto_now_add=True),
        ),
        migrations.AlterField(
            model_name='match',
            name='duration',
            field=models.DurationField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='match',
            name='game',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='game', to='accounts.game'),
        ),
        migrations.AlterField(
            model_name='match',
            name='winner_id',
            field=models.IntegerField(blank=True, null=True),
        ),
    ]
