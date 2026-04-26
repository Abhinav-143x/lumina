"""
analytics.py — computes all habit statistics for the frontend graphs.
"""
from datetime import date, timedelta
from collections import defaultdict
from .models import HabitEntry


def get_streak(habit) -> dict:
    """Calculate current and longest streak for a habit."""
    entries = set(
        HabitEntry.objects.filter(habit=habit)
        .values_list("date", flat=True)
    )
    if not entries:
        return {"current": 0, "longest": 0, "last_completed": None}

    today = date.today()
    # Current streak
    current = 0
    check = today if today in entries else today - timedelta(days=1)
    while check in entries:
        current += 1
        check -= timedelta(days=1)

    # Longest streak
    sorted_dates = sorted(entries)
    longest = 1
    run = 1
    for i in range(1, len(sorted_dates)):
        if (sorted_dates[i] - sorted_dates[i - 1]).days == 1:
            run += 1
            longest = max(longest, run)
        else:
            run = 1

    last = sorted_dates[-1] if sorted_dates else None
    return {"current": current, "longest": longest, "last_completed": str(last) if last else None}


def get_completion_rate(habit, days: int = 30) -> float:
    """Completion rate as a percentage over the last N days."""
    today = date.today()
    start = today - timedelta(days=days - 1)
    completed = HabitEntry.objects.filter(habit=habit, date__gte=start, date__lte=today).count()
    return round(completed / days * 100, 1)


def get_heatmap_data(habit, year: int = None) -> list:
    """
    Returns a list of {"date": "YYYY-MM-DD", "count": int} for an entire year.
    Used to render the GitHub-style contribution heatmap.
    """
    if year is None:
        year = date.today().year
    entries = HabitEntry.objects.filter(
        habit=habit,
        date__year=year,
    ).values("date", "count")
    return [{"date": str(e["date"]), "count": e["count"]} for e in entries]


def get_weekly_bar_data(habit, weeks: int = 12) -> list:
    """
    Returns per-week completion counts for the last N weeks.
    [{"week_start": "YYYY-MM-DD", "completed": int, "target": int}, ...]
    """
    today = date.today()
    # Start from the Monday of (weeks) ago
    start_monday = today - timedelta(days=today.weekday() + 7 * (weeks - 1))
    result = []
    for w in range(weeks):
        week_start = start_monday + timedelta(weeks=w)
        week_end = week_start + timedelta(days=6)
        completed = HabitEntry.objects.filter(
            habit=habit, date__gte=week_start, date__lte=min(week_end, today)
        ).count()
        result.append({
            "week_start": str(week_start),
            "completed": completed,
            "target": habit.target_count * 7,
        })
    return result


def get_dashboard_stats(user) -> dict:
    """
    Top-level stats for the dashboard overview card.
    """
    from .models import Habit
    habits = Habit.objects.filter(user=user, is_active=True)
    today = date.today()

    total = habits.count()
    completed_today = HabitEntry.objects.filter(habit__user=user, date=today).values("habit").distinct().count()

    best_streak = 0
    for h in habits:
        s = get_streak(h)
        best_streak = max(best_streak, s["current"])

    overall_rate = 0.0
    if total:
        rates = [get_completion_rate(h, 30) for h in habits]
        overall_rate = round(sum(rates) / len(rates), 1)

    return {
        "total_habits": total,
        "completed_today": completed_today,
        "best_streak": best_streak,
        "overall_completion_rate_30d": overall_rate,
    }
