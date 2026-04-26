from django.urls import path
from .views import (HabitListCreateView, HabitDetailView,
                    check_in, habit_analytics, dashboard_stats,
                    entries_for_habit, ai_habit_report)

urlpatterns = [
    path("", HabitListCreateView.as_view()),
    path("<uuid:pk>/", HabitDetailView.as_view()),
    path("<uuid:pk>/check-in/", check_in),
    path("<uuid:pk>/analytics/", habit_analytics),
    path("<uuid:pk>/entries/", entries_for_habit),
    path("dashboard/", dashboard_stats),
    path("ai-report/", ai_habit_report),
]
