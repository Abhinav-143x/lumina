from rest_framework import generics, permissions, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Q
from .models import Note, Tag
from .serializers import NoteSerializer, NoteListSerializer, TagSerializer


class NoteListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "content", "tags__name"]
    ordering_fields = ["created_at", "updated_at", "title"]

    def get_serializer_class(self):
        return NoteSerializer if self.request.method == "POST" else NoteListSerializer

    def get_queryset(self):
        qs = Note.objects.filter(user=self.request.user, is_archived=False)
        folder = self.request.query_params.get("folder")
        tag = self.request.query_params.get("tag")
        if folder:
            qs = qs.filter(folder=folder)
        if tag:
            qs = qs.filter(tags__name=tag)
        return qs.prefetch_related("tags")


class NoteDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        return Note.objects.filter(user=self.request.user)


class TagListCreateView(generics.ListCreateAPIView):
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        return Tag.objects.filter(user=self.request.user)


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def summarise_note(request, pk):
    """AI-generate a summary for a note and save it."""
    try:
        note = Note.objects.get(id=pk, user=request.user)
    except Note.DoesNotExist:
        return Response({"detail": "Not found."}, status=404)

    if not note.content.strip():
        return Response({"detail": "Note has no content to summarise."}, status=400)

    from apps.ai_assistant.service import ai_summarise
    summary = ai_summarise(note.content)
    note.summary = summary
    note.save(update_fields=["summary"])
    return Response({"summary": summary})


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def ai_tag_note(request, pk):
    """Ask AI to suggest tags for the note."""
    try:
        note = Note.objects.get(id=pk, user=request.user)
    except Note.DoesNotExist:
        return Response({"detail": "Not found."}, status=404)

    from apps.ai_assistant.service import ai_suggest_tags
    suggestions = ai_suggest_tags(note.title, note.content)
    return Response({"suggestions": suggestions})


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def list_folders(request):
    folders = (Note.objects.filter(user=request.user, folder__gt="")
               .values_list("folder", flat=True).distinct().order_by("folder"))
    return Response({"folders": list(folders)})
