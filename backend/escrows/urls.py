from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    BrokerRepresentationViewSet,
    CommissionPoolViewSet,
    EscrowViewSet,
    PartyViewSet,
)

router = DefaultRouter()
router.register(r"escrows", EscrowViewSet, basename="escrow")

party_list = PartyViewSet.as_view({"get": "list", "post": "create"})
party_detail = PartyViewSet.as_view(
    {"get": "retrieve", "patch": "partial_update", "delete": "destroy"}
)

broker_list = BrokerRepresentationViewSet.as_view(
    {"get": "list", "post": "create"}
)
broker_detail = BrokerRepresentationViewSet.as_view(
    {"get": "retrieve", "patch": "partial_update", "delete": "destroy"}
)

commission_pool_detail = CommissionPoolViewSet.as_view(
    {"get": "retrieve", "patch": "partial_update"}
)
commission_pool_lock = CommissionPoolViewSet.as_view({"post": "lock"})

urlpatterns = router.urls + [
    path("escrows/<int:escrow_pk>/parties/", party_list, name="party-list"),
    path(
        "escrows/<int:escrow_pk>/parties/<int:pk>/",
        party_detail,
        name="party-detail",
    ),
    path("escrows/<int:escrow_pk>/brokers/", broker_list, name="broker-list"),
    path(
        "escrows/<int:escrow_pk>/brokers/<int:pk>/",
        broker_detail,
        name="broker-detail",
    ),
    path(
        "escrows/<int:escrow_pk>/commission-pool/",
        commission_pool_detail,
        name="commission-pool",
    ),
    path(
        "escrows/<int:escrow_pk>/commission-pool/lock/",
        commission_pool_lock,
        name="commission-pool-lock",
    ),
]
