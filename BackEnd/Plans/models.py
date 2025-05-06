from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class Plan(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    destination = models.CharField(max_length=255)
    start_date = models.DateField()
    end_date = models.DateField()
    activities = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    statuses = (
        ('draft', 'Draft'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )
    status = models.CharField(max_length=20, choices=statuses, default='draft')

    notes = models.TextField(blank=True, null=True)  
    duration = models.IntegerField(default=0, null=True, blank=True)  
    budget = models.PositiveBigIntegerField(default=0)  

    def __str__(self):
        return f"{self.destination} ({self.start_date} - {self.end_date})"