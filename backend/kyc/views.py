from __future__ import annotations

from django.db import transaction
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from escrows.models import Escrow
from .models import AMLCheck, KYCRecord
from .permissions import IsParticipantOrOfficer, ReadOnlyForParticipants
from .serializers import AMLCheckSerializer, KYCRecordSerializer
from .tasks import enqueue_aml_check


class KYCRecordViewSet(viewsets.ModelViewSet):
    serializer_class = KYCRecordSerializer
    permission_classes = [IsParticipantOrOfficer]

    def get_queryset(self):
        escrow_id = self.kwargs.get("escrow_pk")
        qs = KYCRecord.objects.select_related("escrow", "assigned_officer")
        if escrow_id:
            qs = qs.filter(escrow_id=escrow_id)
        return qs

    def get_serializer_context(self):
        context = super().get_serializer_context()
        escrow_id = self.kwargs.get("escrow_pk")
        if escrow_id:
            context["escrow"] = Escrow.objects.get(pk=escrow_id)
        return context

    @action(detail=True, methods=["post"], url_path="run-aml")
    def run_aml(self, request, pk=None, escrow_pk=None):
        record = self.get_object()
        with transaction.atomic():
            check = AMLCheck.objects.create(record=record, requested_by=request.user)
        enqueue_aml_check(check)
        serializer = AMLCheckSerializer(check, context=self.get_serializer_context())
        return Response(serializer.data, status=status.HTTP_202_ACCEPTED)


class AMLCheckViewSet(mixins.ListModelMixin, mixins.CreateModelMixin, viewsets.GenericViewSet):
    serializer_class = AMLCheckSerializer
    permission_classes = [ReadOnlyForParticipants]
    pagination_class = None

    def get_queryset(self):
        record = KYCRecord.objects.get(pk=self.kwargs["kyc_pk"])
        return record.aml_checks.select_related("requested_by", "record")

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["record"] = KYCRecord.objects.get(pk=self.kwargs["kyc_pk"])
        return context

    def perform_create(self, serializer):
        check = serializer.save()
        enqueue_aml_check(check)
