from __future__ import annotations

from decimal import Decimal

from django.db import transaction
from django.db.models import Sum
from django.utils import timezone
from rest_framework import serializers

from accounts.serializers import UserSerializer
from .models import (
    BrokerRepresentation,
    BrokerRole,
    BrokerStatus,
    CommissionPool,
    CommissionShare,
    Escrow,
    EscrowStatus,
    Party,
    PartyRole,
)


class PartySerializer(serializers.ModelSerializer):
    class Meta:
        model = Party
        fields = ["id", "escrow", "name", "email", "role", "created_at"]
        read_only_fields = ["id", "created_at", "escrow"]

    def validate_role(self, value):
        if value not in PartyRole.values:
            raise serializers.ValidationError("Invalid party role")
        return value

    def create(self, validated_data):
        validated_data.setdefault("escrow", self.context["escrow"])
        return super().create(validated_data)

    def validate(self, attrs):
        escrow = attrs.get("escrow") or self.context.get("escrow")
        if not escrow:
            raise serializers.ValidationError("Escrow is required")
        return super().validate(attrs)


class BrokerRepresentationSerializer(serializers.ModelSerializer):
    invited_by = UserSerializer(read_only=True)
    user = UserSerializer(read_only=True)

    class Meta:
        model = BrokerRepresentation
        fields = [
            "id",
            "escrow",
            "user",
            "invited_email",
            "invited_by",
            "invited_as",
            "status",
            "invited_at",
            "responded_at",
        ]
        read_only_fields = [
            "id",
            "invited_by",
            "invited_at",
            "responded_at",
            "user",
            "escrow",
        ]

    def validate_invited_as(self, value):
        if value not in BrokerRole.values:
            raise serializers.ValidationError("Invalid broker role")
        return value

    def validate_status(self, value):
        if value not in BrokerStatus.values:
            raise serializers.ValidationError("Invalid broker status")
        return value

    def create(self, validated_data):
        validated_data.setdefault("escrow", self.context["escrow"])
        validated_data["invited_by"] = self.context["request"].user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        new_status = validated_data.get("status")
        if instance.status == BrokerStatus.ACCEPTED and new_status:
            raise serializers.ValidationError("Broker already accepted")
        if new_status == BrokerStatus.ACCEPTED:
            instance.user = instance.user or self.context["request"].user
            instance.responded_at = timezone.now()
        elif new_status in {BrokerStatus.DECLINED, BrokerStatus.PENDING}:
            instance.responded_at = timezone.now()
        return super().update(instance, validated_data)


class CommissionShareSerializer(serializers.ModelSerializer):
    broker_representation = serializers.PrimaryKeyRelatedField(
        queryset=BrokerRepresentation.objects.all()
    )

    class Meta:
        model = CommissionShare
        fields = ["id", "broker_representation", "amount"]
        read_only_fields = ["id"]

    def validate_amount(self, value: Decimal):
        if value < 0:
            raise serializers.ValidationError("Commission share cannot be negative")
        return value


class CommissionPoolSerializer(serializers.ModelSerializer):
    shares = CommissionShareSerializer(many=True, required=False)

    class Meta:
        model = CommissionPool
        fields = ["id", "escrow", "total_amount", "locked", "locked_at", "shares"]
        read_only_fields = ["id", "locked", "locked_at", "escrow"]

    def validate_total_amount(self, value: Decimal):
        if value < 0:
            raise serializers.ValidationError("Total commission cannot be negative")
        return value

    def validate(self, attrs):
        pool = self.instance or self.context.get("pool")
        if pool and pool.locked:
            raise serializers.ValidationError("Commission pool is locked")
        return super().validate(attrs)

    @transaction.atomic
    def update(self, instance, validated_data):
        shares_data = validated_data.pop("shares", None)
        instance = super().update(instance, validated_data)

        if shares_data is not None:
            existing = {share.broker_representation_id: share for share in instance.shares.all()}
            keep_ids: list[int] = []
            for share in shares_data:
                broker_rep = share["broker_representation"]
                amount = share["amount"]
                keep_ids.append(broker_rep.id)
                if broker_rep.id in existing:
                    existing[broker_rep.id].amount = amount
                    existing[broker_rep.id].save(update_fields=["amount"])
                else:
                    CommissionShare.objects.create(
                        pool=instance,
                        broker_representation=broker_rep,
                        amount=amount,
                    )
            CommissionShare.objects.filter(pool=instance).exclude(
                broker_representation_id__in=keep_ids
            ).delete()

        total_assigned = instance.shares.aggregate(total=Sum("amount")) or {
            "total": Decimal("0")
        }
        assigned = total_assigned.get("total") or Decimal("0")
        if assigned > instance.total_amount:
            raise serializers.ValidationError("Commission shares exceed pool total")
        return instance


class EscrowSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    parties = PartySerializer(many=True, read_only=True)
    broker_representations = BrokerRepresentationSerializer(many=True, read_only=True)
    commission_pool = CommissionPoolSerializer(read_only=True)

    class Meta:
        model = Escrow
        fields = [
            "id",
            "name",
            "description",
            "status",
            "created_by",
            "created_at",
            "updated_at",
            "parties",
            "broker_representations",
            "commission_pool",
        ]
        read_only_fields = [
            "id",
            "created_by",
            "created_at",
            "updated_at",
            "parties",
            "broker_representations",
            "commission_pool",
        ]

    @transaction.atomic
    def create(self, validated_data):
        request = self.context["request"]
        escrow = Escrow.objects.create(created_by=request.user, **validated_data)
        CommissionPool.objects.create(escrow=escrow)
        BrokerRepresentation.objects.create(
            escrow=escrow,
            user=request.user,
            invited_by=request.user,
            invited_email=request.user.email,
            invited_as=BrokerRole.LISTING,
            status=BrokerStatus.ACCEPTED,
            responded_at=timezone.now(),
        )
        return escrow

    def validate_status(self, value):
        if value not in EscrowStatus.values:
            raise serializers.ValidationError("Invalid escrow status")
        return value
