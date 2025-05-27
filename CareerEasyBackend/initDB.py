from datetime import datetime
import json
import re
from django.db import IntegrityError, transaction
from tqdm import tqdm
from django.db import connection

from CareerEasy.constants import *
from CareerEasyBackend.careereasy_utils import extract_from_resume
from CareerEasyBackend.models import *
from CareerEasyBackend.Candidate.models import CandidateAccount
from CareerEasy.llm_utils import llm_request
import random
import pandas as pd

S3_BASE_URL = "https://careereasy-assets.s3.ca-central-1.amazonaws.com/{n}.png"


def init_category():
    for c in COMPANY_CAREERS.keys():
        category = CompanyCategory(name=c, )
        category.save()


def init_company():
    for c in FAKE_COMPANY_NAMES.keys():
        for generated_name in random.choices(COMPANY_NAME_COMPONENTS, k=10):
            company_name = generated_name + random.choice(FAKE_COMPANY_NAMES[c])
            company_country = "Canada" if random.random() >= 2 / 3 else "United States"
            company_location = random.choices(*(LOCATION_WITH_WEIGHT[company_country]))[0]
            company = Company(name=company_name,
                              category=CompanyCategory.objects.get(name=c),
                              logo=S3_BASE_URL.format(n="c" + str(random.randint(1, 7))),
                              location=company_location,
                              country=company_country)
            try:
                company.save()
            except IntegrityError:
                print(company_name, c)
                continue


def init_careers():
    for c in COMPANY_CAREERS.keys():
        if c == "General":
            for general_career in COMPANY_CAREERS[c]:
                new_career = Career.objects.filter(name=general_career)
                if not new_career:
                    new_career = Career(name=general_career)
                    new_career.save()
                else:
                    new_career = new_career[0]
                
                for c2 in COMPANY_CAREERS.keys():
                    if c2 not in ["General", "High school"]:
                        career_category = CareerCategory(career=new_career, category=CompanyCategory.objects.get(name=c2))
                        career_category.save()
        else:
            for new_career in COMPANY_CAREERS[c]:
                career = Career.objects.filter(name=new_career)
                if not career:
                    career = Career(name=new_career)
                    career.save()
                else:
                    career = career[0]
                career_category = CareerCategory(career=career, category=CompanyCategory.objects.get(name=c))
                career_category.save()  


def init_candidates():
    candidates = pd.read_csv("CareerEasy/resume/candidate_info.csv")
    for row in candidates.iterrows():
        candidate = row[1]
        first, last = candidate['filename'].replace("_1", "").split("_")
        candidate_country = "Canada" if random.random() >= 2 / 3 else "United States"
        candidate_location = random.choices(*(LOCATION_WITH_WEIGHT[candidate_country]))[0]
        c = Candidate(first_name=first,
                      last_name=last,
                      email=candidate["email"],
                      phone=candidate["phone"],
                      profile_pic=S3_BASE_URL.format(n=random.randint(1, 10)),
                      location=candidate_location,
                      country=candidate_country,
                      resume=open(f"CareerEasy/resume/{candidate['filename']}_resume.md").read())
        c.save()
        c.preferred_career_types.add(Career.objects.get(name=candidate["career"]))


def ai_candidate_info():
    candidates = Candidate.objects.all()
    for candidate in tqdm(candidates):
        if candidate.experience_months is not None and candidate.skills is not None and candidate.ai_highlights is not None and candidate.highest_education is not None:
            continue
        print(candidate.first_name + " " + candidate.last_name)
        candidate_info = extract_from_resume(candidate)
        candidate.experience_months = candidate_info["exp_month"]
        candidate.skills = candidate_info["skills"]
        candidate.ai_highlights = candidate_info["ai_highlights"]
        candidate.highest_education = candidate_info["highest_education"]
        candidate.save()
        
def init_candidate_title():
    candidates = Candidate.objects.all()
    for candidate in candidates:
        if candidate.title is not None:
            continue
#        print(candidate.first_name + " " + candidate.last_name)
        candidate.title = candidate.preferred_career_types.first().name
        candidate.save()
        
def init_candidate_standardized(standarize_fn = STANDARDIZE_FN):
    candidates = Candidate.objects.all()
    for candidate in candidates:
        candidate.standardized_title = standarize_fn(candidate.title)
        candidate.standardized_skills = [standarize_fn(skill) for skill in candidate.skills] if candidate.skills is not None else None
        candidate.standardized_ai_highlights = [standarize_fn(highlight) for highlight in candidate.ai_highlights] if candidate.ai_highlights is not None else None
        candidate.standardized_highest_education = standarize_fn(candidate.highest_education)
        candidate.standardized_resume = standarize_fn(candidate.resume)
        candidate.save()
        
def init_job_posting():
    jobs_df = pd.read_csv("CareerEasy/jobs/job_info.csv")
    for _, row in tqdm(jobs_df.iterrows()):
        print(row["company"])
        company = Company.objects.filter(name=row["company"]).first()
        if company is None:
            print(row["company"])
            continue
        career = Career.objects.filter(name=row["position"]).first()
        if career is None:
            print(row["position"])
            continue
        match row["level"]:
            case "ng":
                job_level = "new graduate"
                yoe = 0
            case "j":
                job_level = "junior"
                yoe = random.randint(0, 3)
            case "s":
                job_level = "senior"
                yoe = random.randint(3, 10)
            case "u":
                job_level = "unspecified"
                yoe = random.randint(1, 10) * random.randint(0, 1)
        if job_level != "unspecified":
            title = job_level + " " + row["position"] if random.random() >= 0.5 else row["position"]
        else:
            title = row["position"]
        job = JobPosting(title=title,
                         description=open(f"CareerEasy/{row['description']}").read(),
                         level=job_level,
                         yoe=yoe,
                         company=company,
                         career=career,
                         url=row["url"],
                         posted_at = datetime.strptime(row["posted_date"], "%Y-%m-%d"))
        job.save()
        
