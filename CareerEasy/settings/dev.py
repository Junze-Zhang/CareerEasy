from .base import *
from dotenv import load_dotenv
import os

result = load_dotenv('credentials.env')
if not result:
    raise ValueError("Failed to load environment variables from: 'credentials.env'")


DEBUG = True
ALLOWED_HOSTS = ['localhost', '127.0.0.1']
SECRET_KEY = os.environ.get('SECRET_KEY', None)
if not SECRET_KEY:
    raise ValueError("SECRET_KEY is not set in the environment variables.")

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'careereasy_db',
        'USER': 'postgres',
        'PASSWORD': os.environ.get('POSTGRES_PWD', ''),
        'HOST': 'localhost',
        'PORT': '5432',
    }
}


CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://career-easy.com",
]

# # Development-specific HTTPS settings
# SECURE_SSL_REDIRECT = False  # Don't redirect to HTTPS in development
# SESSION_COOKIE_SECURE = False  # Allow cookies over HTTP in development
# CSRF_COOKIE_SECURE = False  # Allow CSRF cookies over HTTP in development
# SECURE_HSTS_SECONDS = 0  # Disable HSTS in development
# SECURE_HSTS_INCLUDE_SUBDOMAINS = False
# SECURE_HSTS_PRELOAD = False

# AUTO_CREATE_KEYS=True
DJANGO_CRYPTO_FIELDS_KEY_PATH = 'keys/'

# Security Settings
SECURE_SSL_REDIRECT = False
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False
SECURE_HSTS_SECONDS = 0
SECURE_HSTS_INCLUDE_SUBDOMAINS = False
SECURE_HSTS_PRELOAD = False

print("The server is running in development mode")