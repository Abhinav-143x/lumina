from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .service import ai_chat, ai_plan_day


def _build_context(user):
    from apps.notes.models import Note
    from apps.habits.models import Habit
    from apps.calendar_app.models import Event
    from django.utils import timezone

    notes_count = Note.objects.filter(user=user, is_archived=False).count()
    recent_notes = list(Note.objects.filter(user=user).values_list("title", flat=True)[:5])
    habit_names = list(Habit.objects.filter(user=user, is_active=True).values_list("name", flat=True))
    upcoming = list(
        Event.objects.filter(user=user, start_datetime__gte=timezone.now())
        .order_by("start_datetime")[:5]
        .values("title", "start_datetime")
    )
    upcoming_str = [f"{e['title']} ({e['start_datetime'].strftime('%b %d %H:%M')})" for e in upcoming]
    return {
        "notes_count": notes_count,
        "recent_notes": recent_notes,
        "habit_names": habit_names,
        "upcoming_events": upcoming_str,
    }


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def chat(request):
    """
    Body: { "messages": [{"role": "user", "content": "..."}] }
    Returns: { "reply": "..." }
    """
    messages = request.data.get("messages", [])
    if not messages:
        return Response({"detail": "messages required."}, status=400)
    context = _build_context(request.user)
    reply = ai_chat(messages, context)
    return Response({"reply": reply})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def plan_day(request):
    """Generate a suggested day plan based on today's schedule."""
    from apps.habits.models import Habit
    from apps.calendar_app.models import Event
    from apps.notes.models import Note
    from apps.habits.analytics import get_streak
    from django.utils import timezone
    import datetime

    today = datetime.date.today()
    today_start = timezone.make_aware(datetime.datetime.combine(today, datetime.time.min))
    today_end = timezone.make_aware(datetime.datetime.combine(today, datetime.time.max))

    events = list(Event.objects.filter(
        user=request.user, start_datetime__range=(today_start, today_end)
    ).values("title", "start_datetime"))
    for e in events:
        e["start_datetime"] = e["start_datetime"].strftime("%H:%M")

    habits = Habit.objects.filter(user=request.user, is_active=True)
    habits_data = [{"name": h.name, "streak": get_streak(h)["current"]} for h in habits]

    recent_notes = Note.objects.filter(user=request.user).order_by("-updated_at")[:3]
    notes_summary = " | ".join(n.title for n in recent_notes)

    plan = ai_plan_day(events, habits_data, notes_summary)
    return Response({"plan": plan})
