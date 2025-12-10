"""Project URL configuration."""
from __future__ import annotations

from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path
from django.views.decorators.http import require_GET


@require_GET
def health_check(_request):
    return JsonResponse({"status": "ok"})


urlpatterns = [
    path("admin/", admin.site.urls),
    path("health/", health_check, name="health"),
    path("", include("accounts.urls")),
    path("", include("escrows.urls")),
    path("", include("kyc.urls")),
    path("", include("documents.urls")),
]
