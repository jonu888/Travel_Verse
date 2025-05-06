# filepath: c:\Users\josan\OneDrive\Desktop\PRO\BackEnd\user_application\urls.py
from django.urls import path
from user_application.views import ForgotPasswordView, OtpVerifyView, ResetPasswordView

urlpatterns = [
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('otp-verify/', OtpVerifyView.as_view(), name='otp-verify'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset-password'),
]