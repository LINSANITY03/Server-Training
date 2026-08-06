import pytest
from rest_framework import status
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from core.factories import AllergyTagFactory, ScenarioFactory, TrainingSessionFactory
from core.models import AllergyTag, GuestProfile, Scenario, TrainingSession
from core.serializer import (
    AllergySerializer,
    ScenarioSerializer,
    TrainingSessionSerializer,
)

User = get_user_model()


@pytest.fixture
def superuser():
    return User.objects.create_user(
        username="testuser", password="testpass123", is_staff=True, is_superuser=True
    )


@pytest.fixture
def authenticated_client(superuser):
    client = APIClient()
    client.force_authenticate(user=superuser)
    return client


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
    url = reverse("session-detail", args=[factory_session.id])
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
    url = reverse("session-detail", args=[session_data.id])
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
        "status": TrainingSession.Status.COMPLETED,
    }
    url = reverse("session-detail", args=[session_data.id])
    response = authenticated_client.patch(url, payload, format="json")

    assert response.status_code == status.HTTP_200_OK
    created = TrainingSession.objects.get(id=session_data.id)
    expected_data = TrainingSessionSerializer(created).data
    assert expected_data["status"] == payload.get("status")


@pytest.mark.django_db
def test_delete_session(authenticated_client, superuser):

    session_data = TrainingSessionFactory.create(user=superuser)
    url = reverse("session-detail", args=[session_data.id])
    response = authenticated_client.delete(url, format="json")

    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert not TrainingSession.objects.filter(id=session_data.id).exists()
