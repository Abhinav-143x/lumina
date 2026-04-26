from django.urls import path
from .views import EventListCreateView, EventDetailView, upcoming_events

urlpatterns = [
    path("events/", EventListCreateView.as_view()),
    path("events/<uuid:pk>/", EventDetailView.as_view()),
    path("upcoming/", upcoming_events),
]
