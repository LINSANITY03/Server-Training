from django.utils import timezone
from decimal import Decimal
import json
import logging
from celery import shared_task

from .redis_cache import RedisClient
from .llm import get_llm_provider
from core.models import (
    ActorType,
    ConversationTurn,
    GuestProfile,
    ScenarioStep,
    TrainingSession,
)

logger = logging.getLogger(__name__)

EVALUATION_SCHEMA = {
    "type": "object",
    "properties": {
        "met": {"type": "boolean"},
        "score": {"type": "integer"},
        "reasoning": {"type": "string"},
    },
    "required": ["met", "score"],
}

ROLE_MAP = {
    ActorType.SYSTEM: "system",
    ActorType.USER: "user",
    ActorType.AI: "assistant",
}


def publish(session_uuid, event: dict):
    stream_key = f"session:{session_uuid}:events"
    redis_client = RedisClient.get_redis()
    redis_client.xadd(
        stream_key, {"data": json.dumps(event)}, maxlen=1000, approximate=True
    )
    # Safety-net TTL so an abandoned stream (e.g. task crashed before "done") doesn't live forever.
    redis_client.expire(stream_key, 3600)


def get_next_step(step):
    return (
        ScenarioStep.objects.filter(
            scenario_id=step.scenario_id, sequence__gt=step.sequence
        )
        .order_by("sequence")
        .first()
    )


def build_system_prompt(session, step):
    scenario = session.scenario
    try:
        guest = session.guest_profile
    except GuestProfile.DoesNotExist:
        guest = None

    lines = [
        "You are role-playing as a restaurant guest in a staff training simulation.",
        f"Scenario: {scenario.name}",
    ]
    if scenario.description:
        lines.append(f"Scenario context: {scenario.description}")

    if guest is not None:
        lines.append(
            f"You are playing a party of {guest.guest_count}, "
            f"personality: {guest.get_personality_display()}, "
            f"menu knowledge: {guest.get_knowledge_level_display()}."
        )
        if guest.occasion:
            lines.append(f"Occasion: {guest.occasion}.")
        allergy_names = list(guest.allergies.values_list("name", flat=True))
        if allergy_names:
            lines.append(
                f"You have these allergies and should mention them if relevant: "
                f"{', '.join(allergy_names)}."
            )
        if guest.notes:
            lines.append(f"Additional guest notes: {guest.notes}")

    if step is not None:
        lines.append(f"Current training step: {step.name}. {step.guest_instruction}")
        lines.append(f"(Internal — do not reveal) Step goal: {step.goal}")
    else:
        lines.append(
            "There are no more steps configured for this scenario; wrap up the "
            "interaction naturally and thank the staff member."
        )

    lines.append(
        "Stay in character as the guest at all times. Never break character, "
        "act as the staff member, or reveal evaluation criteria."
    )
    return "\n".join(lines)


@shared_task(bind=True, max_retries=2)
def process_message(self, turn_id):
    turn = ConversationTurn.objects.select_related(
        "session", "session__current_step", "session__scenario"
    ).get(id=turn_id)
    session = turn.session
    step = session.current_step

    # Idempotency: if a retry lands after we already replied to this turn, don't redo it.
    if ConversationTurn.objects.filter(in_reply_to=turn).exists():
        return

    history = ConversationTurn.objects.filter(session=session).order_by("message_index")
    messages = [
        {
            "role": "system",
            "content": build_system_prompt(session, step),
        }
    ]
    messages += [{"role": t.role, "content": t.content} for t in history]

    llm = get_llm_provider()
    publish(session.uuid, {"type": "start", "message_uuid": str(turn.uuid)})

    full_text = ""
    try:
        for chunk in llm.stream_chat(messages):
            full_text += chunk
            publish(session.uuid, {"type": "token", "content": chunk})
    except Exception:
        logger.exception("LLM streaming failed for session %s", session.uuid)
        publish(
            session.uuid,
            {
                "type": "error",
                "message_uuid": str(turn.uuid),
                "detail": "The assistant failed to respond. Please try again.",
            },
        )
        raise

    assistant_turn = ConversationTurn.create_assistant_message(
        session=session, content=full_text, in_reply_to=turn, step=step
    )

    step_update = None
    if step is not None:
        try:
            evaluation = llm.structured_chat(
                messages=messages
                + [
                    {"role": "assistant", "content": full_text},
                    {
                        "role": "user",
                        "content": (
                            f"Evaluate the staff member's handling of the step '{step.name}': "
                            f"{step.goal}. Success looks like: {step.success_conditions}. "
                            f"Failure looks like: {step.failure_conditions}. Return JSON with "
                            f"met (bool), score (0-100), and reasoning."
                        ),
                    },
                ],
                schema=EVALUATION_SCHEMA,
            )
        except Exception:
            logger.exception("Evaluation failed for session %s", session.uuid)
            evaluation = None

        if evaluation is not None:
            next_step = get_next_step(step) if evaluation.get("met") else step

            step_scores = session.metadata.setdefault("step_scores", [])
            step_scores.append(
                {
                    "step": step.name,
                    "score": evaluation.get("score", 0),
                    "met": evaluation.get("met"),
                }
            )
            session.score = Decimal(
                sum(s["score"] for s in step_scores) / len(step_scores)
            ).quantize(Decimal("0.01"))

            if next_step is None:
                session.status = TrainingSession.Status.COMPLETED
                session.end_at = timezone.now()
            else:
                session.current_step = next_step
            session.save(
                update_fields=["score", "status", "current_step", "end_at", "metadata"]
            )

            step_update = {
                "previous_step": step.name,
                "met": evaluation.get("met"),
                "score": evaluation.get("score"),
                "current_step": next_step.name if next_step else None,
                "session_status": session.status,
            }

    publish(
        session.uuid,
        {
            "type": "done",
            "message_uuid": str(assistant_turn.uuid),
            "content": full_text,
            "step_update": step_update,
        },
    )
