"""
email_service.py — handles all email notifications for Lumina.

Supports event reminders, habit reminders, and custom reminders
with HTML email templates and error handling.
"""
import logging
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags

logger = logging.getLogger(__name__)


def send_reminder_email(user_email, reminder_type, title, message, timing_display, additional_context=None):
    """
    Send a reminder email to a user.

    Args:
        user_email: Recipient email address
        reminder_type: Type of reminder (event, habit, custom)
        title: Title of the reminder
        message: Main message content
        timing_display: Human-readable timing (e.g., "1 hour before")
        additional_context: Optional dict with extra context for templates

    Returns:
        bool: True if email was sent successfully, False otherwise
    """
    try:
        # Prepare context for email template
        context = {
            'user_email': user_email,
            'reminder_type': reminder_type,
            'title': title,
            'message': message,
            'timing_display': timing_display,
            'app_name': 'Lumina',
            **(additional_context or {})
        }

        # Render HTML email
        html_message = render_to_string('reminders/email_template.html', context)

        # Create plain text version
        plain_message = strip_tags(html_message)

        # Send email
        send_mail(
            subject=f"Lumina Reminder: {title}",
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user_email],
            html_message=html_message,
            fail_silently=False,
        )

        logger.info(f"Reminder email sent successfully to {user_email} for {title}")
        return True

    except Exception as exc:
        logger.error(f"Failed to send reminder email to {user_email}: {exc}")
        return False


def send_event_reminder(user, event, timing_display):
    """Send an event reminder email."""
    message = f"""
    You have an upcoming event: {event.title}

    When: {event.start_datetime.strftime('%A, %B %d, %Y at %I:%M %p')}
    Where: {event.description or 'No location specified'}

    Don't forget to prepare!
    """

    return send_reminder_email(
        user_email=user.email,
        reminder_type='event',
        title=event.title,
        message=message,
        timing_display=timing_display,
        additional_context={
            'event': event,
            'event_date': event.start_datetime.strftime('%A, %B %d, %Y at %I:%M %p'),
        }
    )


def send_habit_reminder(user, habit, timing_display):
    """Send a habit reminder email."""
    message = f"""
    Time to complete your habit: {habit.name}

    Category: {habit.category or 'General'}
    Target frequency: {habit.target_frequency or 'Daily'}

    Keep up the great work! Your current streak: {habit.get_current_streak()} days
    """

    return send_reminder_email(
        user_email=user.email,
        reminder_type='habit',
        title=habit.name,
        message=message,
        timing_display=timing_display,
        additional_context={
            'habit': habit,
            'category': habit.category or 'General',
        }
    )


def send_custom_reminder(user, reminder, timing_display):
    """Send a custom reminder email."""
    message = reminder.custom_message or "This is your custom reminder."

    return send_reminder_email(
        user_email=user.email,
        reminder_type='custom',
        title=reminder.custom_title,
        message=message,
        timing_display=timing_display,
        additional_context={
            'reminder': reminder,
        }
    )


def send_test_email(user_email):
    """Send a test email to verify email configuration."""
    try:
        send_mail(
            subject="Lumina Test Email",
            message="This is a test email from Lumina. Your email configuration is working correctly!",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user_email],
            fail_silently=False,
        )
        logger.info(f"Test email sent successfully to {user_email}")
        return True
    except Exception as exc:
        logger.error(f"Failed to send test email to {user_email}: {exc}")
        return False