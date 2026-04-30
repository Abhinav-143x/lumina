import uuid
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class ReminderType(models.TextChoices):
    EVENT = 'event', 'Event Reminder'
    HABIT = 'habit', 'Habit Reminder'
    CUSTOM = 'custom', 'Custom Reminder'


class ReminderTiming(models.TextChoices):
    MINUTES_15 = '15m', '15 minutes before'
    MINUTES_30 = '30m', '30 minutes before'
    HOURS_1 = '1h', '1 hour before'
    HOURS_2 = '2h', '2 hours before'
    HOURS_24 = '24h', '1 day before'
    DAYS_3 = '3d', '3 days before'


class ReminderSchedule(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reminder_schedules')

    reminder_type = models.CharField(max_length=20, choices=ReminderType.choices)
    timing = models.CharField(max_length=10, choices=ReminderTiming.choices)

    # For event reminders
    event = models.ForeignKey('calendar_app.Event', on_delete=models.CASCADE, null=True, blank=True, related_name='reminders')

    # For habit reminders
    habit = models.ForeignKey('habits.Habit', on_delete=models.CASCADE, null=True, blank=True, related_name='reminders')

    # For custom reminders
    custom_title = models.CharField(max_length=255, blank=True)
    custom_message = models.TextField(blank=True)
    custom_datetime = models.DateTimeField(null=True, blank=True)

    is_active = models.BooleanField(default=True)
    is_sent = models.BooleanField(default=False)
    sent_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'reminder_schedules'
        ordering = ['custom_datetime', 'created_at']
        indexes = [
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['reminder_type', 'is_sent']),
            models.Index(fields=['custom_datetime']),
        ]

    def __str__(self):
        if self.reminder_type == ReminderType.EVENT and self.event:
            return f"{self.get_reminder_type_display()} - {self.event.title} ({self.get_timing_display()})"
        elif self.reminder_type == ReminderType.HABIT and self.habit:
            return f"{self.get_reminder_type_display()} - {self.habit.name} ({self.get_timing_display()})"
        else:
            return f"{self.get_reminder_type_display()} - {self.custom_title or 'Custom'} ({self.get_timing_display()})"

    def mark_as_sent(self):
        self.is_sent = True
        self.sent_at = timezone.now()
        self.save()


class ReminderLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reminder_logs')
    reminder_schedule = models.ForeignKey(ReminderSchedule, on_delete=models.CASCADE, related_name='logs')

    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('sent', 'Sent'),
        ('failed', 'Failed'),
    ], default='pending')

    error_message = models.TextField(blank=True)
    sent_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'reminder_logs'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['reminder_schedule']),
        ]

    def __str__(self):
        return f"{self.get_status_display()} - {self.reminder_schedule}"


class UserNotificationPreferences(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='notification_preferences')

    # Email preferences
    email_enabled = models.BooleanField(default=True)
    email_event_reminders = models.BooleanField(default=True)
    email_habit_reminders = models.BooleanField(default=True)
    email_custom_reminders = models.BooleanField(default=True)

    # Default timing preferences
    default_event_timing = models.CharField(
        max_length=10,
        choices=ReminderTiming.choices,
        default=ReminderTiming.HOURS_1
    )
    default_habit_timing = models.CharField(
        max_length=10,
        choices=ReminderTiming.choices,
        default=ReminderTiming.HOURS_1
    )

    # Quiet hours (no notifications during these times)
    quiet_hours_enabled = models.BooleanField(default=False)
    quiet_hours_start = models.TimeField(null=True, blank=True)
    quiet_hours_end = models.TimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'user_notification_preferences'

    def __str__(self):
        return f"{self.user.username} - Notifications {'enabled' if self.email_enabled else 'disabled'}"

    def is_quiet_hours(self):
        """Check if current time is within quiet hours"""
        if not self.quiet_hours_enabled:
            return False

        if not self.quiet_hours_start or not self.quiet_hours_end:
            return False

        now = timezone.now().time()

        if self.quiet_hours_start <= self.quiet_hours_end:
            # Same day range (e.g., 22:00 - 08:00 doesn't make sense, but 08:00 - 22:00 does)
            return self.quiet_hours_start <= now <= self.quiet_hours_end
        else:
            # Overnight range (e.g., 22:00 - 08:00)
            return now >= self.quiet_hours_start or now <= self.quiet_hours_end