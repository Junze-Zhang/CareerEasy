from http.client import responses
import json
from random import randint
import random
from smtplib import SMTPException
from typing import Optional, Literal
from datetime import timedelta
import os
import uuid
from django.core.files.storage import FileSystemStorage
from django.conf import settings
from django.core.files.base import ContentFile
from django.core.paginator import Paginator
from django.db.models import Q, Case, When, BooleanField
from django.shortcuts import get_object_or_404
from django.template import loader
from django.utils.timezone import now
from django.http import JsonResponse, Http404, HttpResponse, HttpRequest
from django.core.mail import send_mail
from rest_framework.decorators import api_view
from bcrypt import gensalt, checkpw, hashpw
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample
from drf_spectacular.types import OpenApiTypes
import django.core.exceptions

from CareerEasy.constants import *
from CareerEasyBackend.Candidate.models import *
from CareerEasyBackend.initDB import S3_BASE_URL
from CareerEasyBackend.models import *
from CareerEasyBackend.careereasy_utils import am_i_a_match, anonymize_resume, extract_from_resume, \
    update_ai_highlights, upload_profile_picture_to_s3, extract_text_from_file, logger


@extend_schema(
    tags=['Candidate Account Management'],
    description='Register a new candidate account with optional profile picture',
    request={
        'multipart/form-data': {
            'type': 'object',
            'properties': {
                'username': {'type': 'string', 'description': 'Username for the account'},
                'first_name': {'type': 'string', 'description': 'First name'},
                'middle_name': {'type': 'string', 'description': 'Middle name (optional)'},
                'last_name': {'type': 'string', 'description': 'Last name'},
                'email': {'type': 'string', 'format': 'email', 'description': 'Personal email'},
                'work_email': {'type': 'string', 'format': 'email', 'description': 'Work email (optional)'},
                'phone': {'type': 'string', 'description': 'Phone number'},
                'password': {'type': 'string', 'description': 'Account password'},
                'preferred_career_types': {'type': 'string', 'description': 'Comma-separated preferred career type IDs'},
                'location': {'type': 'string', 'description': 'Current location (optional if state and city provided)'},
                'state': {'type': 'string', 'description': 'State/Province (optional if location provided)'},
                'city': {'type': 'string', 'description': 'City (optional if location provided)'},
                'country': {'type': 'string', 'description': 'Country'},
                'title': {'type': 'string', 'description': 'Current job title'},
                'profile_pic': {'type': 'string', 'format': 'binary', 'description': 'Profile picture (optional, max 10MB)'}
            },
            'required': ['username', 'first_name', 'last_name', 'email', 'phone', 'password',
                         'preferred_career_types', 'country', 'title']
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
    state = data.get('state')
    city = data.get('city')
    country = data.get('country')
    title = data.get('title')
    
    # Set default profile picture URL
    profile_pic_url = S3_BASE_URL.format(n=random.randint(1, 10))

    # Parse preferred_career_types if it's a string (from multipart form data)
    if isinstance(preferred_career_types, str):
        try:
            preferred_career_types = [x for x in preferred_career_types.split(',')]
        except ValueError:
            return JsonResponse({"Error": "Invalid preferred career types format."}, status=400)

    if not all([username, first_name, last_name, email, phone, password, preferred_career_types, country, title]):
        return JsonResponse({"Error": "Missing required fields."}, status=400)
    if not location:
        if not (state and city):
            return JsonResponse({"Error": "Missing required fields."}, status=400)
        location = f"{city}, {state}"
    existing_account = CandidateAccount.objects.filter(
        username=username).first()
    if existing_account is not None:
        return JsonResponse({"Error": "User name is already taken."}, status=409)
    existing_account = CandidateAccount.objects.filter(email=email).first()
    if existing_account is not None:
        return JsonResponse({"Error": "Email is already taken."}, status=409)
    # existing_account = CandidateAccount.objects.filter(
    #     email=work_email).first()
    # if existing_account is not None:
    #     return JsonResponse({"Error": "Email is already taken."}, status=409)

    if work_email is None:
        work_email = email
    new_candidate = Candidate(first_name=first_name,
                              middle_name=middle_name,
                              last_name=last_name,
                              email=work_email,
                              phone=phone,
                              location=location,
                              country=country,
                              profile_pic=profile_pic_url,
                              title=title,
                              standardized_title=STANDARDIZE_FN(title))
    new_candidate.save()  # Save the candidate first

    # Upload custom profile picture if provided
    if 'profile_pic' in request.FILES:
        try:
            profile_pic_file = request.FILES['profile_pic']
            custom_profile_pic_url = upload_profile_picture_to_s3(profile_pic_file, str(new_candidate.id))
            new_candidate.profile_pic = custom_profile_pic_url
            new_candidate.save()  # Update with custom profile picture URL
        except Exception as e:
            # Log the error but don't fail the account creation
            logger.warning(f"Profile picture upload failed for candidate {new_candidate.id}: {str(e)}")
            # Account will be created with default profile picture

    for career_id in preferred_career_types:
        career = Career.objects.filter(id=career_id).first()
        if career is None:
            pass  # Adding new career types should be done by employers
        else:
            new_candidate.preferred_career_types.add(career)
    encrypted_password = hashpw(password.encode('utf8'), gensalt())
    new_account = CandidateAccount(username=username, email=email,
                                   password=encrypted_password.decode('utf8'), candidate=new_candidate)
    new_account.save()

    return JsonResponse(
        {"Success": "Signed up successfully."},
        status=200)


@extend_schema(
    tags=['Candidate Profile'],
    description='Upload candidate resume (supports TXT, PDF, DOC, DOCX formats)',
    request={
        'multipart/form-data': {
            'type': 'object',
            'properties': {
                'resume': {'type': 'string', 'format': 'binary', 'description': 'Resume file (.txt, .pdf, .doc, .docx)'}
            },
            'required': ['resume']
        }
    },
    responses={
        200: OpenApiTypes.OBJECT,
        400: OpenApiTypes.OBJECT,
        401: OpenApiTypes.OBJECT,
        404: OpenApiTypes.OBJECT
    }
)
@api_view(['POST'])
def upload_resume(request):
    """
    Handle resume file uploads.
    Supports TXT, PDF, DOC, and DOCX files.
    Stores original files locally with random IDs and extracts text for AI analysis.
    """
    if 'resume' not in request.FILES:
        return JsonResponse({"Error": "No file was uploaded."}, status=400)

    file = request.FILES['resume']
    candidate_id = request.COOKIES.get('candidate_id')

    if not candidate_id:
        return JsonResponse({"Error": "Session expired. Please log in again."}, status=401)

    candidate = Candidate.objects.filter(id=candidate_id).first()
    if not candidate:
        return JsonResponse({"Error": "Candidate not found."}, status=404)

    # Validate file size (max 25MB for documents)
    max_size = 25 * 1024 * 1024  # 25MB
    if file.size > max_size:
        return JsonResponse({"Error": "File size too large. Maximum size is 25MB."}, status=400)

    # Validate file extension
    if not hasattr(file, 'name') or not file.name:
        return JsonResponse({"Error": "File must have a valid name and extension."}, status=400)
    
    file_extension = os.path.splitext(file.name)[1].lower()
    allowed_extensions = ['.txt', '.pdf', '.doc', '.docx']
    if file_extension not in allowed_extensions:
        return JsonResponse({
            "Error": f"Unsupported file format. Allowed formats: {', '.join(allowed_extensions)}"
        }, status=400)

    # Extract text content from file
    try:
        resume_text = extract_text_from_file(file)
        if not resume_text.strip():
            return JsonResponse({"Error": "No text content found in the uploaded file."}, status=400)
    except Exception as e:
        return JsonResponse({"Error": str(e)}, status=400)

    # Create resumes directory if it doesn't exist
    media_root = settings.MEDIA_ROOT
    resumes_dir = os.path.join(media_root, 'resumes')
    if not os.path.exists(resumes_dir):
        os.makedirs(resumes_dir)

    # Generate random filename to prevent direct access and filename conflicts
    random_id = uuid.uuid4().hex[:16]  # 16 character random ID
    filename = f"resumes/{random_id}{file_extension}"
    
    # Reset file pointer before saving
    file.seek(0)
    
    # Save the original file with random name
    fs = FileSystemStorage()
    saved_file_path = fs.save(filename, file)
    
    # Get the full file path for storage in database
    full_file_path = os.path.join(media_root, saved_file_path)

    # Update candidate's resume fields
    candidate.resume = resume_text
    candidate.original_resume_path = full_file_path  # Store path to original file
    candidate.anonymous_resume = anonymize_resume(resume_text)
    candidate.standardized_resume = STANDARDIZE_FN(resume_text)
    candidate.standardized_anonymous_resume = STANDARDIZE_FN(candidate.anonymous_resume)
    candidate.save()

    return JsonResponse({
        "Success": "Resume uploaded successfully.",
        "file_type": file_extension,
        "text_length": len(resume_text)
    }, status=200)


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
def download_resume(request):
    """
    Download the original resume file for the authenticated candidate.
    """
    candidate_id = request.COOKIES.get('candidate_id')
    if not candidate_id:
        return JsonResponse({"Error": "Session expired. Please log in again."}, status=401)

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
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
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
        logger.error(f"Error downloading resume: {str(e)}")
        return JsonResponse({"Error": "Failed to download resume file."}, status=500)


@extend_schema(
    tags=['Candidate Profile'],
    description='Extract candidate information from resume using Reasoning LLM (Will take some minutes to complete)',
    responses={
        200: OpenApiTypes.OBJECT,
        400: OpenApiTypes.OBJECT,
        404: OpenApiTypes.OBJECT
    }
)
@api_view(['GET'])
def extract_candidate_info(request):
    # Extract candidate information using LLM Reasoning
    candidate_id = request.COOKIES.get('candidate_id')
    candidate = Candidate.objects.filter(id=candidate_id).first()
    if not candidate:
        return JsonResponse({"Error": "Session expired. Please log in again."}, status=401)
    try:
        candidate_info = extract_from_resume(candidate)
        if settings.DEBUG:
            print(candidate_info)
    except Exception as e:
        return JsonResponse({"Error": str(e) + " Please try again."}, status=400)
    candidate.experience_months = candidate_info["exp_month"]
    candidate.skills = candidate_info["skills"]
    candidate.standardized_skills = [
        STANDARDIZE_FN(skill) for skill in candidate.skills]
    candidate.ai_highlights = candidate_info["ai_highlights"]
    candidate.standardized_ai_highlights = [STANDARDIZE_FN(
        highlight) for highlight in candidate.ai_highlights]
    candidate.highest_education = candidate_info["highest_education"]
    candidate.standardized_highest_education = STANDARDIZE_FN(
        candidate.highest_education)
    candidate.save()
    return JsonResponse({"experience": f"{candidate.experience_months // 12} years {candidate.experience_months % 12} months",
                         "skills": candidate.skills,
                         "highest_education": candidate.highest_education,
                         "ai_highlights": candidate.ai_highlights}, status=200)

@extend_schema(
    tags=['Candidate Profile'],
    description='Update candidate information',
    request={
        'application/json': {
            'type': 'object',
            'properties': {
                'experience_months': {'type': 'integer', 'description': 'Experience in months'},
                'skills': {'type': 'array', 'items': {'type': 'string'}, 'description': 'Skills'},
                'highest_education': {'type': 'string', 'description': 'Highest education'}
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
def update_candidate_info(request):
    data = request.data
    candidate_id = request.COOKIES.get('candidate_id')
    candidate = Candidate.objects.filter(id=candidate_id).first()
    if not candidate:
        return JsonResponse({"Error": "Session expired. Please log in again."}, status=401)
    first_name = data.get('first_name')
    middle_name = data.get('middle_name')
    last_name = data.get('last_name')
    email = data.get('work_email')
    phone = data.get('phone')
    location = data.get('location')
    country = data.get('country')
    experience_months = data.get('experience_months')
    title = data.get('title')
    skills = data.get('skills')
    highest_education = data.get('highest_education')
    preferred_career_types = data.get('preferred_career_types')
    for field in ["first_name", 
                  "middle_name", 
                  "last_name", 
                  "phone",
                  "email",
                  "location",
                  "country", 
                  "experience_months",
                  "skills",
                  "highest_education",
                  "title"]:
        if field in data and data.get(field) != "":
            setattr(candidate, field, data.get(field))
    if preferred_career_types is not None and len(preferred_career_types) > 0:
        candidate.preferred_career_types.clear()
        for career_id in preferred_career_types:
            career = Career.objects.filter(id=career_id).first()
            if career is None:
                pass  # TODO: support adding new career types
            else:
                candidate.preferred_career_types.add(career)
    if skills is not None and len(skills) > 0:
        candidate.skills = skills
        candidate.standardized_skills = [STANDARDIZE_FN(skill) for skill in candidate.skills]
    if highest_education is not None:
        candidate.highest_education = highest_education
        candidate.standardized_highest_education = STANDARDIZE_FN(highest_education)
    candidate.save()
    return JsonResponse({"Success": "Candidate information updated successfully."}, status=200)


@extend_schema(
    tags=['Candidate Profile'],
    description='Update candidate ai highlights',
    request={
        'application/json': {
            'type': 'object',
            'properties': {
                'custom_prompt': {'type': 'string', 'description': 'Custom prompt for AI highlights'}
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
def update_highlights(request):
    data = request.data
    candidate_id = request.COOKIES.get('candidate_id')
    candidate = Candidate.objects.filter(id=candidate_id).first()
    if not candidate:
        return JsonResponse({"Error": "Session expired. Please log in again."}, status=401)
    custom_prompt = data.get('custom_prompt')
    if custom_prompt is None:
        custom_prompt = "Focus on the candidate's education, experience and skills."
    try:
        ai_highlights = update_ai_highlights(candidate, custom_prompt)
    except Exception as e:
        return JsonResponse({"Error": str(e)}, status=400)
    candidate.ai_highlights = ai_highlights
    candidate.standardized_ai_highlights = [STANDARDIZE_FN(highlight) for highlight in ai_highlights]
    candidate.save()
    return JsonResponse({"highlights": ai_highlights}, status=200)

@extend_schema(
    tags=['Candidate Account Management'],
    description='Login to candidate account',
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

    account = CandidateAccount.objects.filter(username=username).first()
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
        'key': 'candidate_id',
        'value': account.candidate.id,
        'max_age': 60 * 60 * 3,  # 3 hours
        'samesite': 'Lax' if is_localhost else 'None',      # Use Lax for localhost, None for production
        'secure': False if is_localhost else True,          # Disable secure for localhost HTTP
    }
    
    # Only set domain in production
    if not is_localhost:
        cookie_options['domain'] = '.career-easy.com'  # Domain for subdomain support in production
    
    response.set_cookie(**cookie_options)
    
    # Set candidate_account_id cookie with same options
    cookie_options['key'] = 'candidate_account_id'
    cookie_options['value'] = account.id
    response.set_cookie(**cookie_options)
    
    return response


@extend_schema(
    tags=['Candidate Account Management'],
    description='Logout from candidate account',
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
    if is_localhost:
        # For localhost, delete without domain
        response.delete_cookie('candidate_id')
        response.delete_cookie('candidate_account_id')
    else:
        # For production, delete with domain
        response.delete_cookie('candidate_id', domain='.career-easy.com')
        response.delete_cookie('candidate_account_id', domain='.career-easy.com')
    
    return response


@extend_schema(
    tags=['Candidate Account Management'],
    description='Update candidate account password',
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
    account_id = request.COOKIES.get('candidate_account_id')
    old_password = data.get('old_password')
    new_password = data.get('new_password')

    if not all([account_id, old_password, new_password]):
        return JsonResponse({"Error": "Missing required fields."}, status=400)

    account = CandidateAccount.objects.filter(id=account_id).first()
    if account is None:
        return JsonResponse({"Error": "Session expired. Please log in again."}, status=401)

    if not checkpw(old_password.encode('utf8'), account.password):
        return JsonResponse({"Error": "Incorrect old password."}, status=401)

    account.password = hashpw(new_password.encode('utf8'), gensalt())
    account.save()
    return JsonResponse({"Success": "Password updated successfully."}, status=200)


@extend_schema(
    tags=['Candidate Profile'],
    description='Upload or update candidate profile picture',
    request={
        'multipart/form-data': {
            'type': 'object',
            'properties': {
                'profile_pic': {'type': 'string', 'format': 'binary', 'description': 'Profile picture file (max 10MB)'}
            },
            'required': ['profile_pic']
        }
    },
    responses={
        200: OpenApiTypes.OBJECT,
        400: OpenApiTypes.OBJECT,
        401: OpenApiTypes.OBJECT,
        404: OpenApiTypes.OBJECT
    }
)
@api_view(['POST'])
def update_profile_picture(request):
    """
    Update candidate's profile picture by uploading to S3.
    """
    if 'profile_pic' not in request.FILES:
        return JsonResponse({"Error": "No profile picture file was uploaded."}, status=400)

    candidate_id = request.COOKIES.get('candidate_id')
    if not candidate_id:
        return JsonResponse({"Error": "Session expired. Please log in again."}, status=401)

    candidate = Candidate.objects.filter(id=candidate_id).first()
    if not candidate:
        return JsonResponse({"Error": "Candidate not found."}, status=404)

    try:
        profile_pic_file = request.FILES['profile_pic']
        new_profile_pic_url = upload_profile_picture_to_s3(profile_pic_file, str(candidate.id))
        
        # Update candidate's profile picture URL
        candidate.profile_pic = new_profile_pic_url
        candidate.save()

        return JsonResponse({
            "Success": "Profile picture updated successfully.",
            "profile_pic_url": new_profile_pic_url
        }, status=200)

    except Exception as e:
        return JsonResponse({"Error": f"Profile picture upload failed: {str(e)}"}, status=400)


@extend_schema(
    tags=['Candidate Profile'],
    description='Update candidate profile information',
    request={
        'application/json': {
            'type': 'object',
            'properties': {
                'name': {'type': 'string', 'description': 'New username'},
                'email': {'type': 'string', 'format': 'email', 'description': 'New email address'}
            }
        }
    },
    responses={
        200: OpenApiTypes.OBJECT,
        401: OpenApiTypes.OBJECT,
        409: OpenApiTypes.OBJECT
    }
)
@api_view(['POST'])
def update_profile(request):
    data = request.data
    account_id = request.COOKIES.get('candidate_account_id')
    name = data.get('name')
    email = data.get('email')

    account = CandidateAccount.objects.filter(id=account_id).first()
    if account is None:
        return JsonResponse({"Error": "Session expired. Please log in again."}, status=401)
    if name is not None:
        if CandidateAccount.objects.filter(username=name).exists():
            return JsonResponse({"Error": "Username is already taken."}, status=409)
        account.username = name
    if email is not None:
        if CandidateAccount.objects.filter(email=email).exists():
            return JsonResponse({"Error": "Email is already taken."}, status=409)
        account.email = email
    account.save()
    return JsonResponse({"Success": "Profile updated successfully."}, status=200)


@extend_schema(
    tags=['Candidate Profile'],
    description='Get candidate information',
    responses={
        200: OpenApiTypes.OBJECT,
        401: OpenApiTypes.OBJECT
    }
)
@api_view(['GET'])
def get_candidate_info(request, candidate_id):
    try:
        candidate = Candidate.objects.filter(id=candidate_id).first()
        if candidate is None:
            return JsonResponse({"Error": "Candidate not found."}, status=404)
        signed_in_candidate_id = request.COOKIES.get('candidate_id')
        if signed_in_candidate_id is None or uuid.UUID(signed_in_candidate_id) != uuid.UUID(candidate_id):
            # Only return public information
            return JsonResponse({"name": candidate.first_name + " " + candidate.last_name,
                                "email": candidate.email,
                                "phone": str(candidate.phone),
                                "location": candidate.location,
                                "country": candidate.country,
                                "title": candidate.title,
                                # "resume": candidate.resume,
                                "profile_pic": candidate.profile_pic,
                                "highlights": candidate.ai_highlights}, status=200)
        return JsonResponse({"name": candidate.first_name + " " + candidate.last_name,
                            "email": candidate.email,
                            "phone": str(candidate.phone),
                            "location": candidate.location,
                            "country": candidate.country,
                            "title": candidate.title,
                            "highlights": candidate.ai_highlights,
                            "skills": candidate.skills,
                            "highest_education": candidate.highest_education,
                            "experience_months": candidate.experience_months,
                            "resume": candidate.resume,
                            "profile_pic": candidate.profile_pic,
                            "has_original_resume": bool(candidate.original_resume_path and os.path.exists(candidate.original_resume_path)),
                            "preferred_career_types": [{"name": career.name, "id": career.id} for career in candidate.preferred_career_types.all()]}, status=200)
    except django.core.exceptions.ValidationError:
        return JsonResponse({"Error": "Candidate not found."}, status=404)


@extend_schema(
    tags=['Candidate Job Search'],
    description='Get list of available jobs. If logged in, jobs that match candidate\'s preferred career types will be prioritized.',
    parameters=[
        OpenApiParameter(name='page', type=int, description='Page number'),
        OpenApiParameter(name='page_size', type=int,
                         description='Number of items per page')
    ],
    responses={
        200: OpenApiTypes.OBJECT,
        401: OpenApiTypes.OBJECT
    }
)
@api_view(['GET'])
def get_posted_jobs(request):
    account_id = request.COOKIES.get('candidate_account_id')
    page = request.GET.get('page', 1)
    page_size = request.GET.get('page_size', 20)
    account = CandidateAccount.objects.filter(id=account_id).first()
    jobs = JobPosting.objects.filter(deleted=False)
    # TODO: rank jobs by NLP similarity, not exact match
    if account is not None:
        jobs = jobs.annotate(is_match=Case(
            When(career__in=account.candidate.preferred_career_types.all(), then=True),
            default=False,
            output_field=BooleanField()
        ))
    else:
        jobs = jobs.annotate(is_match=Case(
            When(pk__isnull=False, then=True),
            default=True,
            output_field=BooleanField()
        ))
    jobs = jobs.values('id',
                       'company',
                       'level',
                       'career__name',
                       'yoe',
                       'company__name',
                       'company__logo',
                       'company__location',
                       'company__country',
                       'url',
                       'is_match').order_by('-is_match', '-posted_at')
    paginator = Paginator(jobs, page_size)
    page_obj = paginator.page(page)

    return JsonResponse({
        "items": list(page_obj),
        "has_next": page_obj.has_next(),
        "has_previous": page_obj.has_previous(),
        "total_pages": paginator.num_pages,
        "current_page": page_obj.number,
        "total_count": paginator.count
    }, status=200)


@extend_schema(
    tags=['Candidate Job Search'],
    description='Get detailed information about a specific job',
    responses={
        200: OpenApiTypes.OBJECT,
        404: OpenApiTypes.OBJECT
    }
)
@api_view(['GET'])
def get_job_details(request, job_id):
    try:
        job = JobPosting.objects.filter(id=job_id).values('title',
                                                      'description',
                                                      'level',
                                                      'career__name',
                                                      'yoe',
                                                      'company__id',
                                                      'company__name',
                                                      'company__logo',
                                                      'company__location',
                                                      'company__country',
                                                      'url').first()
        if job is None:
            return JsonResponse({"Error": "Job posting not found."}, status=404)
        return JsonResponse(job, status=200)
    except django.core.exceptions.ValidationError:
        return JsonResponse({"Error": "Job posting not found."}, status=404)


@extend_schema(
    tags=['Candidate Job Search'],
    description='Get detailed information about a specific company',
    responses={
        200: OpenApiTypes.OBJECT,
        404: OpenApiTypes.OBJECT
    }
)
@api_view(['GET'])
def get_company_details(request, company_id):
    company = Company.objects.filter(id=company_id).values('name',
                                                           'logo',
                                                           'location',
                                                           'country',
                                                           'description').first()
    try:
        if company is None:
            return JsonResponse({"Error": "Company not found."}, status=404)
        return JsonResponse(company, status=200)
    except django.core.exceptions.ValidationError:
        return JsonResponse({"Error": "Company not found."}, status=404)


@extend_schema(
    tags=['Candidate Job Search'],
    description='Check if candidate is a good fit for a job using Reasoning LLM (Will take some minutes to complete)',
    request={
        'application/json': {
            'type': 'object',
            'properties': {
                'job_id': {'type': 'string', 'description': 'ID of the job to check fit for'}
            },
            'required': ['job_id']
        }
    },
    responses={
        200: OpenApiTypes.OBJECT,
        404: OpenApiTypes.OBJECT,
        400: OpenApiTypes.OBJECT
    }
)
@api_view(['POST'])
def check_fit(request):
    candidate_id = request.COOKIES.get('candidate_id')
    candidate = Candidate.objects.filter(id=candidate_id).first()
    job_id = request.data.get('job_id')
    job = JobPosting.objects.filter(id=job_id).first()
    if job is None:
        return JsonResponse({"Error": "Job not found."}, status=404)
    if candidate is None:
        return JsonResponse({"Error": "Session expired. Please log in again."}, status=401)
    try:
        response = am_i_a_match(candidate, job)
    except Exception as e:
        return JsonResponse({"Error": str(e)}, status=400)

    return JsonResponse({"Success": response}, status=200)
