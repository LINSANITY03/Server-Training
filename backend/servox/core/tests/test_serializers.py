# ---------------------------------------------------------------------------
# SendMessageSerializer
# ---------------------------------------------------------------------------


import pytest
from rest_framework.test import APIRequestFactory
from core.models import AllergyTag, ConversationTurn, GuestProfile, TrainingSession
from core.serializer import (
    ConversationTurnSerializer,
    SendMessageSerializer,
    TrainingSessionCreateSerializer,
    TrainingSessionSerializer,
)


class TestSendMessageSerializer:
    def test_valid_content_passes(self):
        serializer = SendMessageSerializer(data={"content": "Hello there"})
        assert serializer.is_valid()
        assert serializer.validated_data["content"] == "Hello there"

    def test_empty_string_is_rejected(self):
        serializer = SendMessageSerializer(data={"content": ""})
        assert not serializer.is_valid()
        assert "content" in serializer.errors

    def test_whitespace_only_is_rejected(self):
        serializer = SendMessageSerializer(data={"content": "   "})
        assert not serializer.is_valid()
        assert "content" in serializer.errors

    def test_whitespace_only_rejection_comes_from_the_field_not_validate_content(self):
        """
        NOTE: `validate_content`'s own `if not value.strip(): raise ...`
        check appears to be dead code as currently configured. `CharField`
        has `trim_whitespace=True` and `allow_blank` defaults to False, and
        DRF's `CharField.run_validation` already rejects any value that
        strips down to "" (with error code "blank") before
        `to_internal_value`/`validate_content` ever runs. By the time
        `validate_content` sees `value`, it has already been trimmed and
        already guaranteed non-blank, so `value.strip()` can never be
        falsy there. This test pins down *which* layer actually rejects
        whitespace-only input today.
        """
        serializer = SendMessageSerializer(data={"content": "   "})
        assert not serializer.is_valid()
        assert serializer.errors["content"][0].code == "blank"

    def test_over_max_length_is_rejected(self):
        serializer = SendMessageSerializer(data={"content": "x" * 5001})
        assert not serializer.is_valid()
        assert "content" in serializer.errors

    def test_exactly_max_length_is_accepted(self):
        serializer = SendMessageSerializer(data={"content": "x" * 5000})
        assert serializer.is_valid(), serializer.errors

    def test_missing_content_key_is_rejected(self):
        serializer = SendMessageSerializer(data={})
        assert not serializer.is_valid()
        assert "content" in serializer.errors


# ---------------------------------------------------------------------------
# ConversationTurnSerializer
# ---------------------------------------------------------------------------


class TestConversationTurnSerializer:
    def test_serializes_expected_fields_only(self, db, training_session):
        turn = ConversationTurn.create_user_message(
            session=training_session, content="hi"
        )

        data = ConversationTurnSerializer(turn).data

        assert set(data.keys()) == {"uuid", "role", "content", "created_at"}
        assert data["content"] == "hi"
        assert data["role"] == "User"
        assert data["uuid"] == str(turn.uuid)


# ---------------------------------------------------------------------------
# TrainingSessionSerializer
# ---------------------------------------------------------------------------


class TestTrainingSessionSerializer:
    def test_excludes_started_at_last_edited_and_end_at(self, db, training_session):
        data = TrainingSessionSerializer(training_session).data
        for excluded_field in ("started_at", "last_edited", "end_at"):
            assert excluded_field not in data

    def test_declared_read_only_fields_are_ignored_on_input(
        self, db, training_session, other_user
    ):
        """Posting new values for the read-only fields should not change
        them when saved -- DRF silently drops read-only input."""
        serializer = TrainingSessionSerializer(
            training_session,
            data={"status": TrainingSession.Status.COMPLETED, "user": other_user.id},
            partial=True,
        )
        assert serializer.is_valid(), serializer.errors
        saved = serializer.save()

        assert saved.status == TrainingSession.Status.ONGOING
        assert saved.user_id == training_session.user_id


# ---------------------------------------------------------------------------
# TrainingSessionCreateSerializer
# ---------------------------------------------------------------------------


