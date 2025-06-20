import os
from http.client import responses
import json
from random import randint
from smtplib import SMTPException
from typing import Optional
from datetime import timedelta

import django
from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.paginator import Paginator
from django.db.models import Q, F, CharField, Value, JSONField
from django.db.models.functions import Concat, Cast
from django.shortcuts import get_object_or_404, redirect
from django.template import loader
from django.utils.timezone import now
from django.http import JsonResponse, Http404, HttpResponse
from django.core.mail import send_mail
from rest_framework.decorators import api_view
from bcrypt import gensalt, checkpw, hashpw
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample
from drf_spectacular.types import OpenApiTypes
from django.core.cache import cache

from CareerEasy.constants import *
from CareerEasyBackend.careereasy_utils import natural_language_to_query, rank_candidates

from .models import *
from CareerEasyBackend.models import *


@extend_schema(
    tags=['Employer Account Management'],
    description='Register a new employer account',
    request={
        'application/json': {
            'type': 'object',
            'properties': {
                'name': {'type': 'string', 'description': 'Username for the account'},
                'email': {'type': 'string', 'format': 'email', 'description': 'Email address'},
                'password': {'type': 'string', 'description': 'Account password'},
                'company_id': {'type': 'integer', 'description': 'ID of the associated company'}
            },
            'required': ['name', 'email', 'password']
        }
    },
    responses={
        200: OpenApiTypes.OBJECT,
        400: OpenApiTypes.OBJECT,
        409: OpenApiTypes.OBJECT
    }
)
@api_view(['POST'])
def sign_up(request):
    data = request.data
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    company_id = data.get('company_id')

    if not all([name, email, password]):
        return JsonResponse({"Error": "Missing required fields."}, status=400)

    if company_id is not None:
        company = Company.objects.filter(id=company_id).first()
        if company is None:
            return JsonResponse({"Error": "Company not found."}, status=404)
    else:
        company = None
    existing_account = EmployerAccount.objects.filter(username=name).first()
    if existing_account is not None:
        return JsonResponse({"Error": "User name already exists."}, status=409)
    existing_account = EmployerAccount.objects.filter(email=email).first()
    if existing_account is not None:
        return JsonResponse({"Error": "Email already exists."}, status=409)

    encrypted_password = hashpw(password.encode('utf8'), gensalt())
    new_account = EmployerAccount(
        username=name, email=email, password=encrypted_password.decode('utf8'), company=company)
    new_account.save()

    return JsonResponse(
        {"Success": "Signed up successfully."},
        status=200)


@extend_schema(
    tags=['Employer Account Management'],
    description='Login to employer account',
    request={
        'application/json': {
            'type': 'object',
            'properties': {
                'username': {'type': 'string', 'description': 'Username'},
                'password': {'type': 'string', 'description': 'Account password'}
            },
            'required': ['username', 'password']
        }
    },
    responses={
        200: OpenApiTypes.OBJECT,
        400: OpenApiTypes.OBJECT,
        401: OpenApiTypes.OBJECT
    }
)
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

    if not checkpw(password.encode('utf8'), account.password.encode('utf8')):
        return JsonResponse({"Error": "Invalid username or password."}, status=401)

    response = JsonResponse({"Success": "Signed in successfully."}, status=200)
    
    # Get the host from the request
    host = request.get_host()
    is_localhost = 'localhost' in host or '127.0.0.1' in host
    
    # Set cookies with proper attributes
    cookie_options = {
        'key': 'employer_id',
        'value': account.id,
        'max_age': 60 * 60 * 3,  # 3 hours
        'samesite': 'None',      # For cross-origin
        'secure': True,          # Always use secure
        'domain': '.career-easy.com'  # For subdomain support
    }
    
    # Only set domain and secure for production
    if not is_localhost:
        cookie_options.update({
            'domain': '.career-easy.com',
            'secure': True,
        })
    
    response.set_cookie(**cookie_options)
    
    return response


