from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Q

from .models import ReminderSchedule, ReminderLog, UserNotificationPreferences, ReminderType
from .serializers import ReminderScheduleSerializer, ReminderLogSerializer, UserNotificationPreferencesSerializer


class ReminderScheduleViewSet(viewsets.ModelViewSet):
    serializer_class = ReminderScheduleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ReminderSchedule.objects.filter(user=self.request.user).select_related('event', 'habit')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get all active reminders for the current user"""
        active_reminders = self.get_queryset().filter(is_active=True, is_sent=False)
        serializer = self.get_serializer(active_reminders, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming reminders (not sent yet)"""
        now = timezone.now()
        upcoming_reminders = self.get_queryset().filter(
            is_sent=False
        ).filter(
            Q(custom_datetime__gt=now) | Q(custom_datetime__isnull=True)
        ).order_by('custom_datetime', 'created_at')
        serializer = self.get_serializer(upcoming_reminders, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def history(self, request):
        """Get reminder history (sent reminders)"""
        sent_reminders = self.get_queryset().filter(is_sent=True).order_by('-sent_at')
        serializer = self.get_serializer(sent_reminders, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a reminder"""
        reminder = self.get_object()
        reminder.is_active = False
        reminder.save()
        return Response({'status': 'cancelled'})

    @action(detail=True, methods=['post'])
    def reactivate(self, request, pk=None):
        """Reactivate a cancelled reminder"""
        reminder = self.get_object()
        if reminder.is_sent:
            return Response(
                {'error': 'Cannot reactivate a reminder that has already been sent'},
                status=status.HTTP_400_BAD_REQUEST
            )
        reminder.is_active = True
        reminder.save()
        return Response({'status': 'reactivated'})


class ReminderLogViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ReminderLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ReminderLog.objects.filter(user=self.request.user).select_related('reminder_schedule')

    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get recent reminder logs"""
        limit = min(int(request.query_params.get('limit', 20)), 100)
        recent_logs = self.get_queryset()[:limit]
        serializer = self.get_serializer(recent_logs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def failed(self, request):
        """Get failed reminder logs"""
        failed_logs = self.get_queryset().filter(status='failed')
        serializer = self.get_serializer(failed_logs, many=True)
        return Response(serializer.data)


class UserNotificationPreferencesViewSet(viewsets.ModelViewSet):
    serializer_class = UserNotificationPreferencesSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserNotificationPreferences.objects.filter(user=self.request.user)

    def get_object(self):
        """Get or create preferences for the current user"""
        obj, created = UserNotificationPreferences.objects.get_or_create(
            user=self.request.user
        )
        return obj

    @action(detail=False, methods=['get', 'put'])
    def me(self, request):
        """Get or update current user's notification preferences"""
        if request.method == 'GET':
            preferences = self.get_object()
            serializer = self.get_serializer(preferences)
            return Response(serializer.data)
        else:
            preferences = self.get_object()
            serializer = self.get_serializer(preferences, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)