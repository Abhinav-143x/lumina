"""
celery_tasks.py — Celery tasks for reminder scheduling and delivery.

Handles automatic reminder processing, email sending, and logging.
"""
import logging
from celery import shared_task
from django.utils import timezone
from django.db.models import Q

from .models import ReminderSchedule, ReminderLog, ReminderType, UserNotificationPreferences
from .email_service import send_event_reminder, send_habit_reminder, send_custom_reminder

logger = logging.getLogger(__name__)


@shared_task
def process_due_reminders():
    """
    Process all due reminders that need to be sent.

    This task should be scheduled to run frequently (e.g., every minute)
    to check for and send due reminders.
    """
    now = timezone.now()
    logger.info(f"Processing due reminders at {now}")

    # Find reminders that are due and not yet sent
    due_reminders = ReminderSchedule.objects.filter(
        is_active=True,
        is_sent=False,
        custom_datetime__lte=now
    ).select_related('user', 'event', 'habit')

    sent_count = 0
    failed_count = 0

    for reminder in due_reminders:
        try:
            # Check user's notification preferences
            preferences = UserNotificationPreferences.objects.filter(user=reminder.user).first()

            # Skip if user has disabled notifications
            if not preferences or not preferences.email_enabled:
                logger.info(f"Skipping reminder {reminder.id} - user has disabled notifications")
                continue

            # Check quiet hours
            if preferences.is_quiet_hours():
                logger.info(f"Skipping reminder {reminder.id} - currently in quiet hours")
                continue

            # Check type-specific preferences
            should_send = False
            if reminder.reminder_type == ReminderType.EVENT and preferences.email_event_reminders:
                should_send = True
            elif reminder.reminder_type == ReminderType.HABIT and preferences.email_habit_reminders:
                should_send = True
            elif reminder.reminder_type == ReminderType.CUSTOM and preferences.email_custom_reminders:
                should_send = True

            if not should_send:
                logger.info(f"Skipping reminder {reminder.id} - user has disabled this type")
                continue

            # Send the appropriate reminder
            success = False
            if reminder.reminder_type == ReminderType.EVENT and reminder.event:
                success = send_event_reminder(
                    user=reminder.user,
                    event=reminder.event,
                    timing_display=reminder.get_timing_display()
                )
            elif reminder.reminder_type == ReminderType.HABIT and reminder.habit:
                success = send_habit_reminder(
                    user=reminder.user,
                    habit=reminder.habit,
                    timing_display=reminder.get_timing_display()
                )
            elif reminder.reminder_type == ReminderType.CUSTOM:
                success = send_custom_reminder(
                    user=reminder.user,
                    reminder=reminder,
                    timing_display=reminder.get_timing_display()
                )

            # Log the result
            if success:
                reminder.mark_as_sent()
                ReminderLog.objects.create(
                    user=reminder.user,
                    reminder_schedule=reminder,
                    status='sent',
                    sent_at=timezone.now()
                )
                sent_count += 1
                logger.info(f"Successfully sent reminder {reminder.id}")
            else:
                ReminderLog.objects.create(
                    user=reminder.user,
                    reminder_schedule=reminder,
                    status='failed',
                    error_message='Email service failed to send'
                )
                failed_count += 1
                logger.error(f"Failed to send reminder {reminder.id}")

        except Exception as exc:
            logger.error(f"Error processing reminder {reminder.id}: {exc}")
            ReminderLog.objects.create(
                user=reminder.user,
                reminder_schedule=reminder,
                status='failed',
                error_message=str(exc)
            )
            failed_count += 1

    logger.info(f"Processed {len(due_reminders)} reminders: {sent_count} sent, {failed_count} failed")
    return {
        'processed': len(due_reminders),
        'sent': sent_count,
        'failed': failed_count
    }


@shared_task
def create_event_reminders(event_id):
    """
    Create default reminders for a new event based on user preferences.

    Args:
        event_id: ID of the event to create reminders for
    """
    from apps.calendar_app.models import Event

    try:
        event = Event.objects.get(id=event_id)
        preferences = UserNotificationPreferences.objects.filter(user=event.user).first()

        if not preferences or not preferences.email_event_reminders:
            logger.info(f"Skipping event reminders for event {event_id} - user has disabled event reminders")
            return

        # Calculate reminder time based on user's default timing
        reminder_time = calculate_reminder_time(
            event.start_datetime,
            preferences.default_event_timing
        )

        if reminder_time and reminder_time > timezone.now():
            ReminderSchedule.objects.create(
                user=event.user,
                reminder_type=ReminderType.EVENT,
                timing=preferences.default_event_timing,
                event=event,
                custom_datetime=reminder_time,
                is_active=True
            )
            logger.info(f"Created event reminder for event {event_id}")

    except Event.DoesNotExist:
        logger.error(f"Event {event_id} not found")
    except Exception as exc:
        logger.error(f"Error creating event reminders for {event_id}: {exc}")


