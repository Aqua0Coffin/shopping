from django.urls import path
from .views import create_razorpay_order, verify_payment

urlpatterns = [
    path('create-order/', create_razorpay_order),
    path('verify-payment/', verify_payment),
]