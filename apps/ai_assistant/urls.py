from django.urls import path
from .views import chat, plan_day

urlpatterns = [
    path("chat/", chat),
    path("plan-day/", plan_day),
]