@extend_schema(
    tags=['Employer Account Management'],
    description='Logout from employer account',
    responses={
        200: OpenApiTypes.OBJECT
    }
)
@api_view(['POST'])
def log_out(request):
    response = JsonResponse(
        {"Success": "Signed out successfully."}, status=200)
    
    # Get the host from the request
    host = request.get_host()
    is_localhost = 'localhost' in host or '127.0.0.1' in host
    
    # Delete cookies with proper attributes
    cookie_options = {
        'key': 'employer_id',
        'samesite': 'None',
        'secure': True,
        'domain': '.career-easy.com'
    }
    
    # Only set domain and secure for production
    if not is_localhost:
        cookie_options.update({
            'domain': '.career-easy.com',
            'secure': True,
        })
    
    response.delete_cookie(**cookie_options)
    
    return response


@extend_schema(
    tags=['Employer Account Management'],
    description='Update employer account password',
    request={
        'application/json': {
            'type': 'object',
            'properties': {
                'old_password': {'type': 'string', 'description': 'Current password'},
                'new_password': {'type': 'string', 'description': 'New password'}
            },
            'required': ['old_password', 'new_password']
        }
    },
    responses={
        200: OpenApiTypes.OBJECT,
        400: OpenApiTypes.OBJECT,
        401: OpenApiTypes.OBJECT
    }
)
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


@extend_schema(
    tags=['Employer Profile'],
    description='Update employer profile information',
    request={
        'application/json': {
            'type': 'object',
            'properties': {
                'name': {'type': 'string', 'description': 'New username'},
                'email': {'type': 'string', 'format': 'email', 'description': 'New email address'},
                'company_id': {'type': 'string', 'description': 'New company ID'}
            }
        }
    },
    responses={
        200: OpenApiTypes.OBJECT,
        401: OpenApiTypes.OBJECT
    }
)
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
        company = Company.objects.filter(id=company_id).first()
        if company is None:
            return JsonResponse({"Error": "Company not found."}, status=404)
        employer.company = company
    employer.save()
    return JsonResponse({"Success": "Profile updated successfully."}, status=200)


@extend_schema(
    tags=['Employer Profile'],
    description='Get employer profile information',
    responses={
        200: OpenApiTypes.OBJECT,
        401: OpenApiTypes.OBJECT
    }
)
@api_view(['GET'])
def get_employer_info(request):
    employer_id = request.COOKIES.get('employer_id')
    employer = EmployerAccount.objects.filter(id=employer_id).values('username',
                                                                     'email',
                                                                     'company__name').first()

    if employer is None:
        return JsonResponse({"Error": "Session expired. Please log in again."}, status=401)
    return JsonResponse(employer, status=200)


@extend_schema(
    tags=['Employer Profile'],
    description='Create a new company for the employer',
    request={
        'application/json': {
            'type': 'object',
            'properties': {
                'name': {'type': 'string', 'description': 'Company name'},
                'location': {'type': 'string', 'description': 'Company location'},
                'country': {'type': 'string', 'description': 'Company country'},
                'description': {'type': 'string', 'description': 'Company description'},
                'category': {'type': 'string', 'description': 'Company category'}
            },
            'required': ['name', 'location', 'country', 'category']
        }
    },
    responses={
        200: OpenApiTypes.OBJECT,
        400: OpenApiTypes.OBJECT
    }
)
@api_view(['POST'])
def create_company(request):
    data = request.data
    name = data.get('name')
    location = data.get('location')
    country = data.get('country')
    description = data.get('description')
    category_name = data.get('category')  # TODO: replace with a drop-down list

    if not all([name, location, country, category_name]):
        return JsonResponse({"Error": "Missing required fields."}, status=400)

    account = request.COOKIES.get('employer_id')
    employer = EmployerAccount.objects.filter(id=account).first()
    if employer is None:
        return JsonResponse({"Error": "Session expired. Please log in again."}, status=401)

    category = CompanyCategory.objects.filter(name=category_name).first()
    if category is None:
        return JsonResponse({"Error": f'Category "{category_name}" not found.'}, status=404)

    company = Company(name=name,
                      location=location,
                      country=country,
                      # TODO: replace with AWS S3 upload
                      logo=f"https://careereasy-assets.s3.ca-central-1.amazonaws.com/c{randint(1, 7)}.png",
                      description=description,
                      category=category)
    company.save()
    employer.company = company
    employer.save()
    return JsonResponse({"Success": "Company created successfully."}, status=200)


