import pytest
from rest_framework import status
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from core.factories import ProductFactory, ScenarioFactory, SessionFactory
from core.models import DiningType, AllergyTag, Scenario, Product, Session
from core.serializer import (
    DiningSerializer,
    AllergySerializer,
    SessionScenarioSerializer,
    ProductSerializer,
    SessionSerializer,
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


# DiningType


@pytest.mark.django_db
def test_list_diningtype(authenticated_client):
    url = reverse("diningtype-list")
    response = authenticated_client.get(url)

    diningtypes = DiningType.objects.all()
    expected_data = DiningSerializer(diningtypes, many=True).data

    assert response.status_code == status.HTTP_200_OK
    assert response.data["results"] == expected_data


@pytest.mark.django_db
def test_retrieve_diningtype(authenticated_client):
    diningtype = DiningType.objects.create(
        name="SET-MENU",
        description="asd",
        code="ST",
        created_at=timezone.now(),
    )

    url = reverse("diningtype-detail", args=[diningtype.id])
    response = authenticated_client.get(url)

    expected_data = DiningSerializer(diningtype).data

    assert response.status_code == status.HTTP_200_OK
    assert response.data == expected_data


@pytest.mark.django_db
def test_retrieve_diningtype_not_found(authenticated_client):
    url = reverse("diningtype-detail", args=[99999])
    response = authenticated_client.get(url)

    assert response.status_code == status.HTTP_404_NOT_FOUND


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
def test_list_session_scenario(authenticated_client):
    url = reverse("sessionscenario-list")
    response = authenticated_client.get(url)

    scenario = Scenario.objects.all()
    expected_data = SessionScenarioSerializer(scenario, many=True).data

    assert response.status_code == status.HTTP_200_OK
    assert response.data["results"] == expected_data


@pytest.mark.django_db
def test_retrieve_session_scenario(authenticated_client):
    factory_scenario = ScenarioFactory.create()
    url = reverse("sessionscenario-detail", args=[factory_scenario.id])
    response = authenticated_client.get(url)

    expected_data = SessionScenarioSerializer(factory_scenario).data

    assert response.status_code == status.HTTP_200_OK
    assert response.data == expected_data


@pytest.mark.django_db
def test_create_session_scenario(authenticated_client):

    url = reverse("sessionscenario-list")
    scenario_data = ScenarioFactory.create()
    payload = {
        "name": scenario_data.name,
        "description": scenario_data.description,
        "guest_count": scenario_data.guest_count,
        "dining_type": scenario_data.dining_type.id,
        "allergy": scenario_data.allergy.id,
    }
    response = authenticated_client.post(url, payload, format="json")

    assert response.status_code == status.HTTP_201_CREATED

    new_id = response.data.get("id")
    created = Scenario.objects.get(id=new_id)
    expected_data = SessionScenarioSerializer(created).data
    assert new_id == expected_data.get("id")


@pytest.mark.django_db
def test_update_session_scenario(authenticated_client):

    scenario_data = ScenarioFactory.create()
    payload = {
        "name": scenario_data.name,
        "description": "asdasd",
        "guest_count": 15,
        "dining_type": scenario_data.dining_type.id,
        "allergy": scenario_data.allergy.id,
    }
    url = reverse("sessionscenario-detail", args=[scenario_data.id])
    response = authenticated_client.put(url, payload, format="json")

    assert response.status_code == status.HTTP_200_OK
    created = Scenario.objects.get(id=scenario_data.id)
    expected_data = SessionScenarioSerializer(created).data
    assert response.data == expected_data


@pytest.mark.django_db
def test_partial_update_session_scenario(authenticated_client):

    scenario_data = ScenarioFactory.create()
    payload = {
        "guest_count": 15,
    }
    url = reverse("sessionscenario-detail", args=[scenario_data.id])
    response = authenticated_client.patch(url, payload, format="json")

    assert response.status_code == status.HTTP_200_OK
    created = Scenario.objects.get(id=scenario_data.id)
    expected_data = SessionScenarioSerializer(created).data
    assert expected_data["guest_count"] == payload.get("guest_count")


@pytest.mark.django_db
def test_delete_session_scenario(authenticated_client):

    scenario_data = ScenarioFactory.create()
    url = reverse("sessionscenario-detail", args=[scenario_data.id])
    response = authenticated_client.delete(url, format="json")

    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert not Scenario.objects.filter(id=scenario_data.id).exists()


# Product


@pytest.mark.django_db
def test_list_product(authenticated_client):
    url = reverse("product-list")
    response = authenticated_client.get(url)

    product = Product.objects.all()
    expected_data = ProductSerializer(product, many=True).data

    assert response.status_code == status.HTTP_200_OK
    assert response.data["results"] == expected_data


@pytest.mark.django_db
def test_retrieve_product(authenticated_client):
    product_data = ProductFactory.create()
    url = reverse("product-detail", args=[product_data.id])
    response = authenticated_client.get(url)

    expected_data = ProductSerializer(product_data).data

    assert response.status_code == status.HTTP_200_OK
    assert response.data == expected_data


@pytest.mark.django_db
def test_retrieve_product_not_found(authenticated_client):
    url = reverse("product-detail", args=[99999])
    response = authenticated_client.get(url)

    assert response.status_code == status.HTTP_404_NOT_FOUND


# Session


@pytest.mark.django_db
def test_list_session(authenticated_client):
    url = reverse("session-list")
    response = authenticated_client.get(url)

    session = Session.objects.all()
    expected_data = SessionSerializer(session, many=True).data

    assert response.status_code == status.HTTP_200_OK
    assert response.data["results"] == expected_data


@pytest.mark.django_db
def test_retrieve_session(authenticated_client):

    factory_session = SessionFactory.create()
    url = reverse("session-detail", args=[factory_session.id])
    response = authenticated_client.get(url)

    expected_data = SessionSerializer(factory_session).data

    assert response.status_code == status.HTTP_200_OK
    assert response.data == expected_data


@pytest.mark.django_db
def test_create_session(authenticated_client):

    url = reverse("session-list")
    session_data = SessionFactory.create()
    payload = {
        "user": session_data.user.id,
        "scenario_id": session_data.scenario.id,
        "metadata": session_data.metadata,
        "status": session_data.status,
        "allergy": [{"id": allergy.id} for allergy in session_data.allergy.all()],
    }
    response = authenticated_client.post(url, payload, format="json")

    assert response.status_code == status.HTTP_201_CREATED

    new_id = response.data.get("uuid")
    created = Session.objects.get(uuid=new_id)
    expected_data = SessionSerializer(created).data
    assert new_id == expected_data.get("uuid")


@pytest.mark.django_db
def test_update_session(authenticated_client):

    session_data = SessionFactory.create()
    payload = {
        "scenario": session_data.scenario.id,
        "metadata": {"name": "123"},
        "status": Session.Status.COMPLETED,
        "allergy": [allergy.id for allergy in session_data.allergy.all()],
    }
    url = reverse("session-detail", args=[session_data.id])
    response = authenticated_client.put(url, payload, format="json")

    assert response.status_code == status.HTTP_200_OK
    created = Session.objects.get(uuid=session_data.uuid)
    expected_data = SessionSerializer(created).data
    assert response.data == expected_data


@pytest.mark.django_db
def test_partial_update_session(authenticated_client):

    session_data = SessionFactory.create()
    payload = {
        "status": Session.Status.COMPLETED,
    }
    url = reverse("session-detail", args=[session_data.id])
    response = authenticated_client.patch(url, payload, format="json")

    assert response.status_code == status.HTTP_200_OK
    created = Session.objects.get(id=session_data.id)
    expected_data = SessionSerializer(created).data
    assert expected_data["status"] == payload.get("status")


@pytest.mark.django_db
def test_delete_session(authenticated_client):

    session_data = SessionFactory.create()
    url = reverse("session-detail", args=[session_data.id])
    response = authenticated_client.delete(url, format="json")

    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert not Session.objects.filter(id=session_data.id).exists()
