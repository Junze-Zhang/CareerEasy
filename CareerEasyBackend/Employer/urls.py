from . import employer_views
from django.urls import path

urlpatterns = [
    path('login', employer_views.log_in),
    path('logout', employer_views.log_out),
    path('signup', employer_views.sign_up),
    path('updateprofile', employer_views.update_profile),
    path('updatepassword', employer_views.update_password),
    path('candidates', employer_views.get_candidates),
    path('query', employer_views.natural_language_query),
    path('rank', employer_views.get_ranked_candidates),
    path('jobs', employer_views.get_posted_jobs),
    path('company/<str:company_id>', employer_views.get_company),
    path('company/create', employer_views.create_company),
    path('search', employer_views.search_candidates),
    path('postjob', employer_views.post_job),
    path('me', employer_views.get_employer_info),
    path('candidate/<str:candidate_id>', employer_views.get_candidate_details)
]