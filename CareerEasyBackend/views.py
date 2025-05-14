from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
from rest_framework.decorators import api_view

from CareerEasyBackend.models import *
# Create your views here.

@api_view(["GET"])
def get_careers(request):
    careers = Career.objects.values("id", "name").all()
    return JsonResponse(list(careers), safe=False)