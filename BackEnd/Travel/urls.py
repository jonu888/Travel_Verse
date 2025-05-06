from django.urls import path
from . import views
from rest_framework.routers import DefaultRouter
from user_application.views import UserProfileView, RegisterView, LoginView, LogoutView


router = DefaultRouter()
# Add your viewset routes here if needed

urlpatterns = [
    path('api/test/', views.test_api, name='test_api'),
    path('api/register/',RegisterView.as_view(), name='register'),
    path('api/login/',LoginView.as_view(), name='login'),
    path('api/logout/',LogoutView.as_view(), name='logout'),
    path('api/profile/',UserProfileView.as_view(), name='profile'),

    path('api/search/', views.search_destinations, name='search_destinations'),
    # Add more API endpoints here

    
]

urlpatterns += router.urls