import uuid
from django.db import models
from django.contrib.auth.models import User


class Event(models.Model):
    class Color(models.TextChoices):
        BLUE = "blue", "Blue"
        GREEN = "green", "Green"
        RED = "red", "Red"
        PURPLE = "purple", "Purple"
        AMBER = "amber", "Amber"
        TEAL = "teal", "Teal"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="events")
    title = models.CharField(max_length=512)
    description = models.TextField(blank=True)
    start_datetime = models.DateTimeField()
    end_datetime = models.DateTimeField(null=True, blank=True)
    all_day = models.BooleanField(default=False)
    color = models.CharField(max_length=10, choices=Color.choices, default=Color.BLUE)
    location = models.CharField(max_length=255, blank=True)
    reminder_minutes = models.PositiveIntegerField(null=True, blank=True)
    reminder_sent = models.BooleanField(default=False)
    linked_note = models.ForeignKey(
        "notes.Note", null=True, blank=True, on_delete=models.SET_NULL, related_name="events"
    )
    is_recurring = models.BooleanField(default=False)
    recurrence_rule = models.CharField(max_length=128, blank=True)  # e.g. "weekly"
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "events"
        ordering = ["start_datetime"]

    def __str__(self):
        return self.title
