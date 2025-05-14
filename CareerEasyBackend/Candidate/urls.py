from . import candidate_views
from django.urls import path

urlpatterns = [
    path('login', candidate_views.log_in),
    path('logout', candidate_views.log_out),
    path('signup', candidate_views.sign_up),
    path('upload_resume', candidate_views.upload_resume),
    path('ai_extract', candidate_views.extract_candidate_info),
    path('update_info', candidate_views.update_candidate_info),
    path('update_highlights', candidate_views.update_highlights),
    path('jobs', candidate_views.get_posted_jobs),
    path('job_detail/<str:job_id>', candidate_views.get_job_details),
    path('company_detail/<str:company_id>', candidate_views.get_company_details),
    path('check_fit', candidate_views.check_fit),
    path('updateprofile', candidate_views.update_profile),
    path('updatepassword', candidate_views.update_password),
    path('<str:candidate_id>', candidate_views.get_candidate_info),
]