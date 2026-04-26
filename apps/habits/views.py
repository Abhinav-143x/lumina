from datetime import date
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Habit, HabitEntry
from .serializers import HabitSerializer, HabitEntrySerializer
from .analytics import get_heatmap_data, get_weekly_bar_data, get_dashboard_stats, get_streak, get_completion_rate


class HabitListCreateView(generics.ListCreateAPIView):
    serializer_class = HabitSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Habit.objects.filter(user=self.request.user)
        active = self.request.query_params.get("active")
        if active is not None:
            qs = qs.filter(is_active=active.lower() == "true")
        return qs


class HabitDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = HabitSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        return Habit.objects.filter(user=self.request.user)


@api_view(["POST", "DELETE"])
@permission_classes([permissions.IsAuthenticated])
def check_in(request, pk):
    """POST = mark complete for today. DELETE = unmark."""
    try:
        habit = Habit.objects.get(id=pk, user=request.user)
    except Habit.DoesNotExist:
        return Response({"detail": "Not found."}, status=404)

    today = date.today()
    if request.method == "POST":
        note = request.data.get("note", "")
        entry, created = HabitEntry.objects.get_or_create(
            habit=habit, date=today,
            defaults={"count": 1, "note": note}
        )
        if not created:
            entry.count += 1
            entry.save()
        return Response(HabitEntrySerializer(entry).data, status=201 if created else 200)
    else:
        deleted, _ = HabitEntry.objects.filter(habit=habit, date=today).delete()
        return Response({"deleted": deleted > 0})


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def habit_analytics(request, pk):
    """Full analytics for a single habit."""
    try:
        habit = Habit.objects.get(id=pk, user=request.user)
    except Habit.DoesNotExist:
        return Response({"detail": "Not found."}, status=404)

    year = int(request.query_params.get("year", date.today().year))
    weeks = int(request.query_params.get("weeks", 12))

    return Response({
        "streak": get_streak(habit),
        "completion_rate_7d": get_completion_rate(habit, 7),
        "completion_rate_30d": get_completion_rate(habit, 30),
        "completion_rate_90d": get_completion_rate(habit, 90),
        "heatmap": get_heatmap_data(habit, year),
        "weekly_bars": get_weekly_bar_data(habit, weeks),
    })


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def dashboard_stats(request):
    return Response(get_dashboard_stats(request.user))


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def entries_for_habit(request, pk):
    try:
        habit = Habit.objects.get(id=pk, user=request.user)
    except Habit.DoesNotExist:
        return Response({"detail": "Not found."}, status=404)
    entries = habit.entries.all()[:60]
    return Response(HabitEntrySerializer(entries, many=True).data)


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def ai_habit_report(request):
    """Ask AI to generate a weekly habit insight report."""
    from apps.ai_assistant.service import ai_habit_insight
    habits = Habit.objects.filter(user=request.user, is_active=True)
    stats = []
    for h in habits:
        stats.append({
            "name": h.name,
            "category": h.category,
            "streak": get_streak(h)["current"],
            "rate_30d": get_completion_rate(h, 30),
        })
    report = ai_habit_insight(stats)
    return Response({"report": report})
