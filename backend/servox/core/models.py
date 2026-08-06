from django.core.validators import MaxValueValidator, MinValueValidator
from django.contrib.auth.models import User
from django.db import models

import uuid


class ActorType(models.TextChoices):
    AI = "AI", "AI"
    USER = "User", "User"
    SYSTEM = "System", "System"


class Profile(models.Model):
    class Meta:
        db_table = "user_profile"

    class Status(models.TextChoices):
        Trainee = "Trainee", "Trainee"
        Active = "Active", "Active"
        External = "External Applicant", "External Applicant"

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    department = models.CharField(max_length=50)
    site = models.CharField(max_length=20)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.Active
    )
    created_at = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.department} {self.user.first_name}"


class DiningType(models.Model):
    class Meta:
        db_table = "dining_type"

    name = models.CharField(max_length=50)
    description = models.CharField(max_length=200)
    code = models.CharField(max_length=20, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name}"


class AllergyTag(models.Model):
    class Meta:
        db_table = "allergy_tag"

    name = models.CharField(max_length=50, unique=True)
    is_major = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name}"


class Scenario(models.Model):
    class Meta:
        db_table = "scenario"
        ordering = ["name"]

    name = models.CharField(max_length=50)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name}"


class ScenarioStep(models.Model):

    scenario = models.ForeignKey(
        Scenario,
        on_delete=models.CASCADE,
        related_name="steps",
    )
    sequence = models.PositiveSmallIntegerField()
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    goal = models.TextField()
    guest_instruction = models.TextField()
    expected_server_actions = models.JSONField(default=list)
    success_conditions = models.JSONField(default=list)
    failure_conditions = models.JSONField(default=list)
    is_required = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "scenario_step"
        ordering = ["scenario", "sequence"]
        constraints = [
            models.UniqueConstraint(
                fields=["scenario", "sequence"],
                name="unique_scenario_step_sequence",
            )
        ]

    def __str__(self):
        return f"{self.scenario.name} - Step {self.sequence}: {self.name}"


class TrainingSession(models.Model):
    class Meta:
        db_table = "training_session"

    class Status(models.TextChoices):
        ONGOING = "Ongoing", "Ongoing"
        COMPLETED = "Completed", "Completed"

    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sessions")
    scenario = models.ForeignKey(
        Scenario, on_delete=models.PROTECT, related_name="sessions"
    )
    current_step = models.ForeignKey(
        ScenarioStep,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="sessions",
    )
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.ONGOING
    )
    score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[
            MinValueValidator(0),
            MaxValueValidator(100),
        ],
    )
    metadata = models.JSONField(default=dict, blank=True)
    started_at = models.DateTimeField(auto_now_add=True)
    last_edited = models.DateTimeField(null=True, auto_now=True)
    end_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"{self.scenario}-{self.id}"


class GuestProfile(models.Model):
    class Meta:
        db_table = "guest_profile"

    class Personality(models.TextChoices):
        FRIENDLY = "friendly", "Friendly"
        QUIET = "quiet", "Quiet"
        TALKATIVE = "talkative", "Talkative"
        IMPATIENT = "impatient", "Impatient"
        FORMAL = "formal", "Formal"

    class Knowledge(models.TextChoices):
        LOW = "low", "Low"
        MEDIUM = "medium", "Medium"
        HIGH = "high", "High"

    class Ocassion_type(models.TextChoices):
        BIRTHDAY = "birthday", "Birthday"
        ANNIVERSARY = "anniversary", "Anniversary"

    session = models.OneToOneField(
        TrainingSession, on_delete=models.PROTECT, related_name="guest_profile"
    )
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    guest_count = models.PositiveSmallIntegerField(validators=[MaxValueValidator(25)])
    allergies = models.ManyToManyField(
        AllergyTag,
        blank=True,
        related_name="guest_profiles",
    )
    occasion = models.CharField(max_length=50, blank=True)
    personality = models.CharField(
        max_length=20,
        choices=Personality.choices,
        default=Personality.FRIENDLY,
    )
    knowledge_level = models.CharField(
        max_length=20,
        choices=Knowledge.choices,
        default=Knowledge.LOW,
    )
    notes = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Guest Profile - {self.session.uuid}"


class Product(models.Model):
    class Meta:
        db_table = "product"

    name = models.CharField(max_length=50)
    description = models.TextField()
    dining_type = models.ForeignKey(
        DiningType,
        on_delete=models.PROTECT,
        related_name="products",
    )
    allergies = models.ManyToManyField(
        AllergyTag,
        blank=True,
        related_name="products",
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name}"


class ConversationTurn(models.Model):

    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    session = models.ForeignKey(
        TrainingSession,
        related_name="turns",
        on_delete=models.CASCADE,
    )
    message_index = models.PositiveIntegerField()
    content = models.TextField()
    step = models.ForeignKey(
        ScenarioStep,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="conversation_turns",
    )
    token_usage = models.JSONField(
        default=dict,
        blank=True,
    )
    provider = models.CharField(max_length=50, blank=True)
    model_name = models.CharField(max_length=100, blank=True)
    role = models.CharField(
        max_length=10, choices=ActorType.choices, default=ActorType.AI
    )
    metadata = models.JSONField(default=dict, blank=True)
    latency_ms = models.IntegerField(
        null=True,
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "conversation_turn"

        constraints = [
            models.UniqueConstraint(
                fields=["session", "message_index"],
                name="unique_session_message_index",
            )
        ]

    def __str__(self):
        return f"{self.id}-{self.created_at}"


class EventLog(models.Model):
    class Meta:
        db_table = "event_log"

    class EventType(models.TextChoices):
        STARTED = "Started", "Started"
        END = "End", "End"
        SYSTEM = "System", "System"
        USER = "User", "User"

    session = models.ForeignKey(
        TrainingSession,
        on_delete=models.CASCADE,
        related_name="events",
    )
    sender = models.CharField(
        max_length=10, choices=ActorType.choices, default=ActorType.AI
    )
    message = models.TextField()
    metadata = models.JSONField(default=dict, blank=True)
    type = models.CharField(
        max_length=10, choices=EventType.choices, default=EventType.SYSTEM
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.id}-{self.message}"
