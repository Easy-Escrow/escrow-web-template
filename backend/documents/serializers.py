from __future__ import annotations

from uuid import uuid4

from rest_framework import serializers

from .models import Document, DocumentStatus, DocuSignStatus


class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = [
            "id",
            "escrow",
            "name",
            "document_type",
            "storage_key",
            "storage_url",
            "status",
            "uploaded_by",
            "docu_sign_envelope_id",
            "docu_sign_status",
            "uploaded_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "escrow",
            "storage_key",
            "storage_url",
            "uploaded_by",
            "uploaded_at",
            "updated_at",
        ]

    def validate_status(self, value):
        if value not in DocumentStatus.values:
            raise serializers.ValidationError("Invalid document status")
        return value

    def create(self, validated_data):
        validated_data.setdefault("escrow", self.context["escrow"])
        validated_data.setdefault("uploaded_by", self.context["request"].user)
        validated_data.setdefault("storage_key", f"uploads/{uuid4()}")
        validated_data.setdefault("storage_url", "https://example-bucket.local/placeholder")
        return super().create(validated_data)


class PresignedUploadSerializer(serializers.Serializer):
    file_name = serializers.CharField()
    content_type = serializers.CharField(required=False, allow_blank=True)

    def create(self, validated_data):  # pragma: no cover - serializer API
        return validated_data

    def generate(self):
        file_name = self.validated_data["file_name"]
        key = f"uploads/{uuid4()}-{file_name}"
        return {
            "upload_url": f"https://example-bucket.local/{key}",
            "storage_key": key,
        }


class EnvelopeTriggerSerializer(serializers.Serializer):
    template_id = serializers.CharField(required=False, allow_blank=True)

    def create(self, validated_data):  # pragma: no cover
        return validated_data

    def generate(self):
        return {
            "envelope_id": str(uuid4()),
            "status": DocuSignStatus.SENT,
        }
