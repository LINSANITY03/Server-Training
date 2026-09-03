import json
import pytest
from rest_framework import status
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient
from core.tests.conftest import authenticated_client
from core.views import TrainingSessionViewSet
from core.factories import AllergyTagFactory, ScenarioFactory, TrainingSessionFactory
from core.models import AllergyTag, ConversationTurn, GuestProfile, Scenario, TrainingSession
from core.serializer import (
    AllergySerializer,
    ScenarioSerializer,
    TrainingSessionSerializer,
)


# Allergy


@pytest.mark.django_db
def test_list_allergytag(authenticated_client):
    url = reverse("allergytag-list")
    response = authenticated_client.get(url)

    allergytags = AllergyTag.objects.all()
    expected_data = AllergySerializer(allergytags, many=True).data

    assert response.status_code == status.HTTP_200_OK
    assert response.data["results"] == expected_data


@pytest.mark.django_db
def test_retrieve_allergytag(authenticated_client):
    allergytag = AllergyTag.objects.create(name="Mango", created_at=timezone.now())
    url = reverse("allergytag-detail", args=[allergytag.id])
    response = authenticated_client.get(url)

    expected_data = AllergySerializer(allergytag).data

    assert response.status_code == status.HTTP_200_OK
    assert response.data == expected_data


@pytest.mark.django_db
def test_retrieve_allergytag_not_found(authenticated_client):
    url = reverse("allergytag-detail", args=[12334])
    response = authenticated_client.get(url)

    assert response.status_code == status.HTTP_404_NOT_FOUND


# Scenario


@pytest.mark.django_db
def test_list_scenario(authenticated_client):
    url = reverse("scenario-list")
    response = authenticated_client.get(url)

    scenario = Scenario.objects.all()
    expected_data = ScenarioSerializer(scenario, many=True).data

    assert response.status_code == status.HTTP_200_OK
    assert response.data["results"] == expected_data


@pytest.mark.django_db
def test_retrieve_scenario(authenticated_client):
    factory_scenario = ScenarioFactory.create()
    url = reverse("scenario-detail", args=[factory_scenario.id])
    response = authenticated_client.get(url)

    expected_data = ScenarioSerializer(factory_scenario).data

    assert response.status_code == status.HTTP_200_OK
    assert response.data == expected_data


@pytest.mark.django_db
def test_create_scenario(authenticated_client):

    url = reverse("scenario-list")
    scenario_data = ScenarioFactory.api_payload()
    response = authenticated_client.post(url, scenario_data, format="json")

    assert response.status_code == status.HTTP_201_CREATED

    new_id = response.data.get("id")
    created = Scenario.objects.get(id=new_id)
    expected_data = ScenarioSerializer(created).data
    assert new_id == expected_data.get("id")


@pytest.mark.django_db
def test_update_scenario(authenticated_client):

    scenario_data = ScenarioFactory.create()
    payload = {
        "name": scenario_data.name,
        "description": "asdasd",
        "is_active": True,
    }
    url = reverse("scenario-detail", args=[scenario_data.id])
    response = authenticated_client.put(url, payload, format="json")

    assert response.status_code == status.HTTP_200_OK
    created = Scenario.objects.get(id=scenario_data.id)
    expected_data = ScenarioSerializer(created).data
    assert response.data == expected_data


@pytest.mark.django_db
def test_partial_update_scenario(authenticated_client):

    scenario_data = ScenarioFactory.create()
    payload = {
        "description": "asdasd",
    }
    url = reverse("scenario-detail", args=[scenario_data.id])
    response = authenticated_client.patch(url, payload, format="json")

    assert response.status_code == status.HTTP_200_OK
    created = Scenario.objects.get(id=scenario_data.id)
    expected_data = ScenarioSerializer(created).data
    assert expected_data["description"] == payload.get("description")


@pytest.mark.django_db
def test_delete_scenario(authenticated_client):

    scenario_data = ScenarioFactory.create()
    url = reverse("scenario-detail", args=[scenario_data.id])
    response = authenticated_client.delete(url, format="json")

    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert not Scenario.objects.filter(id=scenario_data.id).exists()


# Product


# @pytest.mark.django_db
# def test_list_product(authenticated_client):
#     url = reverse("product-list")
#     response = authenticated_client.get(url)

#     product = Product.objects.all()
#     expected_data = ProductSerializer(product, many=True).data

#     assert response.status_code == status.HTTP_200_OK
#     assert response.data["results"] == expected_data


# @pytest.mark.django_db
# def test_retrieve_product(authenticated_client):
#     product_data = ProductFactory.create()
#     url = reverse("product-detail", args=[product_data.id])
#     response = authenticated_client.get(url)

#     expected_data = ProductSerializer(product_data).data

