from django.urls import path, include
from rest_framework import routers

from core.views import (
    DiningViewSet,
    ScenarioViewSet,
    AllergyViewSet,
    SessionScenarioViewSet,
    ProductViewSet,
)

router = routers.DefaultRouter()
router.register(r"diningtype", DiningViewSet, basename="diningtype")
router.register(r"scenariotag", ScenarioViewSet, basename="scenariotag")
router.register(r"allergytag", AllergyViewSet, basename="allergytag")
router.register(r"sessionscenario", SessionScenarioViewSet, basename="sessionscenario")
router.register(r"product", ProductViewSet, basename="product")

urlpatterns = [path("", include(router.urls))]
