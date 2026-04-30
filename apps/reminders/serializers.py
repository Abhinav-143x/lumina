from rest_framework import serializers
from .models import ReminderSchedule, ReminderLog, UserNotificationPreferences, ReminderType, ReminderTiming


class ReminderScheduleSerializer(serializers.ModelSerializer):
    event_title = serializers.CharField(source='event.title', read_only=True)
    habit_name = serializers.CharField(source='habit.name', read_only=True)
    reminder_type_display = serializers.CharField(source='get_reminder_type_display', read_only=True)
    timing_display = serializers.CharField(source='get_timing_display', read_only=True)

    class Meta:
        model = ReminderSchedule
        fields = [
            'id', 'user', 'reminder_type', 'reminder_type_display', 'timing', 'timing_display',
            'event', 'event_title', 'habit', 'habit_name',
            'custom_title', 'custom_message', 'custom_datetime',
            'is_active', 'is_sent', 'sent_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'is_sent', 'sent_at', 'created_at', 'updated_at']

    def validate(self, data):
        reminder_type = data.get('reminder_type', self.instance.reminder_type if self.instance else ReminderType.EVENT)

        # Validate based on reminder type
        if reminder_type == ReminderType.EVENT:
            if not data.get('event') and (not self.instance or not self.instance.event):
                raise serializers.ValidationError({"event": "Event is required for event reminders"})
            if data.get('habit') or (self.instance and self.instance.habit):
                raise serializers.ValidationError({"habit": "Habit should not be set for event reminders"})

        elif reminder_type == ReminderType.HABIT:
            if not data.get('habit') and (not self.instance or not self.instance.habit):
                raise serializers.ValidationError({"habit": "Habit is required for habit reminders"})
            if data.get('event') or (self.instance and self.instance.event):
                raise serializers.ValidationError({"event": "Event should not be set for habit reminders"})

        elif reminder_type == ReminderType.CUSTOM:
            if not data.get('custom_title') and (not self.instance or not self.instance.custom_title):
                raise serializers.ValidationError({"custom_title": "Custom title is required for custom reminders"})
            if not data.get('custom_datetime') and (not self.instance or not self.instance.custom_datetime):
                raise serializers.ValidationError({"custom_datetime": "Custom datetime is required for custom reminders"})

        return data


class ReminderLogSerializer(serializers.ModelSerializer):
    reminder_schedule_summary = serializers.SerializerMethodField()

    class Meta:
        model = ReminderLog
        fields = [
            'id', 'user', 'reminder_schedule', 'reminder_schedule_summary',
            'status', 'error_message', 'sent_at', 'created_at'
        ]
        read_only_fields = ['id', 'user', 'created_at']

    def get_reminder_schedule_summary(self, obj):
        return str(obj.reminder_schedule)


class UserNotificationPreferencesSerializer(serializers.ModelSerializer):
    default_event_timing_display = serializers.CharField(source='get_default_event_timing_display', read_only=True)
    default_habit_timing_display = serializers.CharField(source='get_default_habit_timing_display', read_only=True)

    class Meta:
        model = UserNotificationPreferences
        fields = [
            'user', 'email_enabled', 'email_event_reminders', 'email_habit_reminders', 'email_custom_reminders',
            'default_event_timing', 'default_event_timing_display',
            'default_habit_timing', 'default_habit_timing_display',
            'quiet_hours_enabled', 'quiet_hours_start', 'quiet_hours_end',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']