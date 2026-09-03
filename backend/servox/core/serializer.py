from django.db import transaction
from rest_framework import serializers

from core.models import (
    ConversationTurn,
    GuestProfile,
    Scenario,
    AllergyTag,
    TrainingSession,
)


class AllergySerializer(serializers.ModelSerializer):
    class Meta:
        model = AllergyTag
        fields = ["name", "id"]


class ScenarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Scenario
        exclude = ["created_at", "updated_at"]


class GuestProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = GuestProfile
        exclude = ["created_at"]


class GuestProfileCreateSerializer(serializers.ModelSerializer):
    allergies = serializers.PrimaryKeyRelatedField(
        queryset=AllergyTag.objects.all(),
        many=True,
    )

    class Meta:
        model = GuestProfile
        fields = (
            "guest_count",
            "personality",
            "knowledge_level",
            "occasion",
            "notes",
            "allergies",
        )


class TrainingSessionCreateSerializer(serializers.ModelSerializer):
    guest_profile = GuestProfileCreateSerializer(write_only=True)

    class Meta:
        model = TrainingSession
        fields = (
            "scenario",
            "guest_profile",
        )

    @transaction.atomic
    def create(self, validated_data):
        guest_data = validated_data.pop("guest_profile")
        allergies = guest_data.pop("allergies")

        session = TrainingSession.objects.create(
            user=self.context["request"].user,
            **validated_data,
        )

        guest_profile = GuestProfile.objects.create(
            session=session,
            **guest_data,
        )

        guest_profile.allergies.set(allergies)

        return session


class TrainingSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainingSession
        exclude = ["started_at", "last_edited", "end_at"]
        read_only_fields = [
            "user",
            "uuid",
            "status",
            "score",
            "current_step",
            "scenario",
        ]


class ConversationTurnSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConversationTurn
        fields = (
            "uuid",
            "role",
            "content",
            "created_at",
        )


class SendMessageSerializer(serializers.Serializer):
    content = serializers.CharField(
        max_length=5000,
        trim_whitespace=True,
    )
