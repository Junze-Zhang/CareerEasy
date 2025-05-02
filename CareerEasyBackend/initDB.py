from datetime import datetime
import re
from django.db import IntegrityError
from tqdm import tqdm

from CareerEasy.constants import *
from CareerEasyBackend.careereasy_utils import extract_from_resume
from CareerEasyBackend.models import *
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
        print(candidate.first_name + " " + candidate.last_name)
        candidate.title = candidate.preferred_career_types.first().name
        candidate.save()
        
def init_candidate_standardized(standarize_fn = lambda x: re.sub(r'[^a-zA-Z0-9\s]', '', x).lower()):
    candidates = Candidate.objects.all()
    for candidate in candidates:
        candidate.standardized_title = standarize_fn(candidate.title)
        candidate.standardized_skills = [standarize_fn(skill) for skill in candidate.skills]
        candidate.standardized_ai_highlights = [standarize_fn(highlight) for highlight in candidate.ai_highlights]
        candidate.standardized_highest_education = standarize_fn(candidate.highest_education)
        candidate.standardized_resume = standarize_fn(candidate.resume)
        candidate.save()
        
        
        