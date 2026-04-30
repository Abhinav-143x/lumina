from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReminderScheduleViewSet, ReminderLogViewSet, UserNotificationPreferencesViewSet

router = DefaultRouter()
router.register(r'schedules', ReminderScheduleViewSet, basename='reminderschedule')
router.register(r'logs', ReminderLogViewSet, basename='reminderlog')
router.register(r'preferences', UserNotificationPreferencesViewSet, basename='usernotificationpreferences')

urlpatterns = [
    path('', include(router.urls)),
]