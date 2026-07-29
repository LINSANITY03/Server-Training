from django.core.validators import MaxValueValidator
from django.contrib.auth.models import User
from django.db import models


class Profile(models.Model):
    class Meta:
        db_table = "user_profile"

    STATUS = {
        "Trainee": "Trainee",
        "Active": "Active",
        "External": "External Applicant",
    }
    user = models.OneToOneField(User, on_delete=models.DO_NOTHING)
    department = models.CharField(max_length=50)
    site = models.CharField(max_length=20)
    status = models.CharField(max_length=20, choices=STATUS, default="Trainee")
    created_at = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.department} {self.user.first_name}"


class DiningType(models.Model):
    class Meta:
        db_table = "dining_type"

    name = models.CharField(max_length=50)
    description = models.CharField(max_length=200)
    code = models.CharField(max_length=20, unique=True)
    created_at = models.DateTimeField()

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

    name = models.CharField(max_length=50)
    description = models.CharField(max_length=500)
    guest_count = models.PositiveSmallIntegerField(validators=[MaxValueValidator(20)])
    dining_type = models.ForeignKey(DiningType, on_delete=models.PROTECT)
    allergy = models.ForeignKey(AllergyTag, on_delete=models.PROTECT)
    created_at = models.DateTimeField(auto_now_add=True)


class Session(models.Model):
    class Meta:
        db_table = "training_session"

    class Status(models.TextChoices):
        ONGOING = "Ongoing", "Ongoing"
        COMPLETED = "Completed", "Completed"

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sessions")
    end_at = models.DateField()
    last_edited = models.DateField(null=True, auto_now=True)
    metadata = models.JSONField(default=dict)
    scenario = models.ForeignKey(
        Scenario, on_delete=models.PROTECT, related_name="sessions"
    )
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.ONGOING
    )
    created_at = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.scenario}-{self.id}"


class Product(models.Model):
    class Meta:
        db_table = "product"

    name = models.CharField(max_length=50)
    description = models.TextField()
    dining_type = models.ForeignKey(DiningType, on_delete=models.DO_NOTHING)
    allergy = models.ForeignKey(AllergyTag, on_delete=models.DO_NOTHING)
    created_at = models.DateTimeField()

    def __str__(self):
        return f"{self.name}"


class ChatMessage(models.Model):
    class Meta:
        db_table = "chat_message"

    STATUS = {"AI": "AI", "User": "User", "System": "System"}
    session = models.ForeignKey(Session, on_delete=models.DO_NOTHING)
    sender = models.CharField(max_length=10, choices=STATUS, default="AI")
    metadata = models.JSONField(default=dict)
    content = models.TextField()
    created_at = models.DateTimeField()

    def __str__(self):
        return f"{self.id}-{self.created_at}"


class EventLog(models.Model):
    class Meta:
        db_table = "event_log"

    STATUS = {"AI": "AI", "User": "User", "System": "System"}

    EVENT_TYPE = {
        "Started": "Started",
        "End": "End",
        "System": "System",
        "User": "User",
    }
    session = models.ForeignKey(Session, on_delete=models.DO_NOTHING)
    sender = models.CharField(max_length=10, choices=STATUS, default="AI")
    message = models.TextField()
    metadata = models.JSONField(default=dict)
    type = models.CharField(max_length=10, choices=EVENT_TYPE, default="System")
    created_at = models.DateTimeField()

    def __str__(self):
        return f"{self.id}-{self.message}"
