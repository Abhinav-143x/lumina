from rest_framework import generics, permissions, serializers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Event


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ("id", "title", "description", "start_datetime", "end_datetime",
                  "all_day", "color", "location", "reminder_minutes",
                  "linked_note", "is_recurring", "recurrence_rule", "created_at")
        read_only_fields = ("id", "created_at", "reminder_sent")

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        event = super().create(validated_data)

        # Trigger reminder creation asynchronously
        from apps.reminders.celery_tasks import create_event_reminders
        create_event_reminders.delay(str(event.id))

        return event


class EventListCreateView(generics.ListCreateAPIView):
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Event.objects.filter(user=self.request.user)
        start = self.request.query_params.get("start")
        end = self.request.query_params.get("end")
        if start:
            qs = qs.filter(start_datetime__gte=start)
        if end:
            qs = qs.filter(start_datetime__lte=end)
        return qs


class EventDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        return Event.objects.filter(user=self.request.user)


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def upcoming_events(request):
    from django.utils import timezone
    events = Event.objects.filter(
        user=request.user,
        start_datetime__gte=timezone.now()
    ).order_by("start_datetime")[:10]
    return Response(EventSerializer(events, many=True).data)


