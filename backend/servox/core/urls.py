from django.urls import path, include
from rest_framework import routers

from core.views import (
    AllergyViewSet,
    GuestProfileViewSet,
    ScenarioViewSet,
    TrainingSessionViewSet,
)

router = routers.DefaultRouter()
router.register(r"allergytag", AllergyViewSet, basename="allergytag")
router.register(r"scenario", ScenarioViewSet, basename="scenario")
router.register(r"session", TrainingSessionViewSet, basename="session")
router.register(r"guestprofile", GuestProfileViewSet, basename="guestprofile")

urlpatterns = [path("", include(router.urls))]
