from __future__ import annotations

from django.db.models import Q
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import BrokerRepresentation, BrokerStatus, CommissionPool, Escrow, Party
from .serializers import (
    BrokerRepresentationSerializer,
    CommissionPoolSerializer,
    EscrowSerializer,
    PartySerializer,
)


class EscrowViewSet(viewsets.ModelViewSet):
    serializer_class = EscrowSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        status_filter = self.request.query_params.get("status")
        qs = (
            Escrow.objects.select_related("created_by", "commission_pool")
            .prefetch_related("parties", "broker_representations")
            .filter(
                Q(created_by=user)
                | Q(broker_representations__user=user)
                | Q(broker_representations__invited_email=user.email)
            )
            .distinct()
        )
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs

    def perform_create(self, serializer):
        serializer.save()


class PartyViewSet(viewsets.ModelViewSet):
    serializer_class = PartySerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        escrow = Escrow.objects.get(pk=self.kwargs["escrow_pk"])
        qs = escrow.parties.all()
        role_filter = self.request.query_params.get("role")
        if role_filter:
            qs = qs.filter(role=role_filter)
        return qs

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["escrow"] = Escrow.objects.get(pk=self.kwargs["escrow_pk"])
        return context


class BrokerRepresentationViewSet(viewsets.ModelViewSet):
    serializer_class = BrokerRepresentationSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        escrow = Escrow.objects.get(pk=self.kwargs["escrow_pk"])
        qs = escrow.broker_representations.all()
        invited_as = self.request.query_params.get("invited_as")
        status_filter = self.request.query_params.get("status")
        if invited_as:
            qs = qs.filter(invited_as=invited_as)
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["escrow"] = Escrow.objects.get(pk=self.kwargs["escrow_pk"])
        return context


class CommissionPoolViewSet(
    mixins.RetrieveModelMixin, mixins.UpdateModelMixin, viewsets.GenericViewSet
):
    serializer_class = CommissionPoolSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CommissionPool.objects.filter(escrow_id=self.kwargs["escrow_pk"])

    def get_object(self):
        return self.get_queryset().get()

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["pool"] = self.get_object()
        return context

    @action(detail=False, methods=["post"], url_path="lock")
    def lock(self, request, escrow_pk=None):
        pool = self.get_object()
        if pool.locked:
            return Response({"detail": "Commission pool already locked"}, status=400)
        pool.lock()
        serializer = self.get_serializer(pool)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def update(self, request, *args, **kwargs):
        pool = self.get_object()
        if pool.locked:
            return Response({"detail": "Commission pool is locked"}, status=400)
        return super().update(request, *args, **kwargs)
