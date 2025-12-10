from __future__ import annotations

from django.utils import timezone
from rest_framework import serializers

from escrows.models import Escrow
from .models import AMLCheck, AMLProvider, AMLStatus, KYCRecord, KYCStatus


class AMLCheckSerializer(serializers.ModelSerializer):
    class Meta:
        model = AMLCheck
        fields = [
            "id",
            "record",
            "provider",
            "status",
            "requested_by",
            "requested_at",
            "completed_at",
            "notes",
            "result_payload",
        ]
        read_only_fields = [
            "id",
            "record",
            "requested_by",
            "requested_at",
            "completed_at",
            "result_payload",
        ]

    def validate_provider(self, value):
        if value not in AMLProvider.values:
            raise serializers.ValidationError("Invalid AML provider")
        return value

    def create(self, validated_data):
        validated_data["record"] = self.context["record"]
        validated_data["requested_by"] = self.context["request"].user
        return super().create(validated_data)


class KYCRecordSerializer(serializers.ModelSerializer):
    aml_checks = AMLCheckSerializer(many=True, read_only=True)

    class Meta:
        model = KYCRecord
        fields = [
            "id",
            "escrow",
            "subject_name",
            "subject_email",
            "status",
            "checklist",
            "assigned_officer",
            "created_at",
            "updated_at",
            "aml_checks",
        ]
        read_only_fields = ["id", "escrow", "created_at", "updated_at", "aml_checks"]

    def validate_status(self, value):
        if value not in KYCStatus.values:
            raise serializers.ValidationError("Invalid KYC status")
        return value

    def validate(self, attrs):
        escrow = attrs.get("escrow") or self.context.get("escrow")
        if not escrow:
            raise serializers.ValidationError("Escrow is required")
        return super().validate(attrs)

    def create(self, validated_data):
        validated_data.setdefault("escrow", self.context["escrow"])
        checklist = validated_data.get("checklist")
        if checklist is None:
            validated_data["checklist"] = {
                "document_verification": False,
                "identity_verified": False,
                "ofac_screen": False,
            }
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if "status" in validated_data and validated_data["status"] == KYCStatus.APPROVED:
            validated_data.setdefault("checklist", instance.checklist)
            validated_data["checklist"]["approved_at"] = timezone.now().isoformat()
        return super().update(instance, validated_data)


class EscrowKYCSerializer(serializers.Serializer):
    """Lightweight serializer for embedding KYC info on escrow views."""

    id = serializers.IntegerField(read_only=True)
    status = serializers.CharField(read_only=True)
    subject_name = serializers.CharField(read_only=True)
    subject_email = serializers.EmailField(read_only=True)
    checklist = serializers.JSONField(read_only=True)

    @classmethod
    def from_queryset(cls, escrow: Escrow):
        record = escrow.kyc_records.first()
        return cls(record).data if record else None
