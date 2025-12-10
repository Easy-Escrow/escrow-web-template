from __future__ import annotations

from django.db.models import Q
from rest_framework.permissions import BasePermission, SAFE_METHODS

from accounts.models import UserRole
from escrows.models import Escrow


class IsParticipantOrOfficer(BasePermission):
    """Allow access to escrow participants or compliance officers."""

    def has_object_permission(self, request, view, obj):
        if hasattr(obj, "escrow"):
            escrow = obj.escrow
        else:
            escrow = getattr(obj, "record", None)
            if escrow:
                escrow = escrow.escrow
        if escrow is None:
            return False
        return self._allowed(request.user, escrow)

    def has_permission(self, request, view):
        escrow_id = view.kwargs.get("escrow_pk")
        if escrow_id:
            try:
                escrow = Escrow.objects.get(pk=escrow_id)
            except Escrow.DoesNotExist:
                return False
            return self._allowed(request.user, escrow)
        return True

    def _allowed(self, user, escrow: Escrow):
        if not user.is_authenticated:
            return False
        if user.role in {UserRole.ADMIN, UserRole.OFFICER}:
            return True
        return (
            escrow.created_by_id == user.id
            or escrow.broker_representations.filter(
                Q(user=user) | Q(invited_email=user.email)
            ).exists()
        )

    def __call__(self):  # pragma: no cover - API compatibility
        return self


class ReadOnlyForParticipants(IsParticipantOrOfficer):
    def has_permission(self, request, view):
        base_allowed = super().has_permission(request, view)
        if request.method in SAFE_METHODS:
            return base_allowed
        if not base_allowed:
            return False
        user = request.user
        return user.role in {UserRole.ADMIN, UserRole.OFFICER}