@extend_schema(
    tags=['Employer Job Posting'],
    description='Get list of jobs posted by the employer\'s company',
    responses={
        200: OpenApiTypes.OBJECT,
        401: OpenApiTypes.OBJECT
    }
)
@api_view(['GET'])
def get_posted_jobs(request):
    employer_id = request.COOKIES.get('employer_id')
    employer = EmployerAccount.objects.filter(id=employer_id).first()
    if employer is None:
        return JsonResponse({"Error": "Session expired. Please log in again."}, status=401)

    if employer.company is None:
        return JsonResponse({"Error": "No associated company found. Please create a new company or associate an existing company."}, status=404)

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


@api_view(['POST'])
def post_job(request):
    data = request.data
    employer_id = request.COOKIES.get('employer_id')
    employer = EmployerAccount.objects.filter(id=employer_id).first()
    if employer is None:
        return JsonResponse({"Error": "Session expired. Please log in again."}, status=401)
    return JsonResponse({"Success": "Feature under development."}, status=200)


@api_view(['POST'])
def search_candidates(request):
    data = request.data
    employer_id = request.COOKIES.get('employer_id')
    employer = EmployerAccount.objects.filter(id=employer_id).first()
    if employer is None:
        return JsonResponse({"Error": "Session expired. Please log in again."}, status=401)
    return JsonResponse({"Success": "Feature under development."}, status=200)


@extend_schema(
    tags=['Employer Profile'],
    description='Get employer\'s company information',
    responses={
        200: OpenApiTypes.OBJECT,
        401: OpenApiTypes.OBJECT,
        404: OpenApiTypes.OBJECT
    }
)
@api_view(['GET'])
def get_company(request, company_id):
    company = Company.objects.filter(id=company_id).first()
    if company is None:
        return JsonResponse({"Error": "Company not found."}, status=404)
    employer_id = request.COOKIES.get('employer_id')
    employer = EmployerAccount.objects.filter(id=employer_id).first()
    if employer is not None and employer.company == company:
        return JsonResponse({"company__name": company.name,
                             "company__location": company.location,
                             "company__country": company.country,
                             "company__description": company.description,
                             "company__category": company.category.name,
                             "company__logo": company.logo}, status=200) # Currently the same. Will differ if some company information is not public in future dev.
    return JsonResponse({"company__name": company.name,
                         "company__location": company.location,
                         "company__country": company.country,
                         "company__description": company.description,
                         "company__category": company.category.name,
                         "company__logo": company.logo}, status=200)


@extend_schema(
    tags=['Employer Candidate Search'],
    description='Get list of candidates',
    parameters=[
        OpenApiParameter(name='page', description='Page number', required=False, type=int),
        OpenApiParameter(name='page_size', description='Number of items per page', required=False, type=int)
    ],
    request={
        'application/json': {
            'type': 'object',
            'properties': {
                'page': {'type': 'integer', 'description': 'Page number'},
                'page_size': {'type': 'integer', 'description': 'Number of items per page'}
            }
        }
    },
    responses={
        200: OpenApiTypes.OBJECT
    }
)
@api_view(['GET'])
def get_candidates(request):
    page = request.GET.get('page', 1)
    page_size = request.GET.get('page_size', 10)
    candidates = Paginator(Candidate.objects
                           .order_by('-updated_at', '-created_at')
                           .values('id',
                                   'first_name',
                                   'middle_name',
                                   'last_name',
                                   'title',
                                   'location',
                                   'country',
                                   'profile_pic',
                                   'experience_months',
                                   'skills',
                                   'ai_highlights'),
                           page_size)
    page_obj = candidates.page(page)
    candidate_list = list(page_obj)
    for candidate in candidate_list:
        candidate['name'] = candidate['first_name'] + " " + (candidate['middle_name'][0]+". " if candidate['middle_name'] else "") + candidate['last_name']
        del candidate['first_name']
        del candidate['middle_name']
        del candidate['last_name']
    return JsonResponse({
        "items": candidate_list,
        "has_next": page_obj.has_next(),
        "has_previous": page_obj.has_previous(),
        "total_pages": candidates.num_pages,
        "current_page": page_obj.number,
        "total_count": candidates.count
    }, status=200)


