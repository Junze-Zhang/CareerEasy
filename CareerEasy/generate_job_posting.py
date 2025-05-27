import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'CareerEasy.settings.prod')
django.setup()

import datetime
import random
import uuid

from openai import OpenAI
from tqdm import tqdm

from CareerEasyBackend.models import Company, CareerCategory, JobPosting, NEW_GRADUATE, JUNIOR, SENIOR, UNSPECIFIED
from constants import *
from llm_utils import llm_request

NUM_COMPANY_HIRING = 30
PRINT_FIRST_PROMPT = True
levels = {"new graduate ": NEW_GRADUATE, "junior ": JUNIOR, "senior ": SENIOR, "": UNSPECIFIED}
level_weights = [2, 4, 3, 5]

job_posting_prompt = """You are a hiring manager at {company_name}, a {company_category} company based in {company_location}, {company_country}. Your company is hiring a {job_level}{job_title}.
Please write a professional job posting for this position.
The format of the job posting should be as follows:

- Job Title
- Job Overview
- Job Responsibilities
- Job Requirements
- Salary and Benefits
- Company and Location

Format the posting in markdown with appropriate headers and bullet points for readability.
Do not include any text other than the job posting itself.
"""

if __name__ == "__main__":
    if not os.path.exists("jobs"):
        os.mkdir("jobs")
    if not os.path.exists("jobs/job_info.csv"):
        info = open(f"jobs/job_info.csv", "w", encoding="utf-8")
        info.write("posted_date,position,level,description,location,state,country,company,url\n")
    else:
        info = open(f"jobs/job_info.csv", "a", encoding="utf-8")

    client = OpenAI(api_key=os.getenv("DEEPSEEK_API_KEY"), base_url=DEEPSEEK_API_URL)
    companies = Company.objects.order_by("?")[:NUM_COMPANY_HIRING]
    for company in tqdm(companies):
        num_jobs_per_company = random.choices(range(1, 6),
                                              weights=[60, 30, 20, 15, 12],
                                              k=1)[0]
        new_jobs = CareerCategory.objects.filter(category=company.category).order_by("?")[:num_jobs_per_company]
        for new_job in new_jobs:
            job_level = random.choices(list(levels.keys()),
                                       weights=level_weights,
                                       k=1)[0]
            career_name = new_job.career.name
            prompt = job_posting_prompt.format(company_name=company.name,
                                               company_category=company.category.name,
                                               company_location=company.location,
                                               company_country=company.country,
                                               job_level=job_level,
                                               job_title=career_name)
            if PRINT_FIRST_PROMPT:
                print(prompt)
                PRINT_FIRST_PROMPT = False
            messages = [{"role": "user", "content": prompt}]
            job_posting = llm_request(client,
                                      messages,
                                      lambda r: career_name.lower() in r.lower() and company.name.lower() in r.lower(),
                                      "Invalid job posting: ")
            if not job_posting:
                continue
            filename = f"{company.name}_{career_name}_job_posting.md"
            filepath = "jobs/" + filename
            while os.path.exists(filepath):
                filepath = filepath.replace("_job_posting", f"_1_job_posting")
            with open(filepath, "w") as f:
                    f.write(job_posting)
            job_url = f"https://www.{company.name.lower().replace(' ', '')}.com/jobs/{str(uuid.uuid4())[-12:]}"
            info.write(f"{datetime.datetime.now().strftime('%Y-%m-%d')},"
                       f"{career_name},"
                       f"{levels[job_level]},"
                       f"{filepath},"
                       f"{company.location},"
                       f"{company.country},"
                       f"{company.name},"
                       f"{job_url}\n")
            info.flush()
            # Save the job posting to the database
            posting = JobPosting.objects.create(
                company=company,
                title=(job_level+career_name).title(),
                career=new_job.career,
                level=levels[job_level],
                description=job_posting,
                url=job_url
            )
            posting.save()

    info.close()
