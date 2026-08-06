from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from drf_spectacular.utils import extend_schema, extend_schema_view
from core.serializer import (
    AllergySerializer,
    GuestProfileSerializer,
    ScenarioSerializer,
    TrainingSessionCreateSerializer,
    TrainingSessionSerializer,
)
from core.models import AllergyTag, GuestProfile, Scenario, TrainingSession

TAG_ALLERGY = ["AllergyTag"]
TAG_SESSION_SCENARIO = ["Scenario"]
TAG_SESSION = ["Session"]
TAG_GUEST_PROFILE = ["GuestProfile"]


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
class ScenarioViewSet(viewsets.ModelViewSet):
    queryset = Scenario.objects.filter(is_active=True)
    serializer_class = ScenarioSerializer


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
class TrainingSessionViewSet(viewsets.ModelViewSet):

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return TrainingSession.objects.none()
        return TrainingSession.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.action == "create":
            return TrainingSessionCreateSerializer
        return TrainingSessionSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        if not serializer.is_valid():
            print(serializer.errors)
            return Response(serializer.errors, status=400)

        session = serializer.save()

        return Response(
            {"uuid": str(session.uuid)},
            status=status.HTTP_201_CREATED,
        )


@extend_schema_view(
    list=extend_schema(
        summary="List Guest Profile",
        description="Returns list of all Guest Profile",
        tags=TAG_GUEST_PROFILE,
    ),
    retrieve=extend_schema(
        summary="Retrieve Guest Profile",
        description="Return Guest Profile of given id",
        tags=TAG_GUEST_PROFILE,
    ),
    create=extend_schema(
        summary="Create Guest Profile",
        description="Create a new Guest Profile",
        tags=TAG_GUEST_PROFILE,
    ),
    update=extend_schema(
        summary="Update Guest Profile",
        description="Replace an existing Guest Profile",
        tags=TAG_GUEST_PROFILE,
    ),
    partial_update=extend_schema(
        summary="Partially Update Guest Profile",
        description="Update specific fields of an Guest Profile",
        tags=TAG_GUEST_PROFILE,
    ),
    destroy=extend_schema(
        summary="Delete Guest Profile",
        description="Delete an Guest Profile",
        tags=TAG_GUEST_PROFILE,
    ),
)
class GuestProfileViewSet(viewsets.ModelViewSet):
    queryset = GuestProfile.objects.all()
    serializer_class = GuestProfileSerializer
