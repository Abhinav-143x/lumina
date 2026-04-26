from django.urls import path
from .views import NoteListCreateView, NoteDetailView, TagListCreateView, summarise_note, ai_tag_note, list_folders

urlpatterns = [
    path("", NoteListCreateView.as_view()),
    path("<uuid:pk>/", NoteDetailView.as_view()),
    path("<uuid:pk>/summarise/", summarise_note),
    path("<uuid:pk>/suggest-tags/", ai_tag_note),
    path("tags/", TagListCreateView.as_view()),
    path("folders/", list_folders),
]
