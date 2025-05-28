from CareerEasy.llm_utils import llm_request
from CareerEasyBackend.models import Candidate, JobPosting
from CareerEasy.constants import *
from django.conf import settings
from django.core.management import call_command
import django
from datetime import datetime
import json
import os
import re
from typing import Union, Dict, Tuple
import numpy as np
from openai import OpenAI
from django.db.models import QuerySet
from presidio_analyzer import AnalyzerEngine
from presidio_anonymizer import AnonymizerEngine
from presidio_anonymizer.entities import OperatorConfig
from presidio_analyzer.nlp_engine import NlpEngineProvider


os.environ.setdefault("DJANGO_SETTINGS_MODULE", "CareerEasy.settings")


django.setup()


def validate_exp(response: str) -> bool:
    try:
        response = json.loads(response)
        if "error" in response:
            return True
        return isinstance(response["experience_months"], int) \
            and response["highest_education"].lower() in ["bachelor", "master", "phd", "high school",
                                                          "below high school", "other"]
    except:
        return False


def validate_skills(response: str) -> bool:
    try:
        response = json.loads(response)
        return isinstance(response["skills"], list)
    except:
        return False


def validate_ai_highlights(response: str) -> bool:
    try:
        response = json.loads(response)
        return "Error" in response or (isinstance(response["highlights"], list) and len(response["highlights"]) == NUM_AI_HIGHLIGHTS)
    except:
        return False


def extract_from_resume(candidate: Candidate) -> dict:
    llm_client = OpenAI(api_key=os.getenv(
        "DEEPSEEK_API_KEY"), base_url=DEEPSEEK_API_URL)
    candidate_info = {
        "exp_month": None,
        "skills": None,
        "ai_highlights": None,
        "highest_education": None,
    }
    today_month = datetime.now().strftime("%B %Y")
    prompt_exp = PROMPT_CANDIDATE_EXP.format(resume=candidate.anonymous_resume,
                                             today_month=today_month)
    messages = [{"role": "user", "content": prompt_exp}]
    response = llm_request(llm_client,
                           messages=messages,
                           validate_fn=validate_exp,
                           model="deepseek-reasoner",
                           return_raw=True)
    if not response:
        raise ValueError("Failed to extract experience from resume.")
    if "error" in response:
        raise ValueError(json.loads(response)["error"])
    if settings.DEBUG:
        with open(f".debug/{candidate.id}.txt", "w") as f:
            f.write(f"Prompt: {prompt_exp}\n")
            f.write(f"Reasoning: {response.reasoning_content}\n")
            f.write(f"Response: {response.content}\n\n")
    response_json = json.loads(response.content)
    candidate_info["exp_month"] = response_json["experience_months"]
    candidate_info["highest_education"] = response_json["highest_education"]
    messages.append({"role": "assistant", "content": response.content})
    messages.append({"role": "user", "content": PROMPT_CANDIDATE_SKILLS})
    response = llm_request(llm_client,
                           messages=messages,
                           validate_fn=validate_skills,
                           model="deepseek-reasoner",
                           return_raw=True)
    if not response:
        raise ValueError("Failed to extract skills from resume.")
    if settings.DEBUG:
        with open(f".debug/{candidate.id}.txt", "a") as f:
            f.write(f"Prompt: {PROMPT_CANDIDATE_SKILLS}\n")
            f.write(f"Reasoning: {response.reasoning_content}\n")
            f.write(f"Response: {response.content}\n\n")
    candidate_info["skills"] = json.loads(response.content)["skills"]
    messages.append({"role": "assistant", "content": response.content})
    prompt_ai_highlights = PROMPT_CANDIDATE_AI_HIGHLIGHTS.format(
        num_highlights=NUM_AI_HIGHLIGHTS)
    messages.append({"role": "user", "content": prompt_ai_highlights})
    response = llm_request(llm_client,
                           messages=messages,
                           validate_fn=validate_ai_highlights,
                           model="deepseek-reasoner",
                           return_raw=True)
    if not response:
        raise ValueError("Failed to extract highlights from resume.")
    if settings.DEBUG:
        with open(f".debug/{candidate.id}.txt", "a") as f:
            f.write(f"Prompt: {prompt_ai_highlights}\n")
            f.write(f"Reasoning: {response.reasoning_content}\n")
            f.write(f"Response: {response.content}\n\n")
    candidate_info["ai_highlights"] = json.loads(response.content)[
        "highlights"]
    return candidate_info

