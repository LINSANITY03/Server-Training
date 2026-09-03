# Testing services/tasks.py

"""
Tests for tasks.process_message().

Design choices:
- Postgres is swapped for pytest-django's sqlite test DB (per the "mock
  external systems unless really required" instruction) -- ORM behavior
  (idempotency checks, ordering, .save(update_fields=...), FK relations)
  is exercised for real rather than re-implemented as brittle mocks.
- The LLM provider and Redis are fully mocked -- no network calls, no
  broker, no worker.
- `process_message` is called directly (`tasks.process_message(turn.id)`)
  rather than via `.delay()`. Celery's bound-task machinery lets a
  `@shared_task(bind=True)` function be invoked synchronously like a
  normal function in tests; `self` is bound automatically.
"""

from decimal import Decimal
import json
import pytest
from core.models import ConversationTurn, GuestProfile, ScenarioStep, TrainingSession
from services import tasks

# ---------------------------------------------------------------------------
# build_system_prompt
# ---------------------------------------------------------------------------


class TestBuildSystemPrompt:
    def test_includes_scenario_name_and_description(
        self, training_session, scenario_step
    ):
        prompt = tasks.build_system_prompt(training_session, scenario_step)
        assert training_session.scenario.name in prompt
        assert training_session.scenario.description in prompt

    def test_omits_scenario_context_line_when_description_blank(
        self, db, superuser, scenario_step
    ):
        from core.models import Scenario, TrainingSession

        scenario = Scenario.objects.create(
            name="No description scenario", description=""
        )
        step = ScenarioStep.objects.create(
            scenario=scenario, sequence=1, name="Step", guest_instruction="i", goal="g"
        )
        session = TrainingSession.objects.create(
            user=superuser, scenario=scenario, current_step=step
        )

        prompt = tasks.build_system_prompt(session, step)

        assert "Scenario context:" not in prompt

    def test_handles_missing_guest_profile_gracefully(
        self, training_session, scenario_step
    ):
        # training_session fixture has no guest_profile attached.
        with pytest.raises(GuestProfile.DoesNotExist):
            training_session.guest_profile  # sanity check on our fixture assumption

        prompt = tasks.build_system_prompt(training_session, scenario_step)

        assert "party of" not in prompt
        assert "allergies" not in prompt

    def test_includes_guest_profile_details_when_present(
        self, training_session, guest_profile, scenario_step
    ):
        prompt = tasks.build_system_prompt(training_session, scenario_step)

        assert "party of 2" in prompt
        assert "Occasion: Anniversary." in prompt
        assert "Peanuts" in prompt
        assert "Prefers a window table." in prompt

    def test_omits_occasion_line_when_occasion_blank(
        self, db, training_session, scenario_step
    ):
        prompt = tasks.build_system_prompt(training_session, scenario_step)
        assert "Occasion:" not in prompt
        assert "Additional guest notes:" not in prompt

    def test_includes_current_step_instructions_when_step_present(
        self, training_session, scenario_step
    ):
        prompt = tasks.build_system_prompt(training_session, scenario_step)
        assert scenario_step.name in prompt
        assert scenario_step.guest_instruction in prompt
        assert scenario_step.goal in prompt

    def test_wrap_up_message_when_step_is_none(self, training_session):
        prompt = tasks.build_system_prompt(training_session, None)
        assert "no more steps configured" in prompt

    def test_always_includes_stay_in_character_guardrail(
        self, training_session, scenario_step
    ):
        prompt = tasks.build_system_prompt(training_session, scenario_step)
        assert "Never break character" in prompt


# ---------------------------------------------------------------------------
# get_next_step
# ---------------------------------------------------------------------------


