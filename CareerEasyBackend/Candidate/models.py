import uuid
from django.db import models
from CareerEasyBackend.models import Candidate


class CandidateAccount(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = models.CharField(max_length=100, unique=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=100)
    candidate = models.ForeignKey(
        Candidate, on_delete=models.CASCADE, null=True, blank=True)
    