def update_ai_highlights(candidate: Candidate, custom_prompt: str) -> dict:
    llm_client = OpenAI(api_key=os.getenv(
        "DEEPSEEK_API_KEY"), base_url=DEEPSEEK_API_URL)
    prompt = PROMPT_CANDIDATE_AI_HIGHLIGHTS_CUSTOMIZE.format(
        num_highlights=NUM_AI_HIGHLIGHTS,
        resume=candidate.anonymous_resume,
        candidate_prompt=custom_prompt
    )
    if settings.DEBUG:
        print(prompt)
    messages = [{"role": "user", "content": prompt}]
    response = llm_request(llm_client,
                           messages=messages,
                           validate_fn=validate_ai_highlights,
                           model="deepseek-reasoner")
    if not response:
        raise ValueError("Failed to update ai highlights. Please try again later.")
    response = json.loads(response)
    if "error" in response:
        raise ValueError(response["error"])
    return response["highlights"]

def validate_query(response: str) -> bool:
    try:
        response = json.loads(response)
        if "error" in response:
            return True
        return isinstance(response["minimal_years_of_experience"], int) and isinstance(
            response["maximal_years_of_experience"], int) and isinstance(response["preferred_title_keywords"],
                                                                         list) and isinstance(
            response["high_priority_keywords"], list) and isinstance(response["low_priority_keywords"], list)
    except:
        return False


def natural_language_to_query(natural_language_query: str) -> dict:
    """
    Convert a natural language query to a SQL query using an LLM.
    Returns a dict with the following keys:
    - minimal_years_of_experience: int
    - maximal_years_of_experience: int
    - preferred_title_keywords: list
    - high_priority_keywords: list
    - low_priority_keywords: list
    """
    prompt = PROMPT_NLQ.format(query=natural_language_query)
    llm_client = OpenAI(api_key=os.getenv(
        "DEEPSEEK_API_KEY"), base_url=DEEPSEEK_API_URL)
    messages = [{"role": "user", "content": prompt}]
    response = llm_request(llm_client,
                           messages=messages,
                           validate_fn=validate_query)
    if not response:
        raise ValueError("Search failed.")
    if "error" in response:
        raise ValueError(json.loads(response)["error"])
    response_json = json.loads(response)
    response_json["preferred_title_keywords"] = [re.sub(
        r'[^a-zA-Z0-9\s]', '', keyword).lower() for keyword in response_json["preferred_title_keywords"]]
    response_json["high_priority_keywords"] = [re.sub(
        r'[^a-zA-Z0-9\s]', '', keyword).lower() for keyword in response_json["high_priority_keywords"]]
    response_json["low_priority_keywords"] = [re.sub(
        r'[^a-zA-Z0-9\s]', '', keyword).lower() for keyword in response_json["low_priority_keywords"]]
    return response_json


# def _match_experience(query: dict, candidates) -> list:
#     min_months = query.get('minimal_years_of_experience', 0) * 12
#     max_months = query.get('maximal_years_of_experience', 100) * 12
#     candidates = candidates.annotate(
#         # Base score: every year of experience is worth 1 point, max 10
#         experience_base_score=Case(
#             When(
#                 experience_months__gte=120,  # 10 years
#                 then=Value(10)
#             ),
#             default=F('experience_months') /
#             Value(12),  # Convert months to years
#             output_field=FloatField()
#         ),
#         # Experience match score: as follows, max 100
#         experience_match_score=Case(
#             # Perfect match (within 3 months)
#             When(
#                 experience_months__gte=min_months - 3,
#                 experience_months__lte=max_months + 3,
#                 then=Value(100)
#             ),
#             # Overqualified; decrease 50 points if overqualified by 2 times (else linearly decrease up to 50);
#             # also decrease 10 points per year overqualified
#             When(
#                 experience_months__gt=max_months,
#                 then=ExpressionWrapper(
#                     Value(50) * Case(
#                         When(
#                             experience_months__gt=Value(max_months * 2),
#                             then=Value(0)
#                         ),
#                         default=Value(2) - F('experience_months') /
#                         Value(max_months),
#                         output_field=FloatField()
#                     ) + Value(50) - Value(10) * (F('experience_months') - Value(max_months)) / Value(12),
#                     output_field=FloatField()
#                 )
#             ),
#             # Underqualified; scale linearly between 0 and 80
#             When(
#                 experience_months__lt=min_months,
#                 then=ExpressionWrapper(
#                     Value(80) - Value(80) * (Value(min_months) -
#                                              F('experience_months')) / Value(min_months),
#                     output_field=FloatField()
#                 )
#             ),
#             # Default case: only possible if min_months>max_months
#             default=Value(100),
#             output_field=FloatField()
#         )
#     ).annotate(
#         # Final experience score = base score + match score * 0.9
#         experience_score=ExpressionWrapper(
#             F('experience_base_score') + Value(0.9) *
#             F('experience_match_score'),
#             output_field=FloatField()
#         )
#     )
#     return candidates


