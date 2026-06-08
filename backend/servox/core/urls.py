from django.urls import path, include
from rest_framework import routers

from core.views import DiningViewSet, ScenarioViewSet

router = routers.DefaultRouter()
router.register(r"diningtype", DiningViewSet, basename="diningtype")
router.register(r"scenariotag", ScenarioViewSet, basename="scenariotag")

urlpatterns = [path("", include(router.urls))]
