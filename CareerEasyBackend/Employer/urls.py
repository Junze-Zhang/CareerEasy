from . import employer_views
from django.urls import path

urlpatterns = [
    path('login', employer_views.log_in),
    path('logout', employer_views.log_out),
    path('signup', employer_views.sign_up),
    path('updateprofile', employer_views.update_profile),
    path('updatepasswored', employer_views.update_password),
    path('jobs', employer_views.get_posted_jobs),
    path('mycompany', employer_views.get_company),
    path('search', employer_views.search_candidates),
    path('postjob', employer_views.post_job)
]