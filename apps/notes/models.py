import uuid
from django.db import models
from django.contrib.auth.models import User


class Tag(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="tags")
    name = models.CharField(max_length=64)
    color = models.CharField(max_length=7, default="#6366f1")  # hex

    class Meta:
        unique_together = ("user", "name")
        ordering = ["name"]

    def __str__(self):
        return self.name


class Note(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notes")
    title = models.CharField(max_length=512)
    content = models.TextField(blank=True)           # raw markdown
    summary = models.TextField(blank=True)           # AI-generated
    tags = models.ManyToManyField(Tag, blank=True, related_name="notes")
    is_pinned = models.BooleanField(default=False)
    is_archived = models.BooleanField(default=False)
    folder = models.CharField(max_length=128, blank=True, default="")
    word_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "notes"
        ordering = ["-is_pinned", "-updated_at"]

    def save(self, *args, **kwargs):
        self.word_count = len(self.content.split())
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title
