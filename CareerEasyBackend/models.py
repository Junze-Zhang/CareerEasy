import uuid
from django.db import models
from django.db.models import UniqueConstraint
from phonenumber_field.modelfields import PhoneNumberField

NEW_GRADUATE = "ng"
JUNIOR = "j"
INTERMEDIATE = "i"
SENIOR = "s"
UNSPECIFIED = "u"
LEVEL_CHOICES = [
    (NEW_GRADUATE, "new graduate"),
    (JUNIOR, "junior"),
    (INTERMEDIATE, "intermediate"),
    (SENIOR, "senior"),
    (UNSPECIFIED, "unspecified"),
]


class CompanyCategory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)


class Company(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    category = models.ForeignKey(CompanyCategory, on_delete=models.CASCADE)
    logo = models.URLField(blank=True, null=True)
    location = models.CharField(max_length=100)
    country = models.CharField(max_length=100)

    class Meta:
        constraints = [
            UniqueConstraint(
                fields=["category", "name", "location"], name="no_company_name_collision"),
        ]


class Career(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)


class CareerCategory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    career = models.ForeignKey(Career, on_delete=models.CASCADE)
    category = models.ForeignKey(CompanyCategory, on_delete=models.CASCADE)

    class Meta:
        constraints = [
            UniqueConstraint(fields=["category", "career"],
                             name="unique_career_category_career"),
        ]


class Candidate(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    first_name = models.CharField(max_length=100)
    middle_name = models.CharField(max_length=100, null=True, blank=True)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(null=True)
    phone = PhoneNumberField(null=True)
    title = models.CharField(max_length=100, null=True, blank=True)
    preferred_career_types = models.ManyToManyField(Career)
    location = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    resume = models.TextField(blank=True, null=True) # TODO: change to Amazon S3 file path
    profile_pic = models.URLField(blank=True, null=True)
    ai_highlights = models.JSONField(blank=True, null=True)
    experience_months = models.IntegerField(default=0)
    highest_education = models.CharField(max_length=100, null=True, blank=True)
    skills = models.JSONField(blank=True, null=True)

    standardized_title = models.CharField(max_length=100, null=True, blank=True)
    standardized_skills = models.JSONField(blank=True, null=True)
    standardized_ai_highlights = models.JSONField(blank=True, null=True)
    standardized_highest_education = models.CharField(max_length=100, null=True, blank=True)
    standardized_resume = models.TextField(blank=True, null=True)
    
    

class JobPosting(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    title = models.CharField(max_length=100)
    career = models.ForeignKey(Career, on_delete=models.CASCADE)
    level = models.CharField(choices=LEVEL_CHOICES, max_length=2)
    description = models.TextField(blank=True, null=True)
    yoe = models.IntegerField(default=0, blank=True, null=True)
    url = models.URLField(blank=True, null=True)
    posted_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted = models.BooleanField(default=False)


class ApplicantAccount(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=100)
    candidate = models.ForeignKey(
        Candidate, on_delete=models.CASCADE, null=True, blank=True)
