from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import AMLCheckViewSet, KYCRecordViewSet

router = DefaultRouter()
router.register(r"kyc", KYCRecordViewSet, basename="kyc-record")

escrow_kyc_list = KYCRecordViewSet.as_view({"get": "list", "post": "create"})
escrow_kyc_detail = KYCRecordViewSet.as_view(
    {"get": "retrieve", "patch": "partial_update", "delete": "destroy"}
)
run_aml = KYCRecordViewSet.as_view({"post": "run_aml"})

aml_check_list = AMLCheckViewSet.as_view({"get": "list", "post": "create"})

urlpatterns = router.urls + [
    path("escrows/<int:escrow_pk>/kyc/", escrow_kyc_list, name="escrow-kyc-list"),
    path(
        "escrows/<int:escrow_pk>/kyc/<int:pk>/",
        escrow_kyc_detail,
        name="escrow-kyc-detail",
    ),
    path(
        "escrows/<int:escrow_pk>/kyc/<int:pk>/run-aml/",
        run_aml,
        name="escrow-kyc-aml",
    ),
    path("kyc/<int:kyc_pk>/aml-checks/", aml_check_list, name="aml-check-list"),
]
