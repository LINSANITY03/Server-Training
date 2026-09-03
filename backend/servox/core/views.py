from django.http import StreamingHttpResponse
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from drf_spectacular.utils import extend_schema, extend_schema_view
from services.redis_cache import RedisClient
from core.serializer import (
    AllergySerializer,
    ConversationTurnSerializer,
    GuestProfileSerializer,
    ScenarioSerializer,
    SendMessageSerializer,
    TrainingSessionCreateSerializer,
    TrainingSessionSerializer,
)
from core.models import (
    AllergyTag,
    GuestProfile,
    Scenario,
    TrainingSession,
    ConversationTurn,
)
from core.renderers import EventStreamRenderer
from services.tasks import process_message

TAG_ALLERGY = ["AllergyTag"]
TAG_SESSION_SCENARIO = ["Scenario"]
TAG_SESSION = ["Session"]
TAG_GUEST_PROFILE = ["GuestProfile"]
TAG_CONVERSATION = ["Conversation"]


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

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [IsAdminUser()]
        return [IsAuthenticated()]


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
    lookup_field = "uuid"
    lookup_url_kwarg = "uuid"
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return TrainingSession.objects.none()
        return TrainingSession.objects.filter(user=self.request.user).select_related(
            "scenario",
            "current_step",
        )

    def get_serializer_class(self):
        if self.action == "create":
            return TrainingSessionCreateSerializer
        return TrainingSessionSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        session = serializer.save()

        return Response(
            {"uuid": str(session.uuid)},
            status=status.HTTP_201_CREATED,
        )

    @extend_schema(
        summary="Conversation History",
        description="Returns conversation history for this training session.",
        responses=ConversationTurnSerializer(many=True),
        tags=TAG_CONVERSATION,
    )
    @action(
        detail=True,
        methods=["get"],
        url_path="messages",
    )
    def messages(self, request, uuid=None):

        session = self.get_object()
        queryset = ConversationTurn.objects.filter(session=session).order_by(
            "message_index"
        )
        serializer = ConversationTurnSerializer(
            queryset,
            many=True,
        )

        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        summary="Send Message",
        description="Save a user message and trigger AI generation.",
        request=SendMessageSerializer,
        tags=TAG_CONVERSATION,
    )
    @messages.mapping.post
    def send_message(self, request, uuid=None):

        serializer = SendMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        session = self.get_object()
        if session.status == TrainingSession.Status.COMPLETED:
            return Response(
                {"detail": ("This training session has already been completed.")},
                status=status.HTTP_400_BAD_REQUEST,
            )

        turn = ConversationTurn.create_user_message(
            session=session,
            content=serializer.validated_data["content"],
        )

        process_message.delay(turn.id)

        return Response(
            {
                "status": "accepted",
                "message_uuid": turn.uuid,
            },
            status=status.HTTP_202_ACCEPTED,
        )

    @extend_schema(
        summary="Send Message",
        description="Save a user message and trigger AI generation.",
        request=SendMessageSerializer,
        tags=TAG_SESSION,
    )
    @action(
        detail=True,
        methods=["get"],
        url_path="stream",
        renderer_classes=[EventStreamRenderer],
    )
    def stream(self, request, uuid=None):
        session = self.get_object()
        stream_key = f"session:{session.uuid}:events"
        # "0" = read from the very start of the stream, so a late subscriber
        # still gets every event the task has already published.
        # A reconnecting EventSource sends Last-Event-ID automatically.
        start_id = request.headers.get("Last-Event-ID")
        if not start_id:
            # No Last-Event-ID = this is a fresh connection, not a resume.
            # REST already gave us history — only stream events from now on.
            start_id = "$"

        def _decode(val):
            return val.decode() if isinstance(val, bytes) else val

        def event_stream():
            redis_client = RedisClient.get_redis()
            current_id = start_id
            try:
                yield ": connected\n\n"
                while True:
                    # Blocks up to 15s waiting for new entries; returns [] on timeout
                    # so we can send a heartbeat and keep the connection alive.
                    resp = redis_client.xread(
                        {stream_key: current_id}, block=15000, count=50
                    )
                    if not resp:
                        yield ": keep-alive\n\n"
                        continue

                    _, entries = resp[0]
                    for entry_id, fields in entries:
                        current_id = entry_id
                        payload = _decode(fields.get(b"data", fields.get("data")))
                        entry_id_str = _decode(entry_id)
                        yield f"id: {entry_id_str}\ndata: {payload}\n\n"

                        # try:
                        #     event_type = json.loads(payload).get("type")
                        # except (TypeError, json.JSONDecodeError):
                        #     event_type = None
                        # if event_type in ("done", "error"):
                        #     return  # terminal event — stop holding the connection open
            except GeneratorExit:
                pass  # client disconnected; nothing to clean up, no pubsub to close

        response = StreamingHttpResponse(
            event_stream(), content_type="text/event-stream"
        )
        response["Cache-Control"] = "no-cache"
        response["X-Accel-Buffering"] = "no"
        return response


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
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return GuestProfile.objects.none()
        return GuestProfile.objects.filter(session__user=self.request.user)
