# Generated by Django 5.0.7 on 2024-11-06 11:00

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0033_matchgroup_is_active'),
    ]

    operations = [
        migrations.AddField(
            model_name='customuser',
            name='ft_student',
            field=models.BooleanField(default=False),
        ),
    ]
