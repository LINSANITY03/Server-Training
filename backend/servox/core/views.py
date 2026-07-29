from rest_framework import viewsets
from drf_spectacular.utils import extend_schema, extend_schema_view
from core.serializer import (
    AllergySerializer,
    DiningSerializer,
    SessionScenarioSerializer,
    ProductSerializer,
)
from core.models import DiningType, AllergyTag, Scenario, Product

TAG_DININGTYPE = ["DiningType"]
TAG_SCENARIO = ["ScenarioTag"]
TAG_ALLERGY = ["AllergyTag"]
TAG_SESSION_SCENARIO = ["Scenario"]
TAG_PRODUCT = ["Product"]


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


@extend_schema_view(
    list=extend_schema(
        summary="List User Scenarios",
        description="Returns list of all Scenario",
        tags=TAG_SESSION_SCENARIO,
    ),
    retrieve=extend_schema(
        summary="Retrieve User Scenario",
        description="Return Scenario of given id",
        tags=TAG_SESSION_SCENARIO,
    ),
    create=extend_schema(
        summary="Create User Scenario",
        description="Create a new Scenario",
        tags=TAG_SESSION_SCENARIO,
    ),
    update=extend_schema(
        summary="Update User Scenario",
        description="Replace an existing Scenario",
        tags=TAG_SESSION_SCENARIO,
    ),
    partial_update=extend_schema(
        summary="Partially Update User Scenario",
        description="Update specific fields of an Scenario",
        tags=TAG_SESSION_SCENARIO,
    ),
    destroy=extend_schema(
        summary="Delete User Scenario",
        description="Delete an Scenario",
        tags=TAG_SESSION_SCENARIO,
    ),
)
class SessionScenarioViewSet(viewsets.ModelViewSet):
    queryset = Scenario.objects.all()
    serializer_class = SessionScenarioSerializer


@extend_schema_view(
    list=extend_schema(
        summary="List Products",
        description="Returns list of all Product",
        tags=TAG_PRODUCT,
    ),
    retrieve=extend_schema(
        summary="Retrieve Product",
        description="Return Product of given id",
        tags=TAG_PRODUCT,
    ),
)
class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
