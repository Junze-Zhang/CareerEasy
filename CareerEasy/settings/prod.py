from .base import *
from dotenv import load_dotenv
import os

load_dotenv(BASE_DIR / 'credentials.env')

DEBUG = False
ALLOWED_HOSTS = [
    'api.career-easy.com',
    'career-easy.com',
    'www.career-easy.com',
    'localhost',
    '127.0.0.1',
    '15.223.47.120'
]
SECRET_KEY = os.environ.get('SECRET_KEY', None)
if not SECRET_KEY:
    raise ValueError("SECRET_KEY is not set in the environment variables.")

# Local deployment - disable SSL redirects but keep other security
SECURE_SSL_REDIRECT = False
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False
SECURE_HSTS_SECONDS = 0
SECURE_HSTS_INCLUDE_SUBDOMAINS = False

SECURE_HSTS_PRELOAD = False
# SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')  # Commented out for local

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'careereasy_db',
        'USER': 'postgres',
        'PASSWORD': os.environ.get('POSTGRES_PWD', ''),
        'HOST': os.environ.get('POSTGRES_HOST', 'localhost'),
        'PORT': '5432',
    }
}

# CORS settings
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    "https://www.career-easy.com",
    "https://career-easy.com",
    "https://careereasy-frontend.vercel.app",
    "https://api.career-easy.com",
    "http://localhost:3000",  # (optional, for local dev)
]
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# Cookie settings for local deployment
SESSION_COOKIE_SAMESITE = 'Lax'  # Changed from 'None' for local
CSRF_COOKIE_SAMESITE = 'Lax'     # Changed from 'None' for local
# SESSION_COOKIE_DOMAIN = ".career-easy.com"  # Commented out for local
# CSRF_COOKIE_DOMAIN = ".career-easy.com"     # Commented out for local
SESSION_COOKIE_SECURE = False     # Allow cookies over HTTP for local
CSRF_COOKIE_SECURE = False        # Allow cookies over HTTP for local

# Static and Media files
STATIC_ROOT = BASE_DIR / 'staticfiles'
MEDIA_ROOT = BASE_DIR / 'media'

DJANGO_CRYPTO_FIELDS_KEY_PATH = 'keys/'

print("The server is running in production mode")