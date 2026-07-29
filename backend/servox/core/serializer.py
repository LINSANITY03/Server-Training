from rest_framework import serializers

from core.models import DiningType, AllergyTag, Scenario, Product


class DiningSerializer(serializers.ModelSerializer):
    class Meta:
        model = DiningType
        fields = ["name", "code"]


class AllergySerializer(serializers.ModelSerializer):
    class Meta:
        model = AllergyTag
        fields = ["name", "id"]


class SessionScenarioSerializer(serializers.ModelSerializer):
    dining_type = serializers.PrimaryKeyRelatedField(queryset=DiningType.objects.all())
    allergy = serializers.PrimaryKeyRelatedField(queryset=AllergyTag.objects.all())

    class Meta:
        model = Scenario
        exclude = ["created_at"]

    def to_representation(self, instance):
        data = super().to_representation(instance)

        data["dining_type"] = {"name": instance.dining_type.name}

        data["allergy"] = {"name": instance.allergy.name}

        return data


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        exclude = ["created_at"]
