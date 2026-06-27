from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

from drf_spectacular.utils import extend_schema

from authentication.serializers import MyTokenObtainPairSerializer

TAG_TOKEN = ["Token"]


@extend_schema(
    tags=TAG_TOKEN,
    summary="Login and get JWT tokens",
    description="Obtain access and refresh JWT tokens by providing username and password.",
)
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


@extend_schema(
    tags=TAG_TOKEN,
    summary="Refresh access token",
    description="Refresh an expired access token using a valid refresh token.",
)
class CustomTokenRefreshView(TokenRefreshView):
    pass


@extend_schema(
    tags=TAG_TOKEN,
    summary="Verify token",
    description="Verify if a JWT token is valid or expired.",
)
class CustomTokenVerifyView(TokenVerifyView):
    pass
