from __future__ import annotations

from decimal import Decimal

from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import User
from .models import BrokerRole, BrokerStatus, EscrowStatus, PartyRole


class EscrowAPITests(TestCase):
    def setUp(self):
        self.user_a = User.objects.create_user(
            email="broker.a@example.com", password="pass1234", first_name="Broker", last_name="A"
        )
        self.user_b = User.objects.create_user(
            email="broker.b@example.com", password="pass1234", first_name="Broker", last_name="B"
        )

    def client_for(self, user: User) -> APIClient:
        client = APIClient()
        client.force_authenticate(user)
        return client

    def create_escrow(self, client: APIClient):
        response = client.post(
            "/escrows/",
            {"name": "Test Deal", "description": "Downtown property"},
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        return response.data

    def test_create_escrow_initial_broker_and_pool(self):
        client = self.client_for(self.user_a)
        escrow = self.create_escrow(client)

        self.assertEqual(escrow["name"], "Test Deal")
        self.assertEqual(escrow["status"], EscrowStatus.DRAFT)
        self.assertIn("commission_pool", escrow)

        brokers = client.get(f"/escrows/{escrow['id']}/brokers/").data
        self.assertEqual(len(brokers), 1)
        self.assertEqual(brokers[0]["status"], BrokerStatus.ACCEPTED)
        self.assertEqual(brokers[0]["invited_as"], BrokerRole.LISTING)

        pool = client.get(f"/escrows/{escrow['id']}/commission-pool/").data
        self.assertEqual(pool["total_amount"], "0.00")
        self.assertFalse(pool["locked"])

    def test_party_crud_and_filtering(self):
        client = self.client_for(self.user_a)
        escrow = self.create_escrow(client)

        party_resp = client.post(
            f"/escrows/{escrow['id']}/parties/",
            {"name": "Jane Buyer", "email": "jane@example.com", "role": PartyRole.BUYER},
            format="json",
        )
        self.assertEqual(party_resp.status_code, 201)
        party_id = party_resp.data["id"]

        list_resp = client.get(f"/escrows/{escrow['id']}/parties/?role={PartyRole.BUYER}")
        self.assertEqual(len(list_resp.data), 1)

        update_resp = client.patch(
            f"/escrows/{escrow['id']}/parties/{party_id}/",
            {"name": "Updated Buyer"},
            format="json",
        )
        self.assertEqual(update_resp.data["name"], "Updated Buyer")

        delete_resp = client.delete(f"/escrows/{escrow['id']}/parties/{party_id}/")
        self.assertEqual(delete_resp.status_code, 204)

    def test_broker_invitation_flow_and_commission_locking(self):
        client_a = self.client_for(self.user_a)
        client_b = self.client_for(self.user_b)
        escrow = self.create_escrow(client_a)

        invite_resp = client_a.post(
            f"/escrows/{escrow['id']}/brokers/",
            {"invited_email": self.user_b.email, "invited_as": BrokerRole.CO_BROKER},
            format="json",
        )
        self.assertEqual(invite_resp.status_code, 201)
        invited_id = invite_resp.data["id"]

        broker_list_b = client_b.get(
            f"/escrows/{escrow['id']}/brokers/?status={BrokerStatus.PENDING}&invited_as={BrokerRole.CO_BROKER}"
        )
        self.assertEqual(len(broker_list_b.data), 1)

        accept_resp = client_b.patch(
            f"/escrows/{escrow['id']}/brokers/{invited_id}/",
            {"status": BrokerStatus.ACCEPTED},
            format="json",
        )
        self.assertEqual(accept_resp.status_code, 200)
        self.assertEqual(accept_resp.data["status"], BrokerStatus.ACCEPTED)
        self.assertIsNotNone(accept_resp.data["responded_at"])

        brokers = client_a.get(f"/escrows/{escrow['id']}/brokers/").data
        listing = next(b for b in brokers if b["invited_as"] == BrokerRole.LISTING)
        co_broker = next(b for b in brokers if b["invited_as"] == BrokerRole.CO_BROKER)

        pool_resp = client_a.patch(
            f"/escrows/{escrow['id']}/commission-pool/",
            {
                "total_amount": "10000.00",
                "shares": [
                    {"broker_representation": listing["id"], "amount": "6000.00"},
                    {"broker_representation": co_broker["id"], "amount": "4000.00"},
                ],
            },
            format="json",
        )
        self.assertEqual(pool_resp.status_code, 200)
        self.assertEqual(pool_resp.data["total_amount"], "10000.00")
        self.assertEqual(len(pool_resp.data["shares"]), 2)

        lock_resp = client_a.post(f"/escrows/{escrow['id']}/commission-pool/lock/")
        self.assertEqual(lock_resp.status_code, 200)
        self.assertTrue(lock_resp.data["locked"])

        post_lock_resp = client_a.patch(
            f"/escrows/{escrow['id']}/commission-pool/",
            {"total_amount": "15000.00"},
            format="json",
        )
        self.assertEqual(post_lock_resp.status_code, 400)

        locked_list = client_a.get(f"/escrows/?status={EscrowStatus.LOCKED}")
        self.assertGreaterEqual(locked_list.data.get("count", 0), 1)
