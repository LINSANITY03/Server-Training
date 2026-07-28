from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):

    username_field = "email"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.username_field = "email"

        if "username" in self.fields:
            del self.fields["username"]

        self.fields["email"] = serializers.EmailField(write_only=True)

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token["name"] = user.username
        token["email"] = user.email

        return token


class LoginRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(write_only=True, required=True)
    password = serializers.CharField(write_only=True, required=True)
