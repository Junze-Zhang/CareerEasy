from . import employer_views
from django.urls import path

urlpatterns = [
    path('login', user_views.login),
    path('signup', user_views.sign_up),
    path('change_password', user_views.change_password),
]