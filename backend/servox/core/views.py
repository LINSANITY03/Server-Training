from rest_framework import viewsets
from drf_spectacular.utils import extend_schema, extend_schema_view
from core.serializer import AllergySerializer, DiningSerializer, ScenarioSerializer
from core.models import DiningType, ScenarioTag, AllergyTag

TAG_DININGTYPE = ["DiningType"]
TAG_SCENARIO = ["ScenarioTag"]
TAG_ALLERGY = ["AllergyTag"]


@extend_schema_view(
    list=extend_schema(
        summary="List Dining Types",
        description="Returns list of all DiningTypes",
        tags=TAG_DININGTYPE,
    ),
    retrieve=extend_schema(
        summary="Retrieve Dining Type",
        description="Return DiningTypes of given id",
        tags=TAG_DININGTYPE,
    ),
)
class DiningViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = DiningType.objects.all()
    serializer_class = DiningSerializer


@extend_schema_view(
    list=extend_schema(
        summary="List Scenario Types",
        description="Returns list of all ScenarioTag",
        tags=TAG_SCENARIO,
    ),
    retrieve=extend_schema(
        summary="Retrieve Scenario Type",
        description="Return ScenarioTag of given id",
        tags=TAG_SCENARIO,
    ),
)
class ScenarioViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ScenarioTag.objects.all()
    serializer_class = ScenarioSerializer


@extend_schema_view(
    list=extend_schema(
        summary="List Allergy Types",
        description="Returns list of all AllergyTag",
        tags=TAG_ALLERGY,
    ),
    retrieve=extend_schema(
        summary="Retrieve Allergy Type",
        description="Return AllergyTag of given id",
        tags=TAG_ALLERGY,
    ),
)
class AllergyViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AllergyTag.objects.all()
    serializer_class = AllergySerializer