#     assert response.status_code == status.HTTP_200_OK
#     assert response.data == expected_data


# @pytest.mark.django_db
# def test_retrieve_product_not_found(authenticated_client):
#     url = reverse("product-detail", args=[99999])
#     response = authenticated_client.get(url)

#     assert response.status_code == status.HTTP_404_NOT_FOUND


# Session


@pytest.mark.django_db
def test_list_session(authenticated_client):
    url = reverse("session-list")
    response = authenticated_client.get(url)

    session = TrainingSession.objects.all()
    expected_data = TrainingSessionSerializer(session, many=True).data

    assert response.status_code == status.HTTP_200_OK
    assert response.data["results"] == expected_data


@pytest.mark.django_db
def test_retrieve_session(authenticated_client, superuser):

    factory_session = TrainingSessionFactory.create(user=superuser)
    url = reverse("session-detail", args=[factory_session.uuid])
    response = authenticated_client.get(url)

    expected_data = TrainingSessionSerializer(factory_session).data

    assert response.status_code == status.HTTP_200_OK
    assert response.data == expected_data


@pytest.mark.django_db
def test_create_session(authenticated_client, superuser):

    url = reverse("session-list")
    scenario = ScenarioFactory()
    allergy = AllergyTagFactory()
    payload = {
        "scenario": scenario.id,
        "guest_profile": {
            "guest_count": 2,
            "personality": GuestProfile.Personality.FORMAL,
            "knowledge_level": GuestProfile.Knowledge.LOW,
            "notes": "test guest",
            "allergies": [allergy.id],
        },
    }
    response = authenticated_client.post(url, payload, format="json")

    assert response.status_code == status.HTTP_201_CREATED

    new_id = response.data.get("uuid")
    created_session = TrainingSession.objects.get(uuid=new_id)

    assert created_session.user == superuser
    assert created_session.scenario == scenario
    assert created_session.status == TrainingSession.Status.ONGOING

    guest_profile = created_session.guest_profile

    assert guest_profile.guest_count == 2
    assert guest_profile.personality == GuestProfile.Personality.FORMAL
    assert guest_profile.knowledge_level == GuestProfile.Knowledge.LOW
    assert guest_profile.notes == "test guest"

    assert list(guest_profile.allergies.values_list("id", flat=True)) == [allergy.id]


@pytest.mark.django_db
def test_update_session(authenticated_client, superuser):

    session_data = TrainingSessionFactory.create(user=superuser)
    payload = {
        "user": superuser.id,
        "scenario": session_data.scenario.id,
        "metadata": {"name": "123"},
        "status": TrainingSession.Status.COMPLETED,
        "score": 10,
        "current_step": None,
    }
    url = reverse("session-detail", args=[session_data.uuid])
    response = authenticated_client.put(url, payload, format="json")
    assert response.status_code == status.HTTP_200_OK
    session_data.refresh_from_db()
    created = TrainingSession.objects.get(uuid=session_data.uuid)
    expected_data = TrainingSessionSerializer(created).data
    assert response.data == expected_data


@pytest.mark.django_db
def test_partial_update_session(authenticated_client, superuser):

    session_data = TrainingSessionFactory.create(user=superuser)
    payload = {
        "status": TrainingSession.Status.ONGOING,
    }
    url = reverse("session-detail", args=[session_data.uuid])
    response = authenticated_client.patch(url, payload, format="json")

    assert response.status_code == status.HTTP_200_OK
    created = TrainingSession.objects.get(id=session_data.id)
    expected_data = TrainingSessionSerializer(created).data
    assert expected_data["status"] == payload.get("status")


@pytest.mark.django_db
def test_delete_session(authenticated_client, superuser):

    session_data = TrainingSessionFactory.create(user=superuser)
    url = reverse("session-detail", args=[session_data.uuid])
    response = authenticated_client.delete(url, format="json")

    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert not TrainingSession.objects.filter(id=session_data.id).exists()

 
class TestListAndRetrieve:
    def test_list_only_returns_the_requesting_users_sessions(self, db, authenticated_client, superuser, other_user, scenario):
        TrainingSession.objects.create(user=superuser, scenario=scenario)
        TrainingSession.objects.create(user=other_user, scenario=scenario)
 
        response = authenticated_client.get("/api/session/")
        print(response.data["results"])
        assert response.status_code == 200
        assert len(response.data["results"]) == 1
 
    def test_retrieve_another_users_session_is_not_found(self, db, other_authenticated_client, training_session):
        response = other_authenticated_client.get(f"/api/session/{training_session.uuid}/")
 
        assert response.status_code == 404
 
    def test_retrieve_own_session_succeeds(self, db, authenticated_client, training_session):
        response = authenticated_client.get(f"/api/session/{training_session.uuid}/")
 
        assert response.status_code == 200
        assert response.data["uuid"] == str(training_session.uuid)
 
    def test_unauthenticated_request_is_rejected(self, training_session):
        response = APIClient().get(f"/api/session/{training_session.uuid}/")
        assert response.status_code in (401, 403)
 
    def test_get_queryset_short_circuits_during_schema_generation(self, db):
        """`swagger_fake_view` is set by drf-spectacular while introspecting
        the viewset to build the OpenAPI schema (no real request.user is
        available then), so get_queryset() should return an empty queryset
        instead of touching request.user."""
        view = TrainingSessionViewSet()
        view.swagger_fake_view = True
 
        assert list(view.get_queryset()) == []