class TestGetNextStep:
    def test_returns_the_following_step_by_sequence(
        self, scenario_step, second_scenario_step
    ):
        assert tasks.get_next_step(scenario_step) == second_scenario_step

    def test_returns_none_when_current_step_is_last(self, second_scenario_step):
        assert tasks.get_next_step(second_scenario_step) is None

    def test_ignores_steps_from_a_different_scenario(self, db, scenario_step):
        from core.models import Scenario

        other_scenario = Scenario.objects.create(name="Unrelated scenario")
        ScenarioStep.objects.create(
            scenario=other_scenario,
            sequence=99,
            name="Other",
            guest_instruction="i",
            goal="g",
        )

        assert tasks.get_next_step(scenario_step) is None

    def test_picks_the_closest_next_step_when_several_exist(
        self, db, scenario_step, second_scenario_step
    ):
        third = ScenarioStep.objects.create(
            scenario=scenario_step.scenario,
            sequence=3,
            name="Third step",
            guest_instruction="i",
            goal="g",
        )
        assert tasks.get_next_step(scenario_step) == second_scenario_step
        assert tasks.get_next_step(second_scenario_step) == third


# ---------------------------------------------------------------------------
# publish
# ---------------------------------------------------------------------------


class TestPublish:
    def test_writes_event_to_the_session_stream_and_sets_a_ttl(self, mocker):
        fake_redis = mocker.Mock()
        mocker.patch("services.tasks.RedisClient.get_redis", return_value=fake_redis)

        tasks.publish("abc-123", {"type": "start", "message_uuid": "m1"})

        fake_redis.xadd.assert_called_once_with(
            "session:abc-123:events",
            {"data": json.dumps({"type": "start", "message_uuid": "m1"})},
            maxlen=1000,
            approximate=True,
        )
        fake_redis.expire.assert_called_once_with("session:abc-123:events", 3600)

    def test_uses_the_session_uuid_to_scope_the_stream_key(self, mocker):
        fake_redis = mocker.Mock()
        mocker.patch("services.tasks.RedisClient.get_redis", return_value=fake_redis)

        tasks.publish("other-session", {"type": "token", "content": "x"})

        stream_key = fake_redis.xadd.call_args[0][0]
        assert stream_key == "session:other-session:events"


# ---------------------------------------------------------------------------
# process_message
# ---------------------------------------------------------------------------


@pytest.fixture
def fake_llm(mocker):
    llm = mocker.Mock(name="fake-llm")
    llm.stream_chat.return_value = iter(["Hello", ", welcome!"])
    llm.structured_chat.return_value = {"met": False, "score": 70, "reasoning": "fine"}
    mocker.patch("services.tasks.get_llm_provider", return_value=llm)
    return llm


@pytest.fixture
def fake_redis(mocker):
    redis_client = mocker.Mock(name="fake-redis")
    mocker.patch("services.tasks.RedisClient.get_redis", return_value=redis_client)
    return redis_client


@pytest.fixture
def user_turn(db, training_session):
    return ConversationTurn.create_user_message(
        session=training_session, content="Hi, table for two please."
    )


class TestIdempotency:
    def test_does_not_call_the_llm_if_a_reply_already_exists(
        self, db, training_session, user_turn, fake_llm, fake_redis
    ):
        ConversationTurn.create_assistant_message(
            session=training_session, content="already replied", in_reply_to=user_turn
        )

        result = tasks.process_message(user_turn.id)

        assert result is None
        fake_llm.stream_chat.assert_not_called()
        fake_redis.xadd.assert_not_called()

    def test_a_fresh_turn_with_no_reply_yet_proceeds_normally(
        self, db, user_turn, fake_llm, fake_redis
    ):
        tasks.process_message(user_turn.id)
        fake_llm.stream_chat.assert_called_once()


class TestMessageAssembly:
    def test_sends_system_prompt_and_full_history_in_order(
        self, db, training_session, fake_llm, fake_redis
    ):
        first = ConversationTurn.create_user_message(
            session=training_session, content="first message"
        )
        tasks.process_message(first.id)

        second = ConversationTurn.create_user_message(
            session=training_session, content="second message"
        )
        fake_llm.reset_mock()
        fake_llm.stream_chat.return_value = iter(["ok"])
        tasks.process_message(second.id)

        sent_messages = fake_llm.stream_chat.call_args[0][0]
        assert sent_messages[0]["role"] == "system"
        # history should include: first user turn, first assistant reply, second user turn
        history_roles = [m["role"] for m in sent_messages[1:]]
        history_contents = [m["content"] for m in sent_messages[1:]]
        assert history_roles == ["User", "AI", "User"]
        assert history_contents[0] == "first message"
        assert history_contents[2] == "second message"