class TestTrainingSessionCreateSerializer:
    def _request_for(self, superuser):
        request = APIRequestFactory().post("/sessions/")
        request.user = superuser
        return request

    def test_create_persists_session_and_guest_profile_with_allergies(
        self, db, superuser, scenario
    ):
        peanuts = AllergyTag.objects.create(name="Peanuts")
        shellfish = AllergyTag.objects.create(name="Shellfish")

        serializer = TrainingSessionCreateSerializer(
            data={
                "scenario": scenario.id,
                "guest_profile": {
                    "guest_count": 3,
                    "personality": GuestProfile.Personality.IMPATIENT,
                    "knowledge_level": GuestProfile.Knowledge.HIGH,
                    "occasion": "Birthday",
                    "allergies": [peanuts.id, shellfish.id],
                    "notes": "Wants a booth.",
                },
            },
            context={"request": self._request_for(superuser)},
        )
        assert serializer.is_valid(), serializer.errors

        session = serializer.save()

        assert session.user_id == superuser.id
        assert session.scenario_id == scenario.id
        profile = GuestProfile.objects.get(session=session)
        assert profile.guest_count == 3
        assert profile.occasion == "Birthday"
        assert set(profile.allergies.values_list("name", flat=True)) == {
            "Peanuts",
            "Shellfish",
        }

    def test_create_works_with_no_allergies(self, db, superuser, scenario):
        serializer = TrainingSessionCreateSerializer(
            data={
                "scenario": scenario.id,
                "guest_profile": {
                    "guest_count": 1,
                    "personality": GuestProfile.Personality.FORMAL,
                    "knowledge_level": GuestProfile.Knowledge.LOW,
                    "occasion": "",
                    "allergies": [],
                    "notes": "",
                },
            },
            context={"request": self._request_for(superuser)},
        )
        assert serializer.is_valid(), serializer.errors

        session = serializer.save()
        profile = GuestProfile.objects.get(session=session)
        assert profile.allergies.count() == 0

    def test_session_is_owned_by_the_requesting_user_not_a_client_supplied_one(
        self, db, superuser, other_user, scenario
    ):
        """The view/serializer takes the user from request.context, not
        from the payload -- 'user' isn't even a writable field here."""
        serializer = TrainingSessionCreateSerializer(
            data={
                "scenario": scenario.id,
                "guest_profile": {
                    "guest_count": 1,
                    "personality": GuestProfile.Personality.QUIET,
                    "knowledge_level": GuestProfile.Knowledge.LOW,
                    "occasion": "",
                    "allergies": [],
                    "notes": "",
                },
            },
            context={"request": self._request_for(superuser)},
        )
        assert serializer.is_valid(), serializer.errors
        session = serializer.save()
        assert session.user_id == superuser.id
        assert session.user_id != other_user.id

    def test_missing_scenario_is_invalid(self, db, superuser):
        serializer = TrainingSessionCreateSerializer(
            data={
                "guest_profile": {
                    "guest_count": 1,
                    "personality": "friendly",
                    "knowledge_level": "novice",
                    "allergies": [],
                }
            },
            context={"request": self._request_for(superuser)},
        )
        assert not serializer.is_valid()
        assert "scenario" in serializer.errors

    def test_missing_guest_profile_is_invalid(self, db, superuser, scenario):
        serializer = TrainingSessionCreateSerializer(
            data={"scenario": scenario.id},
            context={"request": self._request_for(superuser)},
        )
        assert not serializer.is_valid()
        assert "guest_profile" in serializer.errors

    def test_a_failed_create_does_not_leave_a_partial_session_behind(
        self, db, superuser, scenario, mocker
    ):
        """create() is wrapped in @transaction.atomic -- if creating the
        GuestProfile blows up partway through, the TrainingSession created
        just before it should be rolled back too."""
        serializer = TrainingSessionCreateSerializer(
            data={
                "scenario": scenario.id,
                "guest_profile": {
                    "guest_count": 1,
                    "personality": GuestProfile.Personality.QUIET,
                    "knowledge_level": GuestProfile.Knowledge.LOW,
                    "occasion": "",
                    "allergies": [],
                    "notes": "",
                },
            },
            context={"request": self._request_for(superuser)},
        )
        assert serializer.is_valid(), serializer.errors
        mocker.patch(
            "core.serializer.GuestProfile.objects.create",
            side_effect=RuntimeError("db exploded"),
        )

        with pytest.raises(RuntimeError):
            serializer.save()

        assert TrainingSession.objects.count() == 0
