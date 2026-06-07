from rest_framework import serializers

from core.models import DiningType


class DiningSerializer(serializers.ModelSerializer):
    class Meta:
        model = DiningType
        fields = ["name", "code"]