@shared_task
def create_habit_reminders(habit_id):
    """
    Create default reminders for a new habit based on user preferences.

    Args:
        habit_id: ID of the habit to create reminders for
    """
    from apps.habits.models import Habit

    try:
        habit = Habit.objects.get(id=habit_id)
        preferences = UserNotificationPreferences.objects.filter(user=habit.user).first()

        if not preferences or not preferences.email_habit_reminders:
            logger.info(f"Skipping habit reminders for habit {habit_id} - user has disabled habit reminders")
            return

        # Create a daily reminder at a reasonable time (e.g., 9 AM)
        from datetime import time
        reminder_time = timezone.now().replace(hour=9, minute=0, second=0, microsecond=0)

        if reminder_time < timezone.now():
            # If 9 AM has passed today, schedule for tomorrow
            from datetime import timedelta
            reminder_time += timedelta(days=1)

        ReminderSchedule.objects.create(
            user=habit.user,
            reminder_type=ReminderType.HABIT,
            timing=preferences.default_habit_timing,
            habit=habit,
            custom_datetime=reminder_time,
            is_active=True
        )
        logger.info(f"Created habit reminder for habit {habit_id}")

    except Habit.DoesNotExist:
        logger.error(f"Habit {habit_id} not found")
    except Exception as exc:
        logger.error(f"Error creating habit reminders for {habit_id}: {exc}")


@shared_task
def cleanup_old_reminder_logs(days=30):
    """
    Clean up old reminder logs to prevent database bloat.

    Args:
        days: Number of days to keep logs (default: 30)
    """
    from datetime import timedelta

    cutoff_date = timezone.now() - timedelta(days=days)
    deleted_count = ReminderLog.objects.filter(created_at__lt=cutoff_date).delete()
    logger.info(f"Cleaned up {deleted_count} old reminder logs")
    return deleted_count


def calculate_reminder_time(event_time, timing):
    """
    Calculate the reminder time based on event time and timing preference.

    Args:
        event_time: The datetime of the event
        timing: The timing preference (e.g., '1h', '24h')

    Returns:
        datetime: The calculated reminder time, or None if invalid
    """
    from datetime import timedelta

    timing_map = {
        '15m': timedelta(minutes=15),
        '30m': timedelta(minutes=30),
        '1h': timedelta(hours=1),
        '2h': timedelta(hours=2),
        '24h': timedelta(days=1),
        '3d': timedelta(days=3),
    }

    delta = timing_map.get(timing)
    if delta:
        return event_time - delta
    return None


@shared_task
def send_daily_habit_reminders():
    """
    Send daily reminders for all active habits.

    This task should be scheduled to run once per day (e.g., at 8 AM)
    to send reminders for all habits that need daily tracking.
    """
    from apps.habits.models import Habit
    from datetime import time

    # Get all active habits
    active_habits = Habit.objects.filter(is_active=True).select_related('user')

    sent_count = 0
    failed_count = 0

    for habit in active_habits:
        try:
            preferences = UserNotificationPreferences.objects.filter(user=habit.user).first()

            if not preferences or not preferences.email_habit_reminders:
                continue

            # Check if user has already completed this habit today
            from django.utils import timezone
            today = timezone.now().date()
            already_completed = habit.entries.filter(date=today, completed=True).exists()

            if already_completed:
                continue  # Don't remind if already completed today

            # Send reminder
            success = send_habit_reminder(
                user=habit.user,
                habit=habit,
                timing_display="Daily reminder"
            )

            if success:
                sent_count += 1
                logger.info(f"Sent daily habit reminder for habit {habit.id}")
            else:
                failed_count += 1
                logger.error(f"Failed to send daily habit reminder for habit {habit.id}")

        except Exception as exc:
            logger.error(f"Error sending daily habit reminder for habit {habit.id}: {exc}")
            failed_count += 1

    logger.info(f"Daily habit reminders: {sent_count} sent, {failed_count} failed")
    return {
        'sent': sent_count,
        'failed': failed_count
    }