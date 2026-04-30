from django.contrib import admin
from .models import Note, Tag, NoteTemplate


@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'user', 'folder', 'is_pinned', 'is_archived', 'word_count', 'created_at']
    list_filter = ['is_pinned', 'is_archived', 'folder', 'created_at']
    search_fields = ['title', 'content', 'user__username']
    readonly_fields = ['id', 'word_count', 'created_at', 'updated_at']
    date_hierarchy = 'created_at'

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user').prefetch_related('tags')


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'color', 'user']
    list_filter = ['user', 'color']
    search_fields = ['name', 'user__username']

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')


@admin.register(NoteTemplate)
class NoteTemplateAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'user', 'category', 'usage_count', 'is_favorite', 'is_system', 'created_at']
    list_filter = ['category', 'is_favorite', 'is_system', 'created_at']
    search_fields = ['name', 'description', 'user__username']
    readonly_fields = ['id', 'usage_count', 'created_at', 'updated_at']
    date_hierarchy = 'created_at'

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')