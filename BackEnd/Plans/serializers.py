from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from Plans.models import Plan
from datetime import datetime

class PlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plan
        fields = [
            'id', 'user', 'destination', 'start_date', 'end_date', 'activities',
            'status', 'notes', 'budget', 'duration'
        ]
        read_only_fields = ['id', 'duration']  # Make these fields read-only

    def validate(self, data):
        if 'start_date' in data and 'end_date' in data:
            if data['start_date'] > data['end_date']:
                raise serializers.ValidationError({"end_date": "End date must be after start date."})
        if 'status' in data:
            # Normalize status to lowercase and validate against choices
            status = data['status'].lower()
            valid_statuses = [s[0] for s in Plan.statuses]  # Extract choices ('draft', 'completed', 'cancelled')
            if status not in valid_statuses:
                raise serializers.ValidationError({"status": f"\"{data['status']}\" is not a valid choice."})
            data['status'] = status  # Update with normalized value
        return data

    def create(self, validated_data):
        start_date = validated_data.get('start_date')
        end_date = validated_data.get('end_date')
        duration = (end_date - start_date).days if start_date and end_date else 0
        validated_data['duration'] = duration
        
        plan = Plan.objects.create(**validated_data)
        return plan