import pytest

from django.urls import reverse

from core.models import DiningType
from core.serializer import DiningSerializer


@pytest.mark.django_db
def test_list_diningtype(client):
    url = reverse("diningtype-list")
    response = client.get(url)

    diningtypes = DiningType.objects.all()
    expected_data = DiningSerializer(diningtypes, many=True).data

    assert response.status_code == 200
    assert response.data["results"] == expected_data
