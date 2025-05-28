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
    '127.0.0.1'
]
SECRET_KEY = os.environ.get('SECRET_KEY', None)
if not SECRET_KEY:
    raise ValueError("SECRET_KEY is not set in the environment variables.")

# Production Security Settings
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 60*60*24*365  # 1 year in seconds
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

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
    "http://localhost:3000",
    "https://career-easy.com",
    "https://careereasy-frontend.vercel.app",
    "https://api.career-easy.com"
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

# Cookie settings
SESSION_COOKIE_SAMESITE = 'None'  # Required for cross-origin requests
CSRF_COOKIE_SAMESITE = 'None'     # Required for cross-origin requests
SESSION_COOKIE_DOMAIN = None      # Allow cookies for all domains
CSRF_COOKIE_DOMAIN = None         # Allow cookies for all domains
SESSION_COOKIE_SECURE = True      # Only send cookies over HTTPS
CSRF_COOKIE_SECURE = True         # Only send cookies over HTTPS

# Static and Media files
STATIC_ROOT = BASE_DIR / 'staticfiles'
MEDIA_ROOT = BASE_DIR / 'media'

DJANGO_CRYPTO_FIELDS_KEY_PATH = 'keys/'

print("The server is running in production mode")