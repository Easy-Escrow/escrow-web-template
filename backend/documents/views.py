from __future__ import annotations

from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from escrows.models import Escrow
from kyc.permissions import IsParticipantOrOfficer, ReadOnlyForParticipants
from .models import Document, DocumentStatus, DocuSignStatus
from .serializers import DocumentSerializer, EnvelopeTriggerSerializer, PresignedUploadSerializer


class DocumentViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentSerializer
    permission_classes = [IsParticipantOrOfficer]
    pagination_class = None

    def get_queryset(self):
        escrow_id = self.kwargs.get("escrow_pk")
        qs = Document.objects.select_related("escrow", "uploaded_by")
        if escrow_id:
            qs = qs.filter(escrow_id=escrow_id)
        return qs

    def get_serializer_context(self):
        context = super().get_serializer_context()
        escrow_id = self.kwargs.get("escrow_pk")
        if escrow_id:
            context["escrow"] = Escrow.objects.get(pk=escrow_id)
        return context

    @action(detail=False, methods=["post"], url_path="presign")
    def presign(self, request, escrow_pk=None):
        serializer = PresignedUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = serializer.generate()
        return Response(payload)

    @action(detail=True, methods=["post"], url_path="mark-uploaded")
    def mark_uploaded(self, request, escrow_pk=None, pk=None):
        document = self.get_object()
        document.status = DocumentStatus.UPLOADED
        document.storage_key = request.data.get("storage_key") or document.storage_key
        document.storage_url = request.data.get("storage_url") or document.storage_url
        document.save(update_fields=["status", "storage_key", "storage_url", "updated_at"])
        return Response(self.get_serializer(document).data)

    @action(detail=True, methods=["post"], url_path="trigger-envelope")
    def trigger_envelope(self, request, escrow_pk=None, pk=None):
        document = self.get_object()
        serializer = EnvelopeTriggerSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = serializer.generate()
        document.docu_sign_envelope_id = payload["envelope_id"]
        document.docu_sign_status = payload["status"] or DocuSignStatus.SENT
        document.save(update_fields=["docu_sign_envelope_id", "docu_sign_status", "updated_at"])
        return Response(self.get_serializer(document).data, status=status.HTTP_202_ACCEPTED)


class OfficerDocumentViewSet(mixins.UpdateModelMixin, viewsets.GenericViewSet):
    serializer_class = DocumentSerializer
    queryset = Document.objects.all()
    permission_classes = [ReadOnlyForParticipants]

    def update(self, request, *args, **kwargs):
        document = self.get_object()
        status_choice = request.data.get("status")
        if status_choice not in DocumentStatus.values:
            return Response({"detail": "Invalid status"}, status=status.HTTP_400_BAD_REQUEST)
        document.status = status_choice
        document.save(update_fields=["status", "updated_at"])
        return Response(self.get_serializer(document).data)
