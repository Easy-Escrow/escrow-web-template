from __future__ import annotations

from decimal import Decimal

from django.conf import settings
from django.db import models
from django.utils import timezone


class EscrowStatus(models.TextChoices):
    DRAFT = "DRAFT", "Draft"
    ACTIVE = "ACTIVE", "Active"
    LOCKED = "LOCKED", "Locked"


class Escrow(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    status = models.CharField(
        max_length=20,
        choices=EscrowStatus.choices,
        default=EscrowStatus.DRAFT,
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="created_escrows",
        on_delete=models.CASCADE,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:  # pragma: no cover - display helper
        return self.name


class PartyRole(models.TextChoices):
    BUYER = "BUYER", "Buyer"
    SELLER = "SELLER", "Seller"
    LENDER = "LENDER", "Lender"


class Party(models.Model):
    escrow = models.ForeignKey(Escrow, related_name="parties", on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    email = models.EmailField(blank=True)
    role = models.CharField(max_length=20, choices=PartyRole.choices)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["id"]

    def __str__(self) -> str:  # pragma: no cover - display helper
        return f"{self.name} ({self.role})"


class BrokerRole(models.TextChoices):
    LISTING = "LISTING", "Listing Broker"
    CO_BROKER = "CO_BROKER", "Co-Broker"


class BrokerStatus(models.TextChoices):
    PENDING = "PENDING", "Pending"
    ACCEPTED = "ACCEPTED", "Accepted"
    DECLINED = "DECLINED", "Declined"


class BrokerRepresentation(models.Model):
    escrow = models.ForeignKey(
        Escrow, related_name="broker_representations", on_delete=models.CASCADE
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="broker_representations",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    invited_email = models.EmailField(blank=True)
    invited_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="broker_invitations_sent",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    invited_as = models.CharField(max_length=20, choices=BrokerRole.choices)
    status = models.CharField(
        max_length=20,
        choices=BrokerStatus.choices,
        default=BrokerStatus.PENDING,
    )
    invited_at = models.DateTimeField(auto_now_add=True)
    responded_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["id"]
        unique_together = ("escrow", "invited_email", "invited_as")

    def __str__(self) -> str:  # pragma: no cover - display helper
        return f"{self.invited_email or self.user} ({self.get_invited_as_display()})"


class CommissionPool(models.Model):
    escrow = models.OneToOneField(
        Escrow, related_name="commission_pool", on_delete=models.CASCADE
    )
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0"))
    locked = models.BooleanField(default=False)
    locked_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["escrow_id"]

    def lock(self):
        self.locked = True
        self.locked_at = timezone.now()
        self.escrow.status = EscrowStatus.LOCKED
        self.escrow.save(update_fields=["status"])
        self.save(update_fields=["locked", "locked_at"])


class CommissionShare(models.Model):
    pool = models.ForeignKey(
        CommissionPool, related_name="shares", on_delete=models.CASCADE
    )
    broker_representation = models.ForeignKey(
        BrokerRepresentation, related_name="commission_shares", on_delete=models.CASCADE
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0"))

    class Meta:
        unique_together = ("pool", "broker_representation")
        ordering = ["id"]

    def __str__(self) -> str:  # pragma: no cover - display helper
        return f"{self.amount} for {self.broker_representation_id}"
