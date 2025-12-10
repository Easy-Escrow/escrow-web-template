from __future__ import annotations

from django.conf import settings
from django.db import models

from escrows.models import Escrow


class KYCStatus(models.TextChoices):
    STARTED = "STARTED", "Started"
    PENDING_REVIEW = "PENDING_REVIEW", "Pending review"
    APPROVED = "APPROVED", "Approved"
    REJECTED = "REJECTED", "Rejected"


class AMLStatus(models.TextChoices):
    PENDING = "PENDING", "Pending"
    RUNNING = "RUNNING", "Running"
    PASS = "PASS", "Pass"
    FAIL = "FAIL", "Fail"
    ERROR = "ERROR", "Error"


class AMLProvider(models.TextChoices):
    OFAC = "OFAC", "OFAC"
    INTERNAL = "INTERNAL", "Internal"
    MANUAL = "MANUAL", "Manual"


class KYCRecord(models.Model):
    escrow = models.ForeignKey(Escrow, related_name="kyc_records", on_delete=models.CASCADE)
    subject_name = models.CharField(max_length=255)
    subject_email = models.EmailField(blank=True)
    status = models.CharField(max_length=32, choices=KYCStatus.choices, default=KYCStatus.STARTED)
    checklist = models.JSONField(default=dict, blank=True)
    assigned_officer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="kyc_assigned",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):  # pragma: no cover - representation
        return f"KYC for {self.subject_name} ({self.escrow_id})"


class AMLCheck(models.Model):
    record = models.ForeignKey(KYCRecord, related_name="aml_checks", on_delete=models.CASCADE)
    provider = models.CharField(max_length=20, choices=AMLProvider.choices, default=AMLProvider.INTERNAL)
    status = models.CharField(max_length=20, choices=AMLStatus.choices, default=AMLStatus.PENDING)
    requested_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="aml_requests",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    requested_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    result_payload = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ["-requested_at"]

    def __str__(self):  # pragma: no cover - representation
        return f"AML {self.provider} for {self.record_id}"
