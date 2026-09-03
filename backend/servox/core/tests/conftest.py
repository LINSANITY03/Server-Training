import pytest
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

from services.llm.ollama_provider import OllamaProvider
from core.models import (
    AllergyTag,
    GuestProfile,
    Scenario,
    ScenarioStep,
    TrainingSession,
)

User = get_user_model()


@pytest.fixture
def superuser():
    return User.objects.create_user(
        username="testuser", password="testpass123", is_staff=True, is_superuser=True
    )

@pytest.fixture
def other_user():
    return User.objects.create_user(username="someone-else", password="pw", is_staff=True, is_superuser=True
    )
 
@pytest.fixture
def authenticated_client(superuser):
    client = APIClient()
    client.force_authenticate(user=superuser)
    return client

@pytest.fixture
def other_authenticated_client(other_user):
    client = APIClient()
    client.force_authenticate(user=other_user)
    return client

@pytest.fixture
def provider():
    return OllamaProvider(model="llama3", base_url="http://ollama.local:11434")


@pytest.fixture
def scenario(db):
    return Scenario.objects.create(
        name="Busy Friday Dinner Rush", description="A packed dining room."
    )


@pytest.fixture
def scenario_step(db, scenario):
    return ScenarioStep.objects.create(
        scenario=scenario,
        sequence=1,
        name="Greet the guest",
        guest_instruction="Wait to be greeted.",
        goal="Staff should greet warmly within 30 seconds.",
        success_conditions="Guest is greeted promptly and warmly.",
        failure_conditions="Guest is ignored or greeted curtly.",
    )


@pytest.fixture
def second_scenario_step(db, scenario):
    return ScenarioStep.objects.create(
        scenario=scenario,
        sequence=2,
        name="Take drink order",
        guest_instruction="Order a sparkling water.",
        goal="Staff should take the drink order accurately.",
        success_conditions="Drink order is captured correctly.",
        failure_conditions="Drink order is wrong or not taken.",
    )


@pytest.fixture
def training_session(db, superuser, scenario, scenario_step):
    return TrainingSession.objects.create(
        user=superuser,
        scenario=scenario,
        current_step=scenario_step,
    )


@pytest.fixture
def guest_profile(db, training_session):
    allergy = AllergyTag.objects.create(name="Peanuts")
    profile = GuestProfile.objects.create(
        session=training_session,
        guest_count=2,
        personality="friendly",
        knowledge_level="novice",
        occasion="Anniversary",
        notes="Prefers a window table.",
    )
    profile.allergies.set([allergy])
    return profile