@extend_schema(
    tags=['Employer Candidate Search'],
    description='LLM-powered search for candidates using natural language query',
    request={
        'application/json': {
            'type': 'object',
            'properties': {
                'query': {'type': 'string', 'description': 'Natural language search query'}
            },
            'required': ['query']
        }
    },
    responses={
        200: OpenApiTypes.OBJECT,
        400: OpenApiTypes.OBJECT,
        401: OpenApiTypes.OBJECT
    }
)
@api_view(['POST'])
def natural_language_query(request):
    query = request.data.get('query')
    standardized_query = STANDARDIZE_FN(query)
    existing_query = Query.objects.filter(
        standardized_query=standardized_query).first()
    if existing_query is not None:
        ai_query = existing_query.query_response
        ai_query['query_id'] = existing_query.id
        return JsonResponse(ai_query, status=200)

    try:
        ai_query = natural_language_to_query(query)
        new_query = Query(
            query=query, standardized_query=standardized_query, query_response=ai_query)
        new_query.save()
        ai_query['query_id'] = new_query.id
    except Exception as e:
        return JsonResponse({"Error": str(e)}, status=400)
    return JsonResponse(ai_query, status=200)


@extend_schema(
    tags=['Employer Candidate Search'],
    description='Get ranked candidates based on search criteria',
    parameters=[
        OpenApiParameter(name='page', description='Page number', required=False, type=int),
        OpenApiParameter(name='page_size', description='Number of items per page', required=False, type=int)
    ],
    request={
        'application/json': {
            'type': 'object',
            'properties': {
                'minimal_years_of_experience': {'type': 'number', 'description': 'Minimum years of experience'},
                'maximal_years_of_experience': {'type': 'number', 'description': 'Maximum years of experience'},
                'preferred_title_keywords': {'type': 'array', 'items': {'type': 'string'}, 'description': 'Preferred job titles'},
                'high_priority_keywords': {'type': 'array', 'items': {'type': 'string'}, 'description': 'High priority skills'},
                'low_priority_keywords': {'type': 'array', 'items': {'type': 'string'}, 'description': 'Low priority skills'}
            }
        }
    },
    responses={
        200: OpenApiTypes.OBJECT,
        400: OpenApiTypes.OBJECT,
        401: OpenApiTypes.OBJECT
    }
)
@api_view(['POST'])
def get_ranked_candidates(request):
    try:
        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('page_size', 10))
    except ValueError as e:
        if settings.DEBUG:
            raise e
        return JsonResponse({"Error": "Invalid page or page_size parameters"}, status=400)
        
    data = request.data
    minimal_years_of_experience = data.get('minimal_years_of_experience')
    maximal_years_of_experience = data.get('maximal_years_of_experience')
    preferred_title_keywords = data.get('preferred_title_keywords')
    high_priority_keywords = data.get('high_priority_keywords')
    low_priority_keywords = data.get('low_priority_keywords')
    query_id = str(data.get('query_id')).replace("-", "")
    
    # Try to get cached results from Redis
    cache_key = f"ranked_results_{query_id}"
    ranked_candidates = cache.get(cache_key)
    try:
        if ranked_candidates is not None:
            ranked_candidates = json.loads(ranked_candidates)
        else:
            ranked_candidates = rank_candidates(
                query={
                    "minimal_years_of_experience": minimal_years_of_experience,
                    "maximal_years_of_experience": maximal_years_of_experience,
                    "preferred_title_keywords": preferred_title_keywords,
                    "high_priority_keywords": high_priority_keywords,
                    "low_priority_keywords": low_priority_keywords
                },
                candidates=Candidate.objects.values('id',
                                                    'first_name',
                                                    'middle_name',
                                                    'last_name',
                                                    'title',
                                                    'location',
                                                    'country',
                                                    'profile_pic',
                                                    'ai_highlights',
                                                    'standardized_anonymous_resume',
                                                    'standardized_ai_highlights', 
                                                    'standardized_skills',
                                                    'standardized_title',
                                                    'experience_months')
            )
            cache.set(cache_key, json.dumps(ranked_candidates), timeout=3600)  # Cache for 1 hour
            
        paginator = Paginator(ranked_candidates, page_size)
        page_obj = paginator.page(page)
        return JsonResponse({
            "items": list(page_obj),
            "has_next": page_obj.has_next(),
            "has_previous": page_obj.has_previous(),
            "total_pages": paginator.num_pages,
            "current_page": page_obj.number,
            "total_count": paginator.count
        }, status=200)
    except Exception as e:
        if settings.DEBUG:
            raise e
        return JsonResponse({"Error": "Query failed with error: "+str(e)}, status=400)