class TestCreate:
    def _payload(self, scenario):
        return {
            "scenario": scenario.id,
            "guest_profile": {
                "guest_count": 2,
                "personality": GuestProfile.Personality.FORMAL,
                "knowledge_level": GuestProfile.Knowledge.MEDIUM,
                "occasion": "",
                "allergies": [],
                "notes": "",
            },
        }
 
    def test_valid_payload_creates_a_session_owned_by_the_caller(self, db, authenticated_client, superuser, scenario):
        response = authenticated_client.post("/api/session/", self._payload(scenario), format="json")
 
        assert response.status_code == 201
        assert "uuid" in response.data
        created = TrainingSession.objects.get(uuid=response.data["uuid"])
        assert created.user_id == superuser.id
 
    def test_invalid_payload_returns_400_with_errors(self, db, authenticated_client):
        response = authenticated_client.post("/api/session/", {}, format="json")
 
        assert response.status_code == 400
        assert "scenario" in response.data
        assert "guest_profile" in response.data


class TestMessagesHistory:
    def test_returns_turns_in_message_index_order(self, db, authenticated_client, training_session):
        first = ConversationTurn.create_user_message(session=training_session, content="one")
        ConversationTurn.create_assistant_message(session=training_session, content="two", in_reply_to=first)
 
        response = authenticated_client.get(f"/api/session/{training_session.uuid}/messages/")
 
        assert response.status_code == 200
        assert [row["content"] for row in response.data] == ["one", "two"]
 
    def test_empty_history_returns_empty_list(self, db, authenticated_client, training_session):
        response = authenticated_client.get(f"/api/session/{training_session.uuid}/messages/")
 
        assert response.status_code == 200
        assert response.data == []
 
    def test_cannot_read_another_users_session_history(self, db, other_authenticated_client, other_user, training_session):
        response = other_authenticated_client.get(f"/api/session/{training_session.uuid}/messages/")
 
        assert response.status_code == 404


class TestSendMessage:
    def test_valid_message_creates_a_turn_and_enqueues_processing(self, db, authenticated_client, superuser, training_session, mocker):
        delay = mocker.patch("core.views.process_message.delay")
 
        response = authenticated_client.post(f"/api/session/{training_session.uuid}/messages/",
                                              {"content": "Table for two please"}, format="json")

        assert response.status_code == 202
        assert response.data["status"] == "accepted"
        turn = ConversationTurn.objects.get(session=training_session, content="Table for two please")
        assert response.data["message_uuid"] == turn.uuid
        delay.assert_called_once_with(turn.id)
 
    def test_empty_message_is_rejected_before_touching_the_db(self, db, authenticated_client, training_session, mocker):
        delay = mocker.patch("core.views.process_message.delay")
 
        response = authenticated_client.post(
            f"/api/session/{training_session.uuid}/messages/", {"content": "   "}, format="json")
        
        assert response.status_code == 400
        delay.assert_not_called()
        assert not ConversationTurn.objects.filter(session=training_session).exists()
 
    def test_completed_session_rejects_new_messages(self, db, authenticated_client, training_session, mocker):
        training_session.status = TrainingSession.Status.COMPLETED
        training_session.save(update_fields=["status"])
        delay = mocker.patch("core.views.process_message.delay")
 
        response = authenticated_client.post(
            f"/api/session/{training_session.uuid}/messages/", {"content": "hello?"}, format="json")
        
        assert response.status_code == 400
        assert "already been completed" in response.data["detail"]
        delay.assert_not_called()
        assert not ConversationTurn.objects.filter(session=training_session).exists()
 
    def test_cannot_send_a_message_to_another_users_session(self, db, other_authenticated_client, other_user, training_session, mocker):
        delay = mocker.patch("core.views.process_message.delay")
 
        response = other_authenticated_client.post(f"/sessions/{training_session.uuid}/messages/", {"content": "hi"}, format="json")
        
        assert response.status_code == 404
        delay.assert_not_called()
 

