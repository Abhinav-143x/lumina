from rest_framework import serializers
from .models import Note, Tag


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ("id", "name", "color")
        read_only_fields = ("id",)

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)


class NoteSerializer(serializers.ModelSerializer):
    tags = TagSerializer(many=True, read_only=True)
    tag_ids = serializers.PrimaryKeyRelatedField(
        many=True, write_only=True, queryset=Tag.objects.none(), source="tags", required=False
    )

    class Meta:
        model = Note
        fields = ("id", "title", "content", "summary", "tags", "tag_ids",
                  "is_pinned", "is_archived", "folder", "word_count", "created_at", "updated_at")
        read_only_fields = ("id", "summary", "word_count", "created_at", "updated_at")

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get("request")
        if request:
            self.fields["tag_ids"].child_relation.queryset = Tag.objects.filter(user=request.user)

    def create(self, validated_data):
        tags = validated_data.pop("tags", [])
        validated_data["user"] = self.context["request"].user
        note = super().create(validated_data)
        if tags:
            note.tags.set(tags)
        return note

    def update(self, instance, validated_data):
        tags = validated_data.pop("tags", None)
        note = super().update(instance, validated_data)
        if tags is not None:
            note.tags.set(tags)
        return note


class NoteListSerializer(serializers.ModelSerializer):
    tags = TagSerializer(many=True, read_only=True)

    class Meta:
        model = Note
        fields = ("id", "title", "summary", "tags", "is_pinned", "folder",
                  "word_count", "created_at", "updated_at")
