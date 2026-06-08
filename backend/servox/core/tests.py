import pytest
from rest_framework import status
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from core.factories import ScenarioFactory
from core.models import DiningType, ScenarioTag, AllergyTag, Scenario
from core.serializer import (
    DiningSerializer,
    ScenarioSerializer,
    AllergySerializer,
    SessionScenarioSerializer,
)

User = get_user_model()


@pytest.fixture
def superuser():
    return User.objects.create_user(
        username="testuser", password="testpass123", is_staff=True, is_superuser=True
    )


# DiningType


@pytest.mark.django_db
def test_list_diningtype(client):
    url = reverse("diningtype-list")
    response = client.get(url)

    diningtypes = DiningType.objects.all()
    expected_data = DiningSerializer(diningtypes, many=True).data

    assert response.status_code == status.HTTP_200_OK
    assert response.data["results"] == expected_data


@pytest.mark.django_db
def test_retrieve_diningtype(client):
    diningtype = DiningType.objects.create(
        name="SET-MENU",
        description="asd",
        code="ST",
        created_at=timezone.now(),
    )

    url = reverse("diningtype-detail", args=[diningtype.id])
    response = client.get(url)

    expected_data = DiningSerializer(diningtype).data

    assert response.status_code == status.HTTP_200_OK
    assert response.data == expected_data


@pytest.mark.django_db
def test_retrieve_diningtype_not_found(client):
    url = reverse("diningtype-detail", args=[99999])
    response = client.get(url)

    assert response.status_code == status.HTTP_404_NOT_FOUND


# Scenario


@pytest.mark.django_db
def test_list_scenariotag(client):
    url = reverse("scenariotag-list")
    response = client.get(url)

    scenariotags = ScenarioTag.objects.all()
    expected_data = ScenarioSerializer(scenariotags, many=True).data

    assert response.status_code == status.HTTP_200_OK
    assert response.data["results"] == expected_data


@pytest.mark.django_db
def test_retrieve_scenariotag(client):
    scenariotag = ScenarioTag.objects.create(
        name="couples", description="normal table", created_at=timezone.now()
    )
    url = reverse("scenariotag-detail", args=[scenariotag.id])
    response = client.get(url)

    expected_data = ScenarioSerializer(scenariotag).data

    assert response.status_code == status.HTTP_200_OK
    assert response.data == expected_data


@pytest.mark.django_db
def test_retrieve_scenariotag_not_found(client):
    url = reverse("scenariotag-detail", args=[12334])
    response = client.get(url)

    assert response.status_code == status.HTTP_404_NOT_FOUND


# Allergy


@pytest.mark.django_db
def test_list_allergytag(client):
    url = reverse("allergytag-list")
    response = client.get(url)

    allergytags = AllergyTag.objects.all()
    expected_data = AllergySerializer(allergytags, many=True).data

    assert response.status_code == status.HTTP_200_OK
    assert response.data["results"] == expected_data


@pytest.mark.django_db
def test_retrieve_allergytag(client):
    allergytag = AllergyTag.objects.create(name="Mango", created_at=timezone.now())
    url = reverse("allergytag-detail", args=[allergytag.id])
    response = client.get(url)

    expected_data = AllergySerializer(allergytag).data

    assert response.status_code == status.HTTP_200_OK
    assert response.data == expected_data


@pytest.mark.django_db
def test_retrieve_allergytag_not_found(client):
    url = reverse("allergytag-detail", args=[12334])
    response = client.get(url)

    assert response.status_code == status.HTTP_404_NOT_FOUND


# Session Scenario


@pytest.mark.django_db
def test_list_session_scenario(client):
    url = reverse("sessionscenario-list")
    response = client.get(url)

    scenario = Scenario.objects.all()
    expected_data = SessionScenarioSerializer(scenario, many=True).data

    assert response.status_code == status.HTTP_200_OK
    assert response.data["results"] == expected_data


@pytest.mark.django_db
def test_retrieve_session_scenario(client):
    factory_scenario = ScenarioFactory.create()
    url = reverse("sessionscenario-detail", args=[factory_scenario.id])
    response = client.get(url)

    expected_data = SessionScenarioSerializer(factory_scenario).data

    assert response.status_code == status.HTTP_200_OK
    assert response.data == expected_data


@pytest.mark.django_db
def test_create_session_scenario(superuser):

    client = APIClient()

    client.force_authenticate(user=superuser)

    url = reverse("sessionscenario-list")
    scenario_data = ScenarioFactory.create()
    payload = {
        "name": scenario_data.name,
        "description": scenario_data.description,
        "guest_count": scenario_data.guest_count,
        "dining_type": scenario_data.dining_type.id,
        "allergy": scenario_data.allergy.id,
        "scenario": scenario_data.scenario.id,
    }
    response = client.post(url, payload, format="json")

    assert response.status_code == status.HTTP_201_CREATED

    new_id = response.data.get("id")
    created = Scenario.objects.get(id=new_id)
    expected_data = SessionScenarioSerializer(created).data
    assert response.data == expected_data


@pytest.mark.django_db
def test_update_session_scenario(superuser):

    client = APIClient()

    client.force_authenticate(user=superuser)

    scenario_data = ScenarioFactory.create()
    payload = {
        "name": scenario_data.name,
        "description": "asdasd",
        "guest_count": 15,
        "dining_type": scenario_data.dining_type.id,
        "allergy": scenario_data.allergy.id,
        "scenario": scenario_data.scenario.id,
    }
    url = reverse("sessionscenario-detail", args=[scenario_data.id])
    response = client.put(url, payload, format="json")

    assert response.status_code == status.HTTP_200_OK
    created = Scenario.objects.get(id=scenario_data.id)
    expected_data = SessionScenarioSerializer(created).data
    assert response.data == expected_data


@pytest.mark.django_db
def test_partial_update_session_scenario(superuser):
    client = APIClient()

    client.force_authenticate(user=superuser)

    scenario_data = ScenarioFactory.create()
    payload = {
        "guest_count": 15,
    }
    url = reverse("sessionscenario-detail", args=[scenario_data.id])
    response = client.patch(url, payload, format="json")

    assert response.status_code == status.HTTP_200_OK
    created = Scenario.objects.get(id=scenario_data.id)
    expected_data = SessionScenarioSerializer(created).data
    assert expected_data["guest_count"] == payload.get("guest_count")


@pytest.mark.django_db
def test_delete_session_scenario(superuser):
    client = APIClient()

    client.force_authenticate(user=superuser)

    scenario_data = ScenarioFactory.create()
    url = reverse("sessionscenario-detail", args=[scenario_data.id])
    response = client.delete(url, format="json")

    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert not Scenario.objects.filter(id=scenario_data.id).exists()
