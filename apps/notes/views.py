from rest_framework import generics, permissions, status, filters
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework import viewsets
from django.db.models import Q
from .models import Note, Tag, NoteTemplate
from .serializers import NoteSerializer, NoteListSerializer, TagSerializer, NoteTemplateSerializer


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


class NoteTemplateViewSet(viewsets.ModelViewSet):
    serializer_class = NoteTemplateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return NoteTemplate.objects.filter(user=self.request.user).select_related('user')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def use(self, request, pk=None):
        """Use a template to create a new note and increment usage count."""
        template = self.get_object()
        template.increment_usage()

        # Create a new note from the template
        note = Note.objects.create(
            user=request.user,
            title=template.name,
            content=template.content,
            folder=template.category or ''
        )

        return Response({
            'note_id': str(note.id),
            'title': note.title,
            'content': note.content,
            'template_used': template.name
        })

    @action(detail=True, methods=['post'])
    def favorite(self, request, pk=None):
        """Toggle favorite status of a template."""
        template = self.get_object()
        template.is_favorite = not template.is_favorite
        template.save()
        return Response({'is_favorite': template.is_favorite})

    @action(detail=True, methods=['post'])
    def duplicate(self, request, pk=None):
        """Create a copy of this template."""
        template = self.get_object()
        new_template = template.duplicate_for_user(request.user)
        serializer = self.get_serializer(new_template)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def favorites(self, request):
        """Get all favorite templates."""
        favorites = self.get_queryset().filter(is_favorite=True)
        serializer = self.get_serializer(favorites, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def system(self, request):
        """Get all system templates available to all users."""
        system_templates = NoteTemplate.objects.filter(is_system=True)
        serializer = self.get_serializer(system_templates, many=True)
        return Response(serializer.data)
