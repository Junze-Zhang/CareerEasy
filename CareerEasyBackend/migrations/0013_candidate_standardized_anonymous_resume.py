# Generated by Django 5.2 on 2025-05-23 00:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('CareerEasyBackend', '0012_alter_candidate_resume_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='candidate',
            name='standardized_anonymous_resume',
            field=models.TextField(blank=True, null=True),
        ),
    ]