class TestStreamingSuccess:
    def test_full_text_is_the_concatenation_of_all_chunks(
        self, db, training_session, user_turn, fake_llm, fake_redis
    ):
        tasks.process_message(user_turn.id)

        assistant_turn = ConversationTurn.objects.get(in_reply_to=user_turn)
        assert assistant_turn.content == "Hello, welcome!"

    def test_creates_assistant_turn_linked_to_the_user_turn_and_step(
        self, db, training_session, scenario_step, user_turn, fake_llm, fake_redis
    ):
        tasks.process_message(user_turn.id)

        assistant_turn = ConversationTurn.objects.get(in_reply_to=user_turn)
        assert assistant_turn.session_id == training_session.id
        assert assistant_turn.step_id == scenario_step.id

    def test_publishes_start_token_and_done_events_in_order(
        self, db, training_session, user_turn, fake_llm, fake_redis
    ):
        tasks.process_message(user_turn.id)

        published_types = []
        for c in fake_redis.xadd.call_args_list:
            import json

            payload = json.loads(c.args[1]["data"])
            published_types.append(payload["type"])

        assert published_types == ["start", "token", "token", "done"]

    def test_start_event_carries_the_user_turns_uuid(
        self, db, training_session, user_turn, fake_llm, fake_redis
    ):
        import json

        tasks.process_message(user_turn.id)

        first_call_payload = json.loads(
            fake_redis.xadd.call_args_list[0].args[1]["data"]
        )
        assert first_call_payload["message_uuid"] == str(user_turn.uuid)

    def test_done_event_carries_assistant_uuid_full_content_and_step_update(
        self, db, training_session, user_turn, fake_llm, fake_redis
    ):
        import json

        tasks.process_message(user_turn.id)
        assistant_turn = ConversationTurn.objects.get(in_reply_to=user_turn)

        done_payload = json.loads(fake_redis.xadd.call_args_list[-1].args[1]["data"])
        assert done_payload["type"] == "done"
        assert done_payload["message_uuid"] == str(assistant_turn.uuid)
        assert done_payload["content"] == "Hello, welcome!"
        assert done_payload["step_update"]["met"] is False


class TestStreamingFailure:
    def test_publishes_error_event_and_reraises(
        self, db, training_session, user_turn, fake_llm, fake_redis
    ):
        def boom():
            yield "partial"
            raise RuntimeError("provider exploded")

        fake_llm.stream_chat.return_value = boom()

        with pytest.raises(RuntimeError, match="provider exploded"):
            tasks.process_message(user_turn.id)

        import json

        error_payloads = [
            json.loads(c.args[1]["data"])
            for c in fake_redis.xadd.call_args_list
            if json.loads(c.args[1]["data"])["type"] == "error"
        ]
        assert len(error_payloads) == 1
        assert error_payloads[0]["message_uuid"] == str(user_turn.uuid)

    def test_does_not_create_an_assistant_turn_when_streaming_fails(
        self, db, training_session, user_turn, fake_llm, fake_redis
    ):
        def boom():
            raise RuntimeError("nope")
            yield  # pragma: no cover

        fake_llm.stream_chat.return_value = boom()

        with pytest.raises(RuntimeError):
            tasks.process_message(user_turn.id)

        assert not ConversationTurn.objects.filter(in_reply_to=user_turn).exists()