@extend_schema(
    tags=['Employer Candidate Search'],
    description='Get candidate details',
    request={
        'application/json': {
            'type': 'object',
            'properties': {
                'candidate_id': {'type': 'string', 'description': 'Candidate ID'}
            }
        }
    },
    responses={
        200: OpenApiTypes.OBJECT,
        404: OpenApiTypes.OBJECT
    }
)
@api_view(['GET'])
def get_candidate_info(request, candidate_id):
    try:
        candidate = Candidate.objects.filter(id=candidate_id).first()
        if candidate is None:
            return JsonResponse({"Error": "Candidate not found."}, status=404)
        return JsonResponse({"name": candidate.first_name + " " + candidate.last_name,
                             "email": candidate.email,
                             "phone": str(candidate.phone),
                             "location": candidate.location,
                             "country": candidate.country,
                             "title": candidate.title,
                             "resume": candidate.resume,
                             "skills": candidate.skills,
                             "experience_months": candidate.experience_months,
                             "highest_education": candidate.highest_education,
                             "has_original_resume": bool(
                                 candidate.original_resume_path and os.path.exists(candidate.original_resume_path)),
                             "profile_pic": candidate.profile_pic,
                             "highlights": candidate.ai_highlights}, status=200)
    except ValidationError:
        return JsonResponse({"Error": "Candidate not found."}, status=404)

@extend_schema(
    tags=['Candidate Profile'],
    description='Download original resume file',
    responses={
        200: OpenApiTypes.BINARY,
        401: OpenApiTypes.OBJECT,
        404: OpenApiTypes.OBJECT
    }
)
@api_view(['GET'])
def download_resume(request, candidate_id):
    """
    Download the original resume file for the authenticated candidate.
    """
    candidate = Candidate.objects.filter(id=candidate_id).first()
    if not candidate:
        return JsonResponse({"Error": "Candidate not found."}, status=404)

    if not candidate.original_resume_path or not os.path.exists(candidate.original_resume_path):
        return JsonResponse({"Error": "Original resume file not found."}, status=404)

    try:
        # Determine content type based on file extension
        file_extension = os.path.splitext(candidate.original_resume_path)[1].lower()
        content_type_map = {
            '.txt': 'text/plain',
            '.pdf': 'application/pdf',
            '.doc': 'application/msword',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            '.md': 'text/markdown',
        }
        content_type = content_type_map.get(file_extension, 'application/octet-stream')

        # Get original filename (we can store this if needed, for now use a generic name)
        filename = f"resume{file_extension}"

        # Read and return the file
        with open(candidate.original_resume_path, 'rb') as file:
            response = HttpResponse(file.read(), content_type=content_type)
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            return response

    except Exception as e:
        return JsonResponse({"Error": f"Failed to download resume file. Error: {repr(e)}"}, status=500)