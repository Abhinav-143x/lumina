import uuid
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class Habit(models.Model):
    class Frequency(models.TextChoices):
        DAILY = "daily", "Daily"
        WEEKDAYS = "weekdays", "Weekdays only"
        WEEKENDS = "weekends", "Weekends only"
        CUSTOM = "custom", "Custom days"

    class Category(models.TextChoices):
        HEALTH = "health", "Health"
        FITNESS = "fitness", "Fitness"
        LEARNING = "learning", "Learning"
        MINDFULNESS = "mindfulness", "Mindfulness"
        PRODUCTIVITY = "productivity", "Productivity"
        SOCIAL = "social", "Social"
        OTHER = "other", "Other"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="habits")
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=8, default="✓")       # emoji
    color = models.CharField(max_length=7, default="#6366f1") # hex
    category = models.CharField(max_length=20, choices=Category.choices, default=Category.OTHER)
    frequency = models.CharField(max_length=10, choices=Frequency.choices, default=Frequency.DAILY)
    custom_days = models.JSONField(default=list, blank=True)  # [0,1,2] = Mon,Tue,Wed
    target_count = models.PositiveIntegerField(default=1)     # times per day
    reminder_time = models.TimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    archived_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "habits"
        ordering = ["name"]

    def __str__(self):
        return self.name


class HabitEntry(models.Model):
    """One completion record — one per date per habit."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    habit = models.ForeignKey(Habit, on_delete=models.CASCADE, related_name="entries")
    date = models.DateField()
    count = models.PositiveIntegerField(default=1)  # how many times completed
    note = models.CharField(max_length=512, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "habit_entries"
        unique_together = ("habit", "date")
        ordering = ["-date"]

    def __str__(self):
        return f"{self.habit.name} on {self.date}"
