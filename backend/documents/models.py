from __future__ import annotations

from django.conf import settings
from django.db import models

from escrows.models import Escrow


class DocumentStatus(models.TextChoices):
    PENDING_UPLOAD = "PENDING_UPLOAD", "Pending upload"
    UPLOADED = "UPLOADED", "Uploaded"
    APPROVED = "APPROVED", "Approved"
    REJECTED = "REJECTED", "Rejected"


class DocuSignStatus(models.TextChoices):
    DRAFT = "DRAFT", "Draft"
    SENT = "SENT", "Sent"
    COMPLETED = "COMPLETED", "Completed"
    VOIDED = "VOIDED", "Voided"


class Document(models.Model):
    escrow = models.ForeignKey(Escrow, related_name="documents", on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    document_type = models.CharField(max_length=100)
    storage_key = models.CharField(max_length=255, blank=True)
    storage_url = models.URLField(blank=True)
    status = models.CharField(max_length=32, choices=DocumentStatus.choices, default=DocumentStatus.PENDING_UPLOAD)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="uploaded_documents",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    docu_sign_envelope_id = models.CharField(max_length=128, blank=True)
    docu_sign_status = models.CharField(
        max_length=20, choices=DocuSignStatus.choices, default=DocuSignStatus.DRAFT
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-uploaded_at"]

    def __str__(self):  # pragma: no cover - representation
        return self.name