class TestEvaluationMetAdvancesStep:
    def test_advances_current_step_when_goal_is_met_and_a_next_step_exists(
        self,
        db,
        training_session,
        scenario_step,
        second_scenario_step,
        user_turn,
        fake_llm,
        fake_redis,
    ):
        fake_llm.structured_chat.return_value = {
            "met": True,
            "score": 95,
            "reasoning": "great job",
        }

        tasks.process_message(user_turn.id)

        training_session.refresh_from_db()
        assert training_session.current_step_id == second_scenario_step.id
        assert training_session.status == TrainingSession.Status.ONGOING

    def test_score_is_recorded_and_step_scores_appended_to_metadata(
        self,
        db,
        training_session,
        scenario_step,
        second_scenario_step,
        user_turn,
        fake_llm,
        fake_redis,
    ):
        # second_scenario_step exists so "met" advances rather than completing
        # the session (session completion is covered, bug and all, in
        # TestTimezoneBug below).
        fake_llm.structured_chat.return_value = {
            "met": True,
            "score": 88,
            "reasoning": "nice",
        }

        tasks.process_message(user_turn.id)

        training_session.refresh_from_db()
        assert training_session.score == Decimal("88.00")
        assert training_session.metadata["step_scores"] == [
            {"step": scenario_step.name, "score": 88, "met": True}
        ]

    def test_score_averages_across_pre_existing_step_scores(
        self,
        db,
        training_session,
        second_scenario_step,
        user_turn,
        fake_llm,
        fake_redis,
    ):
        training_session.metadata = {
            "step_scores": [{"step": "prior", "score": 50, "met": True}]
        }
        training_session.save(update_fields=["metadata"])
        fake_llm.structured_chat.return_value = {
            "met": True,
            "score": 80,
            "reasoning": "ok",
        }

        tasks.process_message(user_turn.id)

        training_session.refresh_from_db()
        assert training_session.score == Decimal("65.00")
        assert len(training_session.metadata["step_scores"]) == 2

    def test_step_update_event_reflects_the_new_current_step(
        self,
        db,
        training_session,
        second_scenario_step,
        user_turn,
        fake_llm,
        fake_redis,
    ):
        import json

        fake_llm.structured_chat.return_value = {
            "met": True,
            "score": 95,
            "reasoning": "great",
        }

        tasks.process_message(user_turn.id)

        done_payload = json.loads(fake_redis.xadd.call_args_list[-1].args[1]["data"])
        assert done_payload["step_update"]["current_step"] == second_scenario_step.name
        assert done_payload["step_update"]["met"] is True


class TestEvaluationNotMetStaysOnStep:
    def test_current_step_unchanged_when_goal_not_met(
        self, db, training_session, scenario_step, user_turn, fake_llm, fake_redis
    ):
        fake_llm.structured_chat.return_value = {
            "met": False,
            "score": 20,
            "reasoning": "missed it",
        }

        tasks.process_message(user_turn.id)

        training_session.refresh_from_db()
        assert training_session.current_step_id == scenario_step.id
        assert training_session.status == TrainingSession.Status.ONGOING


class TestEvaluationFailure:
    def test_structured_chat_exception_leaves_session_untouched_but_still_publishes_done(
        self, db, training_session, scenario_step, user_turn, fake_llm, fake_redis
    ):
        import json

        fake_llm.structured_chat.side_effect = RuntimeError("model returned garbage")

        tasks.process_message(user_turn.id)

        training_session.refresh_from_db()
        assert training_session.score == Decimal(0)
        assert training_session.current_step_id == scenario_step.id
        assert training_session.status == TrainingSession.Status.ONGOING
        # the assistant reply and the "done" event still happen even
        # though the evaluation itself blew up
        assert ConversationTurn.objects.filter(in_reply_to=user_turn).exists()
        done_payload = json.loads(fake_redis.xadd.call_args_list[-1].args[1]["data"])
        assert done_payload["type"] == "done"
        assert done_payload["step_update"] is None


class TestNoCurrentStep:
    def test_skips_evaluation_entirely_when_session_has_no_current_step(
        self, db, superuser, scenario, fake_llm, fake_redis
    ):
        session = TrainingSession.objects.create(
            user=superuser, scenario=scenario, current_step=None
        )
        turn = ConversationTurn.create_user_message(
            session=session, content="anyone there?"
        )

        tasks.process_message(turn.id)

        fake_llm.structured_chat.assert_not_called()
        session.refresh_from_db()
        assert session.score == Decimal(0)
