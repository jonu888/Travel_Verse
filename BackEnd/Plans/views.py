from django.shortcuts import render
from Plans.models import Plan
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from django.utils import timezone
from django.db.models import Q
from django.contrib.auth.models import User
from rest_framework import generics
from rest_framework.views import APIView

from Plans.models import Plan
from Plans.serializers import PlanSerializer

class PlanViewSet(viewsets.ModelViewSet):
    queryset = Plan.objects.all()
    serializer_class = PlanSerializer
    permission_classes = [IsAuthenticated]  # Require authentication

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)  # Automatically set the authenticated user

    def get_queryset(self):
        return Plan.objects.filter(user=self.request.user)  # Optional: Restrict to current user