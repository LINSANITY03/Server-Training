from django.urls import path, include
from rest_framework import routers

from core.views import DiningViewSet

router = routers.DefaultRouter()
router.register(r"", DiningViewSet, basename="diningtype")

urlpatterns = [path("", include(router.urls))]
