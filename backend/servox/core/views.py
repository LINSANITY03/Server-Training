from django.db import transaction
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from drf_spectacular.utils import extend_schema, extend_schema_view
from core.serializer import (
    AllergySerializer,
    DiningSerializer,
    SessionScenarioSerializer,
    ProductSerializer,
    SessionSerializer,
)
from core.models import DiningType, AllergyTag, Scenario, Product, Session

TAG_DININGTYPE = ["DiningType"]
TAG_ALLERGY = ["AllergyTag"]
TAG_SESSION_SCENARIO = ["Scenario"]
TAG_PRODUCT = ["Product"]
TAG_SESSION = ["Session"]


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


@extend_schema_view(
    list=extend_schema(
        summary="List User Training Session",
        description="Returns list of all Session",
        tags=TAG_SESSION,
    ),
    retrieve=extend_schema(
        summary="Retrieve User Training Session",
        description="Return Session of given id",
        tags=TAG_SESSION,
    ),
    create=extend_schema(
        summary="Create User Training Session",
        description="Create a new Session",
        tags=TAG_SESSION,
    ),
    update=extend_schema(
        summary="Update User Training Session",
        description="Replace an existing Session",
        tags=TAG_SESSION,
    ),
    partial_update=extend_schema(
        summary="Partially Update User Training Session",
        description="Update specific fields of an Session",
        tags=TAG_SESSION,
    ),
    destroy=extend_schema(
        summary="Delete User Training Session",
        description="Delete an Session",
        tags=TAG_SESSION,
    ),
)
class SessionViewSet(viewsets.ModelViewSet):
    queryset = Session.objects.all()
    serializer_class = SessionSerializer

    def create(self, request, *args, **kwargs):
        try:
            with transaction.atomic():
                allergies = request.data.get("allergy", [])
                scenario_id = request.data.get("scenario_id")

                session = Session.objects.create(
                    user=request.user, scenario_id=scenario_id
                )
                allergy_ids = [allergy["id"] for allergy in allergies]

                session.allergy.set(allergy_ids)

                return Response(
                    {"uuid": str(session.uuid)}, status=status.HTTP_201_CREATED
                )

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
