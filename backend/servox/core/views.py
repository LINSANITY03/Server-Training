from rest_framework import viewsets

from core.serializer import DiningSerializer
from core.models import DiningType

class DiningViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = DiningType.objects.all()
    serializer_class = DiningSerializer