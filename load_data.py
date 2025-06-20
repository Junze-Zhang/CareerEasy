import json
import uuid
from django.db import transaction
from CareerEasyBackend.models import Candidate, Career
from CareerEasyBackend.Candidate.models import CandidateAccount
from bcrypt import hashpw, gensalt

def load_candidates():
    # Read the JSON file
    with open('data.json', 'r') as f:
        data = json.load(f)
    
    # Filter for Candidate model entries
    candidate_entries = [entry for entry in data if entry['model'] == 'CareerEasyBackend.candidate']
    
    # Use transaction to ensure atomicity
    with transaction.atomic():
        for entry in candidate_entries:
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
            
            # Create associated CandidateAccount if it exists
            account_entries = [e for e in data if e['model'] == 'CareerEasyBackend.candidateaccount' and e['fields'].get('candidate') == entry['pk']]
            for account_entry in account_entries:
                account_fields = account_entry['fields']
                account = CandidateAccount(
                    id=uuid.UUID(account_entry['pk']),
                    username=account_fields['username'],
                    email=account_fields['email'],
                    password=account_fields['password'],  # Password should already be hashed
                    candidate=candidate
                )
                account.save()

if __name__ == '__main__':
    load_candidates() 