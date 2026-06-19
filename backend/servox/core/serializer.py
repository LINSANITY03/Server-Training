from rest_framework import serializers

from core.models import DiningType, ScenarioTag, AllergyTag, Scenario, Product


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


class SessionScenarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Scenario
        exclude = ["created_at"]


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        exclude = ["created_at"]
