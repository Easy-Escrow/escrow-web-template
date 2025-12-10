from __future__ import annotations

import logging
from datetime import timedelta
from threading import Thread
from time import sleep

from django.utils import timezone

from .models import AMLCheck, AMLStatus

logger = logging.getLogger(__name__)


def _simulate_external_check(check_id: int):
    try:
        check = AMLCheck.objects.get(pk=check_id)
    except AMLCheck.DoesNotExist:  # pragma: no cover - guard
        return
    check.status = AMLStatus.RUNNING
    check.save(update_fields=["status"])
    sleep(0.5)
    check.status = AMLStatus.PASS
    check.completed_at = timezone.now() + timedelta(seconds=1)
    check.result_payload = {
        "ofac_screen": "clear",
        "pep_screen": "clear",
    }
    check.save(update_fields=["status", "completed_at", "result_payload"])
    logger.info("AML check %s completed", check_id)


def enqueue_aml_check(check: AMLCheck):
    """Fire-and-forget worker that simulates an AML/OFAC integration."""

    thread = Thread(target=_simulate_external_check, args=(check.id,), daemon=True)
    thread.start()