class TestStream:
    """
    `StreamingHttpResponse.streaming_content` is a *property* that wraps
    the view's raw generator (`response._iterator`) in `map(make_bytes, ...)`
    on every access, and each chunk comes back as `bytes`. So: grab
    `response.streaming_content` once and reuse that same map object to
    pull further chunks, decode bytes -> str for readable assertions, and
    close the underlying generator via `response._iterator.close()`
    (mirroring what Django does when a client disconnects).
    """
 
    def _fake_redis_with_reads(self, mocker, *xread_results):
        fake_redis = mocker.Mock()
        fake_redis.xread.side_effect = list(xread_results)
        mocker.patch("core.views.RedisClient.get_redis", return_value=fake_redis)
        return fake_redis
 
    def _next_chunks(self, response, n):
        it = response.streaming_content
        return [next(it).decode() for _ in range(n)]
 
    def test_first_chunk_is_a_connected_comment(self, db, authenticated_client, training_session, mocker):
        self._fake_redis_with_reads(mocker, [])
 
        response = authenticated_client.get(f"/api/session/{training_session.uuid}/stream/")
 
        first_chunk = self._next_chunks(response, 1)[0]
        response._iterator.close()
 
        assert first_chunk == ": connected\n\n"
 
    def test_response_has_sse_headers(self, db, authenticated_client, training_session, mocker):
        self._fake_redis_with_reads(mocker, [])
 
        response = authenticated_client.get(f"/api/session/{training_session.uuid}/stream/")
 
        assert response["Cache-Control"] == "no-cache"
        assert response["X-Accel-Buffering"] == "no"
        assert response["Content-Type"].startswith("text/event-stream")
        response._iterator.close()
 
    def test_empty_xread_response_yields_a_keep_alive(self, db, authenticated_client, training_session, mocker):
        self._fake_redis_with_reads(mocker, [], [])
 
        response = authenticated_client.get(f"/api/session/{training_session.uuid}/stream/")
 
        chunks = self._next_chunks(response, 2)
        response._iterator.close()
 
        assert chunks == [": connected\n\n", ": keep-alive\n\n"]
 
    def test_yields_formatted_sse_events_for_stream_entries(self, db, authenticated_client, training_session, mocker):
        payload = json.dumps({"type": "token", "content": "hi"}).encode()
        entries = ((f"session:{training_session.uuid}:events".encode(), [(b"1700000000000-0", {b"data": payload})]),)
        self._fake_redis_with_reads(mocker, entries)
 
        response = authenticated_client.get(f"/api/session/{training_session.uuid}/stream/")
 
        _, event_chunk = self._next_chunks(response, 2)  # [connected, event]
        response._iterator.close()
 
        assert event_chunk == f"id: 1700000000000-0\ndata: {payload.decode()}\n\n"
 
    def test_no_last_event_id_header_starts_reading_from_dollar(self, db, authenticated_client, training_session, mocker):
        fake_redis = self._fake_redis_with_reads(mocker, [])
 
        response = authenticated_client.get(f"/api/session/{training_session.uuid}/stream/")
        self._next_chunks(response, 2)  # connected, then keep-alive triggers the first xread call
        response._iterator.close()
 
        stream_key = f"session:{training_session.uuid}:events"
        fake_redis.xread.assert_called_once_with({stream_key: "$"}, block=15000, count=50)
 
    def test_last_event_id_header_resumes_from_that_id(self, db, authenticated_client, training_session, mocker):
        fake_redis = self._fake_redis_with_reads(mocker, [])
 
        response = authenticated_client.get(f"/api/session/{training_session.uuid}/stream/", HTTP_LAST_EVENT_ID="42-0")
        
        self._next_chunks(response, 2)
        response._iterator.close()
 
        stream_key = f"session:{training_session.uuid}:events"
        fake_redis.xread.assert_called_once_with({stream_key: "42-0"}, block=15000, count=50)
 
    def test_cannot_stream_another_users_session(self, db, other_authenticated_client, training_session, mocker):
        self._fake_redis_with_reads(mocker, [])
 
        response = other_authenticated_client.get(f"/api/session/{training_session.uuid}/stream/")
 
        # get_object() 404s before the streaming generator is ever touched.
        assert response.status_code == 404
 
    def test_generator_exit_on_client_disconnect_is_swallowed(self, db, authenticated_client, training_session, mocker):
        self._fake_redis_with_reads(mocker, [])
 
        response = authenticated_client.get(f"/api/session/{training_session.uuid}/stream/")
 
        self._next_chunks(response, 1)
        # Simulating a client disconnect: Django calls .close() on the
        # generator, which raises GeneratorExit inside it. The view's
        # `except GeneratorExit: pass` should swallow it cleanly rather
        # than letting it propagate as an error.
        response._iterator.close()  # should not raise