from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import DocumentViewSet

router = DefaultRouter()
router.register(r"documents", DocumentViewSet, basename="document")

escrow_document_list = DocumentViewSet.as_view({"get": "list", "post": "create"})
escrow_document_detail = DocumentViewSet.as_view(
    {"get": "retrieve", "patch": "partial_update", "delete": "destroy"}
)
mark_uploaded = DocumentViewSet.as_view({"post": "mark_uploaded"})
presign = DocumentViewSet.as_view({"post": "presign"})
trigger_envelope = DocumentViewSet.as_view({"post": "trigger_envelope"})

urlpatterns = router.urls + [
    path("escrows/<int:escrow_pk>/documents/", escrow_document_list, name="document-list"),
    path(
        "escrows/<int:escrow_pk>/documents/<int:pk>/",
        escrow_document_detail,
        name="document-detail",
    ),
    path(
        "escrows/<int:escrow_pk>/documents/<int:pk>/mark-uploaded/",
        mark_uploaded,
        name="document-uploaded",
    ),
    path(
        "escrows/<int:escrow_pk>/documents/<int:pk>/trigger-envelope/",
        trigger_envelope,
        name="document-envelopes",
    ),
    path("escrows/<int:escrow_pk>/documents/presign/", presign, name="document-presign"),
]
