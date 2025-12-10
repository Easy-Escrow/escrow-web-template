from __future__ import annotations

from decimal import Decimal

from django.conf import settings
from django.db import models
from django.utils import timezone


class EscrowStatus(models.TextChoices):
    DRAFT = "DRAFT", "Draft"
    ACTIVE = "ACTIVE", "Active"
    LOCKED = "LOCKED", "Locked"


class PartyRole(models.TextChoices):
    BUYER = "BUYER", "Buyer"
    SELLER = "SELLER", "Seller"
    BROKER = "BROKER", "Broker"


class Currency(models.TextChoices):
    USD = "USD", "USD"
    MXN = "MXN", "MXN"


class TransactionType(models.TextChoices):
    COMMISSION = "COMMISSION", "Comisión inmobiliaria"
    DUE_DILIGENCE = "DUE_DILIGENCE", "Due diligence"
    HIDDEN_DEFECTS = "HIDDEN_DEFECTS", "Vicios ocultos"


class PropertyType(models.TextChoices):
    HOUSE = "HOUSE", "Casa"
    APARTMENT = "APARTMENT", "Departamento"
    LAND = "LAND", "Terreno"
    COMMERCIAL = "COMMERCIAL", "Local comercial"
    OFFICE = "OFFICE", "Oficina"


class PartySide(models.TextChoices):
    BUYER = "BUYER", "Buyer"
    SELLER = "SELLER", "Seller"
    BOTH = "BOTH", "Both"


class Escrow(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    participant_role = models.CharField(max_length=20, choices=PartyRole.choices, default=PartyRole.BUYER)
    currency = models.CharField(max_length=5, choices=Currency.choices, default=Currency.USD)
    transaction_type = models.CharField(
        max_length=20, choices=TransactionType.choices, default=TransactionType.COMMISSION
    )
    property_type = models.CharField(max_length=20, choices=PropertyType.choices, default=PropertyType.HOUSE)
    property_value = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal("0"))
    closing_date = models.DateField(null=True, blank=True)
    property_address = models.TextField(blank=True)
    commission_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    commission_payer = models.CharField(max_length=10, choices=PartySide.choices, blank=True)
    commission_payment_date = models.DateField(null=True, blank=True)
    broker_a_name = models.CharField(max_length=255, blank=True)
    broker_a_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    broker_b_name = models.CharField(max_length=255, blank=True)
    broker_b_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    due_diligence_scope = models.TextField(blank=True)
    due_diligence_days = models.PositiveIntegerField(null=True, blank=True)
    due_diligence_deadline = models.DateField(null=True, blank=True)
    due_diligence_fee = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    hidden_defects_description = models.TextField(blank=True)
    retention_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    resolution_days = models.PositiveIntegerField(null=True, blank=True)
    responsible_party = models.CharField(max_length=10, choices=PartySide.choices, blank=True)
    agreement_upload = models.FileField(upload_to="agreements/", null=True, blank=True)
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
