from rest_framework import viewsets
from drf_spectacular.utils import extend_schema, extend_schema_view
from core.serializer import DiningSerializer
from core.models import DiningType

TAG_DININGTYPE = ["DiningType"]
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
        )
)
class DiningViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = DiningType.objects.all()
    serializer_class = DiningSerializer