def init_job_posting_yoe():
    for job in JobPosting.objects.all():
        match job.level:
            case "ng":
                yoe = 0
            case "j":
                yoe = random.randint(0, 3)
            case "s":
                yoe = random.randint(3, 10)
            case "u":
                yoe = random.randint(1, 10) * random.randint(0, 1)
        job.yoe = yoe   
        job.save()
        
def init_encryption():
    candidates = Candidate.objects.all()
    for candidate in tqdm(candidates):
        candidate.encrypted_first_name = candidate.first_name
        candidate.encrypted_last_name = candidate.last_name
        candidate.encrypted_email = str(candidate.email)
        candidate.encrypted_phone = str(candidate.phone)
        candidate.encrypted_middle_name = candidate.middle_name
        candidate.encrypted_profile_pic = candidate.profile_pic
        candidate.encrypted_original_resume = candidate.anonymous_resume
        candidate.encrypted_skills = json.dumps(candidate.skills)
        candidate.encrypted_ai_highlights = json.dumps(candidate.ai_highlights)
        candidate.encrypted_standardized_skills = json.dumps(candidate.standardized_skills)
        candidate.encrypted_standardized_ai_highlights = json.dumps(candidate.standardized_ai_highlights)
        candidate.save()
    queries = Query.objects.all()
    for query in tqdm(queries):
        query.encrypted_query = query.query
        query.encrypted_standardized_query = query.standardized_query
        query.encrypted_query_response = json.dumps(query.query_response)
        query.save()
        
def delete_candidates():
    """
    Safely delete all candidate records by handling foreign key relationships first.
    This function:
    1. Deletes CandidateAccount records that reference the candidates
    2. Clears the many-to-many relationships with Career
    3. Finally deletes the Candidate records
    """
    with connection.cursor() as cursor:
        # 1. Delete CandidateAccount records
        cursor.execute("DELETE FROM CareerEasyBackend_candidateaccount;")
        
        # 2. Clear the many-to-many relationships
        cursor.execute("DELETE FROM CareerEasyBackend_candidate_preferred_career_types;")
        
        # 3. Delete Candidate records
        cursor.execute("DELETE FROM CareerEasyBackend_candidate;")
        
        # Reset the sequence if using PostgreSQL
        cursor.execute("ALTER SEQUENCE CareerEasyBackend_candidate_id_seq RESTART WITH 1;")
        cursor.execute("ALTER SEQUENCE CareerEasyBackend_candidateaccount_id_seq RESTART WITH 1;")


def load_json_backup():
    # Read the JSON file
    with open('data.json', 'r') as f:
        data = json.load(f)
    
    # Filter for Candidate model entries
    candidate_entries = [entry for entry in data if entry['model'] == 'CareerEasyBackend.candidate']
    
    # Use transaction to ensure atomicity
    with transaction.atomic():
        for entry in tqdm(candidate_entries):
            fields = entry['fields']
            
            # Create Candidate instance
            candidate = Candidate(
                id=uuid.UUID(entry['pk']),
                first_name=fields['first_name'],
                middle_name=fields.get('middle_name'),
                last_name=fields['last_name'],
                email=fields.get('email'),
                phone=fields.get('phone'),
                title=fields.get('title'),
                location=fields['location'],
                country=fields['country'],
                resume=fields.get('resume'),
                profile_pic=fields.get('profile_pic'),
                ai_highlights=fields.get('ai_highlights'),
                experience_months=fields.get('experience_months', 0),
                highest_education=fields.get('highest_education'),
                skills=fields.get('skills'),
                standardized_title=fields.get('standardized_title'),
                standardized_skills=fields.get('standardized_skills'),
                standardized_ai_highlights=fields.get('standardized_ai_highlights'),
                standardized_highest_education=fields.get('standardized_highest_education'),
                standardized_resume=fields.get('standardized_resume'),
                anonymous_resume=fields.get('resume'),
                created_at=fields.get('created_at', timezone.now()),
                updated_at=fields.get('updated_at', timezone.now()),
                deleted=fields.get('deleted', False)
            )
            
            # Save the candidate to ensure proper encryption
            candidate.save()
            
            # Add preferred career types
            if 'preferred_career_types' in fields:
                for career_id in fields['preferred_career_types']:
                    try:
                        career = Career.objects.get(id=career_id)
                        candidate.preferred_career_types.add(career)
                    except Career.DoesNotExist:
                        print(f"Career with ID {career_id} not found")
            
        account_entries = [e for e in data if e['model'] == 'CareerEasyBackend.candidateaccount']
        for account_entry in tqdm(account_entries):
            account_fields = account_entry['fields']
            candidate = Candidate.objects.get(id=account_fields['candidate'])
            account = CandidateAccount(
                id=uuid.UUID(account_entry['pk']),
                username=account_fields['username'],
                email=account_fields['email'],
                password=account_fields['password'],  # Password should already be hashed
                candidate=candidate
            )
            account.save()
            
        queries = [e for e in data if e['model'] == 'CareerEasyBackend.query']
        for query_entry in tqdm(queries):
            query_fields = query_entry['fields']
            query = Query(
                id=uuid.UUID(query_entry['pk']),
                query=query_fields['query'],
                query_response=query_fields['query_response'],
                standardized_query=query_fields['standardized_query'],
                created_at=query_fields['created_at'],
                updated_at=query_fields['updated_at']
            )
            query.save()
                
if __name__ == '__main__':
    pass
        