from rest_framework import viewsets
from drf_spectacular.utils import extend_schema, extend_schema_view
from core.serializer import DiningSerializer, ScenarioSerializer
from core.models import DiningType, ScenarioTag

TAG_DININGTYPE = ["DiningType"]
TAG_SCENARIO = ["ScenarioTag"]


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