# def _match_title(query: dict, candidates) -> list:
#     query = SearchQuery(query['preferred_title_keywords'])
#     candidates = candidates.annotate(
#         title_match_score=SearchRank(F('title'), query, )
#     )
#     return candidates

# def _match_candidate_info(query: dict, candidates) -> list:
#     query_high = SearchQuery(query['high_priority_keywords'])
#     query_low = SearchQuery(query['low_priority_keywords'])
#     search_vector = SearchVector('title', 'skills', 'ai_highlights', 'highest_education')
#     candidates = candidates.annotate(
#         high_priority_match_score=SearchRank(F('title'), query_high),
#         low_priority_match_score=SearchRank(F('title'), query_low)
#     )
#     return candidates


def _match_score(query: dict, candidate: Dict, return_raw: bool = False) -> Union[Dict, float]:
    experience_score = 0
    title_score = 0
    skills_score = [0, 0]
    ai_highlights_score = [0, 0]
    resume_score = [0, 0]

    candidate_exp_months = candidate['experience_months']
    min_months = query.get('minimal_years_of_experience', 0) * 12
    max_months = query.get('maximal_years_of_experience', 100) * 12
    if min_months > max_months:
        min_months, max_months = max_months, min_months
    if min_months - 3 <= candidate_exp_months <= max_months + 3:  # Perfect match; 3-month margin of error
        experience_score = 100
    elif candidate_exp_months > max_months:  # overqualified
        if max_months == 0:
            experience_score = 0
        else:
            # deduct 50 points if candidate has 2x more than max required (else linearly);
            # also deduct 10 points for each year exceeded (max 50)
            experience_score = max((50 * (2 - candidate_exp_months / max_months)), 0) + \
                max(50 - 10 * (candidate_exp_months - max_months) / 12, 0)
    else:  # underqualified; scale experience score linearly up to 80
        experience_score = (min_months -
                            candidate_exp_months) / min_months * 80
    # 90% weight on experience match score
    # 10% weight on base score: 10 point for every year of experience, max 100
    experience_score = experience_score * 0.9 + \
        min(candidate_exp_months / 12 * 10, 100) * 0.1

    # Title matching score: if any of preferred title matches the candidate, they get a score of 100
    query_preferred_title_keywords = query.get('preferred_title_keywords', [])
    for keyword in query_preferred_title_keywords:
        if keyword in candidate['standardized_title']:
            title_score = 100
            break

    # Keyword-matching scores are the recall percentages of every preferred keyword in candidate data
    query_high_priority_keywords = query.get('high_priority_keywords', [])
    query_low_priority_keywords = query.get('low_priority_keywords', [])
    if candidate['standardized_skills']:
        for keyword in query_high_priority_keywords:
            if keyword in candidate['standardized_skills']:
                skills_score[0] += 1
        if candidate['standardized_ai_highlights']:
            for highlight in candidate['standardized_ai_highlights']:
                if keyword in highlight:
                    ai_highlights_score[0] += 1
        if candidate['standardized_anonymous_resume']:
            if keyword in candidate['standardized_anonymous_resume']:
                resume_score[0] += 1
    skills_score[0] = skills_score[0] / \
        len(query_high_priority_keywords) * \
        100 if query_high_priority_keywords else 0
    ai_highlights_score[0] = ai_highlights_score[0] / \
        len(query_high_priority_keywords) * \
        100 if query_high_priority_keywords else 0
    resume_score[0] = resume_score[0] / \
        len(query_high_priority_keywords) * \
        100 if query_high_priority_keywords else 0

    for keyword in query_low_priority_keywords:
        if candidate['standardized_skills']:
            if keyword in candidate['standardized_skills']:
                skills_score[1] += 1
        if candidate['standardized_ai_highlights']:
            for highlight in candidate['standardized_ai_highlights']:
                if keyword in highlight:
                    ai_highlights_score[1] += 1
        if candidate['standardized_anonymous_resume']:
            if keyword in candidate['standardized_anonymous_resume']:
                resume_score[1] += 1
    skills_score[1] = skills_score[1] / \
        len(query_low_priority_keywords) * \
        100 if query_low_priority_keywords else 0
    ai_highlights_score[1] = ai_highlights_score[1] / \
        len(query_low_priority_keywords) * \
        100 if query_low_priority_keywords else 0
    resume_score[1] = resume_score[1] / \
        len(query_low_priority_keywords) * \
        100 if query_low_priority_keywords else 0

    if return_raw:
        return {
            "experience_score": experience_score,
            "title_score": title_score,
            "skills_score": skills_score,
            "ai_highlights_score": ai_highlights_score,
            "resume_score": resume_score
        }
    return float(np.average([experience_score,
                             title_score,
                             *skills_score,
                             *ai_highlights_score,
                             *resume_score], weights=[
        10,
        10,
        5,
        2,
        5,
        2,
        2.5,
        1
    ]))


