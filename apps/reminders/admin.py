from django.contrib import admin
from .models import ReminderSchedule, ReminderLog, UserNotificationPreferences


@admin.register(ReminderSchedule)
class ReminderScheduleAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'reminder_type', 'timing', 'is_active', 'is_sent', 'created_at']
    list_filter = ['reminder_type', 'timing', 'is_active', 'is_sent', 'created_at']
    search_fields = ['user__username', 'custom_title', 'event__title', 'habit__name']
    readonly_fields = ['sent_at', 'created_at', 'updated_at']
    date_hierarchy = 'created_at'

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'event', 'habit')


@admin.register(ReminderLog)
class ReminderLogAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'reminder_schedule', 'status', 'sent_at', 'created_at']
    list_filter = ['status', 'created_at', 'sent_at']
    search_fields = ['user__username', 'reminder_schedule__custom_title']
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'reminder_schedule')


@admin.register(UserNotificationPreferences)
class UserNotificationPreferencesAdmin(admin.ModelAdmin):
    list_display = ['user', 'email_enabled', 'email_event_reminders', 'email_habit_reminders', 'quiet_hours_enabled']
    list_filter = ['email_enabled', 'email_event_reminders', 'email_habit_reminders', 'quiet_hours_enabled']
    search_fields = ['user__username']
    readonly_fields = ['created_at', 'updated_at']