import pytest

from django.urls import reverse
from django.utils import timezone

from core.models import DiningType, ScenarioTag, AllergyTag
from core.serializer import DiningSerializer, ScenarioSerializer, AllergySerializer

# DiningType


@pytest.mark.django_db
def test_list_diningtype(client):
    url = reverse("diningtype-list")
    response = client.get(url)

    diningtypes = DiningType.objects.all()
    expected_data = DiningSerializer(diningtypes, many=True).data

    assert response.status_code == 200
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

    assert response.status_code == 200
    assert response.data == expected_data


@pytest.mark.django_db
def test_retrieve_diningtype_not_found(client):
    url = reverse("diningtype-detail", args=[99999])
    response = client.get(url)

    assert response.status_code == 404


# Scenario


@pytest.mark.django_db
def test_list_scenariotag(client):
    url = reverse("scenariotag-list")
    response = client.get(url)

    scenariotags = ScenarioTag.objects.all()
    expected_data = ScenarioSerializer(scenariotags, many=True).data

    assert response.status_code == 200
    assert response.data["results"] == expected_data


@pytest.mark.django_db
def test_retrieve_scenariotag(client):
    scenariotag = ScenarioTag.objects.create(
        name="couples", description="normal table", created_at=timezone.now()
    )
    url = reverse("scenariotag-detail", args=[scenariotag.id])
    response = client.get(url)

    expected_data = ScenarioSerializer(scenariotag).data

    assert response.status_code == 200
    assert response.data == expected_data


@pytest.mark.django_db
def test_retrieve_scenariotag_not_found(client):
    url = reverse("scenariotag-detail", args=[12334])
    response = client.get(url)

    assert response.status_code == 404


# Allergy


@pytest.mark.django_db
def test_list_allergytag(client):
    url = reverse("allergytag-list")
    response = client.get(url)

    allergytags = AllergyTag.objects.all()
    expected_data = AllergySerializer(allergytags, many=True).data

    assert response.status_code == 200
    assert response.data["results"] == expected_data


@pytest.mark.django_db
def test_retrieve_allergytag(client):
    allergytag = AllergyTag.objects.create(name="Mango", created_at=timezone.now())
    url = reverse("allergytag-detail", args=[allergytag.id])
    response = client.get(url)

    expected_data = AllergySerializer(allergytag).data

    assert response.status_code == 200
    assert response.data == expected_data


@pytest.mark.django_db
def test_retrieve_allergytag_not_found(client):
    url = reverse("allergytag-detail", args=[12334])
    response = client.get(url)

    assert response.status_code == 404