def rank_candidates(query: dict, candidates: list[Dict]) -> list[Tuple[Dict, float]]:
    candidates_with_score = [{**candidate, 
                              "id": str(candidate['id']), 
                              "name": candidate['first_name'] + " " + (candidate['middle_name'][0]+". " if candidate['middle_name'] else "") + candidate['last_name'],
                              "match_score": _match_score(query, candidate)} 
                              for candidate in candidates]
    return sorted(candidates_with_score, key=lambda x: x['match_score'], reverse=True)


def am_i_a_match(candidate: Candidate, job: JobPosting) -> bool:
    llm_client = OpenAI(api_key=os.getenv(
        "DEEPSEEK_API_KEY"), base_url=DEEPSEEK_API_URL)
    prompt = PROMPT_CHECK_FIT.format(
        company=job.company.name,
        category=job.company.category.name,
        job_title=job.title,
        job_description=job.description,
        candidate_title=candidate.title,
        highlights="\n".join(candidate.ai_highlights),
        resume=candidate.anonymous_resume
    )
    if settings.DEBUG:
        print(prompt)
    response = llm_request(llm_client,
                           messages=[{"role": "user", "content": prompt}],
                           validate_fn=lambda _: True,
                           model="deepseek-reasoner")
    if not response:
        raise ValueError("Request failed, please try again later.")
    if "error" in response:
        raise ValueError(json.loads(response)["error"])
    return response

def anonymize_resume(resume: str) -> str:
    # Configure the NLP engine with the medium model
    nlp_configuration = {
        "nlp_engine_name": "spacy",
        "models": [{"lang_code": "en", "model_name": "en_core_web_md"}]
    }
    
    # Create NLP engine provider with the configuration
    nlp_engine_provider = NlpEngineProvider(nlp_configuration=nlp_configuration)
    nlp_engine = nlp_engine_provider.create_engine()
    
    # Create analyzer with the configured NLP engine
    analyzer = AnalyzerEngine(nlp_engine=nlp_engine)
    anonymizer = AnonymizerEngine()
    resume_lower = resume.lower()
    if "skills" in resume_lower:
        skills_idx = resume_lower.index("skills")
    else:
        skills_idx = 2147483647
    if "experience" in resume_lower:
        experience_idx = resume_lower.index("experience")
    else:
        experience_idx = 2147483647
    if "project" in resume_lower:
        project_idx = resume_lower.index("project")
    else:
        project_idx = 2147483647
    if "education" in resume_lower:
        education_idx = resume_lower.index("education")
    else:
        education_idx = 2147483647
    personal_info_idx = min(skills_idx, experience_idx, project_idx, education_idx)
    resume_personal_info = resume[:personal_info_idx]
    resume_other = resume[personal_info_idx:]
    results = analyzer.analyze(
        text=resume_personal_info.lower(),
            entities=[
                "PERSON",
                "EMAIL_ADDRESS",
                "PHONE_NUMBER",
                "SSN",
                "CREDIT_CARD",
                "URL",
                "LOCATION"
            ],
        language='en',
        allow_list=open("technical_terms.txt", "r").read().split(",")
    )
    anonymized_personal_info = anonymizer.anonymize(
        text=resume_personal_info,
        analyzer_results=results,
        operators={
            "PHONE_NUMBER": OperatorConfig(
                "replace",
                {"new_value": "XXX-XXX-XXXX"}
            ),
            "EMAIL_ADDRESS": OperatorConfig(
                "replace",
                {"new_value": "<email>"}
            ),
            "PERSON": OperatorConfig(
                "replace",
                {"new_value": "<name>"}
            ),
            "URL": OperatorConfig(
                "replace",
                {"new_value": "<url>"}
            ),
            "LOCATION": OperatorConfig(
                "replace",
                {"new_value": "Anytown, Anycountry"}
            ),
            "CREDIT_CARD": OperatorConfig(
                "replace",
                {"new_value": "XXXX-XXXX-XXXX-XXXX"}
            ),
            "SSN": OperatorConfig(
                "replace",
                {"new_value": "XXX-XX-XXXX"}
            )
        }
    )
    
    return anonymized_personal_info.text + resume_other


if __name__ == "__main__":
    candidate = Candidate.objects.order_by("?").first()
    # print(extract_from_resume(candidate))
    query = natural_language_to_query("New graduate Python developer")
    print(query)
    rank = rank_candidates(query, Candidate.objects.all())
    for candidate, match in rank:
        print(candidate.experience_months, candidate.title,
              candidate.ai_highlights[2], match)
