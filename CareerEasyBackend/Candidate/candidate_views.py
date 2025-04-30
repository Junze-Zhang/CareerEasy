from http.client import responses
from random import randint
import random
from smtplib import SMTPException
from typing import Optional
from datetime import timedelta

from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.template import loader
from django.utils.timezone import now
from django.http import JsonResponse, Http404, HttpResponse
from django.core.mail import send_mail
from rest_framework.decorators import api_view
from bcrypt import gensalt, checkpw, hashpw

from CareerEasyBackend.Candidate.models import *
from CareerEasyBackend.initDB import S3_BASE_URL
from CareerEasyBackend.models import *


@api_view(['POST'])
def sign_up(request):
    data = request.data
    username = data.get('username')
    first_name = data.get('first_name')
    middle_name = data.get('middle_name')
    last_name = data.get('last_name')
    email = data.get('email')
    work_email = data.get('work_email')
    phone = data.get('phone')
    password = data.get('password')
    preferred_career_types = data.get('preferred_career_types')
    location = data.get('location')
    country = data.get('country')
    resume = data.get('resume')
#    profile_pic = data.get('profile_pic')
    profile_pic = S3_BASE_URL.format(n=random.randint(1, 10)) # TODO: support uploading profile picture
    
    if not all([username, first_name, last_name, email, phone, password, preferred_career_types, location, country, resume]):
        return JsonResponse({"Error": "Missing required fields."}, status=400)

    existing_account = CandidateAccount.objects.filter(username=username).first()
    if existing_account is not None:
        return JsonResponse({"Error": "User name is already taken."}, status=409)
    existing_account = CandidateAccount.objects.filter(email=email).first()
    if existing_account is not None:
        return JsonResponse({"Error": "Email is already taken."}, status=409)
    existing_account = CandidateAccount.objects.filter(email=work_email).first()
    if existing_account is not None:
        return JsonResponse({"Error": "Email is already taken."}, status=409)
    
    if work_email is None:
        work_email = email
    new_candidate = Candidate(first_name=first_name, 
                              middle_name=middle_name,
                              last_name=last_name, 
                              email=work_email,
                              phone=phone, 
                              location=location, 
                              country=country, 
                              resume=resume, 
                              profile_pic=profile_pic)
    for career_name in preferred_career_types:
        career = Career.objects.filter(name=career_name).first()
        if career is None:
            pass # TODO: support adding new career types
        else:
            new_candidate.preferred_career_types.add(career)
    new_candidate.save()
    encrypted_password = hashpw(password.encode('utf8'), gensalt())
    new_account = CandidateAccount(username=username, email=email, password=encrypted_password, candidate=new_candidate)
    new_account.save()

    return JsonResponse(
        {"Success": "Signed up successfully."},
        status=200)


@api_view(['POST'])
def log_in(request):
    data = request.data
    username = data.get('username')
    password = data.get('password')

    if not all([username, password]):
        return JsonResponse({"Error": "Missing required fields."}, status=400)

    account = EmployerAccount.objects.filter(username=username).first()
    if account is None:
        return JsonResponse({"Error": "Invalid username or password."}, status=401)

    if not checkpw(password.encode('utf8'), account.password):
        return JsonResponse({"Error": "Invalid username or password."}, status=401)

    response = JsonResponse({"Success": "Signed in successfully."}, status=200)
    response.set_cookie(key='employer_id', value=account.id, max_age=60 * 60 * 3)  # 3 hours
    return response


@api_view(['POST'])
def log_out(request):
    response = JsonResponse({"Success": "Signed out successfully."}, status=200)
    response.delete_cookie('employer_id')
    return response


@api_view(['POST'])
def update_password(request):
    data = request.data
    employer_id = request.COOKIES.get('employer_id')
    old_password = data.get('old_password')
    new_password = data.get('new_password')

    if not all([employer_id, old_password, new_password]):
        return JsonResponse({"Error": "Missing required fields."}, status=400)

    employer = EmployerAccount.objects.filter(id=employer_id).first()
    if employer is None:
        return JsonResponse({"Error": "Session expired. Please log in again."}, status=401)

    if not checkpw(old_password.encode('utf8'), employer.password):
        return JsonResponse({"Error": "Incorrect old password."}, status=401)

    employer.password = hashpw(new_password.encode('utf8'), gensalt())
    employer.save()
    return JsonResponse({"Success": "Password updated successfully."}, status=200)


@api_view(['POST'])
def update_profile(request):
    data = request.data
    employer_id = request.COOKIES.get('employer_id')
    name = data.get('name')
    email = data.get('email')
    company_id = data.get('company_id')

    employer = EmployerAccount.objects.filter(id=employer_id).first()
    if employer is None:
        return JsonResponse({"Error": "Session expired. Please log in again."}, status=401)
    if name is not None:
        employer.username = name
    if email is not None:
        employer.email = email
    if company_id is not None:
        employer.company = Company.objects.filter(id=company_id).first()
    employer.save()
    return JsonResponse({"Success": "Profile updated successfully."}, status=200)


@api_view(['GET'])
def get_posted_jobs(request):
    employer_id = request.COOKIES.get('employer_id')
    employer = EmployerAccount.objects.filter(id=employer_id).first()
    if employer is None:
        return JsonResponse({"Error": "Session expired. Please log in again."}, status=401)

    jobs = JobPosting.objects.filter(company=employer.company, deleted=False)
    job_list = []
    for job in jobs:
        job_list.append({
            "id": job.id,
            "title": job.title,
            "company": job.company.name,
            "url": job.url,
            "description": job.description,
            "posted_at": job.posted_at,
            "updated_at": job.updated_at,
        })
    return JsonResponse({"Success": job_list}, status=200)