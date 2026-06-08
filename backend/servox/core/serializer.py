from rest_framework import serializers

from core.models import DiningType, ScenarioTag, AllergyTag


class DiningSerializer(serializers.ModelSerializer):
    class Meta:
        model = DiningType
        fields = ["name", "code"]


class ScenarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScenarioTag
        fields = ["name", "description"]


class AllergySerializer(serializers.ModelSerializer):
    class Meta:
        model = AllergyTag
        fields = ["name"]
