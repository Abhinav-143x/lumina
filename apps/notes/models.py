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


class NoteTemplate(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='note_templates')

    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    content = models.TextField()  # Markdown template content

    # Template metadata
    category = models.CharField(max_length=100, blank=True, help_text='Category for organizing templates')
    icon = models.CharField(max_length=50, blank=True, help_text='Icon emoji or name')
    color = models.CharField(max_length=7, default='#6366f1', help_text='Hex color code')

    # Usage tracking
    usage_count = models.PositiveIntegerField(default=0)
    is_favorite = models.BooleanField(default=False)
    is_system = models.BooleanField(default=False, help_text='System templates available to all users')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'note_templates'
        ordering = ['-is_favorite', '-usage_count', 'name']
        indexes = [
            models.Index(fields=['user', 'is_favorite']),
            models.Index(fields=['category']),
            models.Index(fields=['is_system']),
        ]

    def __str__(self):
        return f"{self.name} ({self.user.username})"

    def increment_usage(self):
        """Increment the usage count for this template."""
        self.usage_count += 1
        self.save(update_fields=['usage_count'])

    def duplicate_for_user(self, user):
        """Create a copy of this template for another user."""
        return NoteTemplate.objects.create(
            user=user,
            name=f"Copy of {self.name}",
            description=self.description,
            content=self.content,
            category=self.category,
            icon=self.icon,
            color=self.color,
            is_favorite=False,
            is_system=False
        )