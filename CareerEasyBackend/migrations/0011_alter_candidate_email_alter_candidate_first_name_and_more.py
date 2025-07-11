# Generated by Django 5.2 on 2025-05-22 14:47

import django_crypto_fields.fields.encrypted_char_field
import django_crypto_fields.fields.encrypted_text_field
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('CareerEasyBackend', '0010_candidate_anonymous_resume'),
    ]

    operations = [
        migrations.AlterField(
            model_name='candidate',
            name='email',
            field=django_crypto_fields.fields.encrypted_char_field.EncryptedCharField(blank=True, help_text=' (Encryption: RSA local)', max_length=71, null=True),
        ),
        migrations.AlterField(
            model_name='candidate',
            name='first_name',
            field=django_crypto_fields.fields.encrypted_char_field.EncryptedCharField(blank=True, help_text=' (Encryption: RSA local)', max_length=100),
        ),
        migrations.AlterField(
            model_name='candidate',
            name='last_name',
            field=django_crypto_fields.fields.encrypted_char_field.EncryptedCharField(blank=True, help_text=' (Encryption: RSA local)', max_length=100),
        ),
        migrations.AlterField(
            model_name='candidate',
            name='middle_name',
            field=django_crypto_fields.fields.encrypted_char_field.EncryptedCharField(blank=True, help_text=' (Encryption: RSA local)', max_length=100, null=True),
        ),
        migrations.AlterField(
            model_name='candidate',
            name='profile_pic',
            field=django_crypto_fields.fields.encrypted_char_field.EncryptedCharField(blank=True, help_text=' (Encryption: RSA local)', max_length=71, null=True),
        ),
        migrations.AlterField(
            model_name='candidate',
            name='resume',
            field=django_crypto_fields.fields.encrypted_char_field.EncryptedCharField(blank=True, help_text=' (Encryption: RSA local)', max_length=71, null=True),
        ),
        migrations.AlterField(
            model_name='candidate',
            name='standardized_resume',
            field=django_crypto_fields.fields.encrypted_char_field.EncryptedCharField(blank=True, help_text=' (Encryption: RSA local)', max_length=71, null=True),
        ),
        migrations.AlterField(
            model_name='query',
            name='query',
            field=django_crypto_fields.fields.encrypted_text_field.EncryptedTextField(blank=True, help_text=' (Encryption: AES local)', max_length=71),
        ),
        migrations.AlterField(
            model_name='query',
            name='standardized_query',
            field=django_crypto_fields.fields.encrypted_text_field.EncryptedTextField(blank=True, help_text=' (Encryption: AES local)', max_length=71),
        ),
    ]
