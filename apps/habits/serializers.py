from rest_framework import serializers
from .models import Habit, HabitEntry


class HabitEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = HabitEntry
        fields = ("id", "date", "count", "note", "created_at")
        read_only_fields = ("id", "created_at")


class HabitSerializer(serializers.ModelSerializer):
    streak = serializers.SerializerMethodField()
    completion_rate_30d = serializers.SerializerMethodField()
    completed_today = serializers.SerializerMethodField()

    class Meta:
        model = Habit
        fields = ("id", "name", "description", "icon", "color", "category",
                  "frequency", "custom_days", "target_count", "reminder_time",
                  "is_active", "created_at", "streak", "completion_rate_30d", "completed_today")
        read_only_fields = ("id", "created_at", "streak", "completion_rate_30d", "completed_today")

    def get_streak(self, obj):
        from .analytics import get_streak
        return get_streak(obj)

    def get_completion_rate_30d(self, obj):
        from .analytics import get_completion_rate
        return get_completion_rate(obj, 30)

    def get_completed_today(self, obj):
        from datetime import date
        return obj.entries.filter(date=date.today()).exists()

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)
