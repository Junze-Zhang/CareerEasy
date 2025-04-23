import uuid
from django.db import models
from CareerEasyBackend.models import Company


class EmployerAccount(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = models.CharField(max_length=100, unique=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=100)
    company = models.ForeignKey(
        Company, on_delete=models.CASCADE, null=True, blank=True)
