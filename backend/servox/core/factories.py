import factory
from django.utils import timezone
from django.contrib.auth import get_user_model
from core.models import AllergyTag, Scenario, TrainingSession


class AllergyTagFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = AllergyTag

    name = factory.Sequence(lambda n: f"Allergy {n}")
    created_at = timezone.now()


class ScenarioFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Scenario

    name = factory.Sequence(lambda n: f"Scenario {n}")
    description = "Test description"
    is_active = True

    @classmethod
    def api_payload(cls):
        obj = cls.build()
        return {
            "name": obj.name,
            "description": obj.description,
            "is_active": obj.is_active,
        }


class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = get_user_model()

    username = factory.Sequence(lambda n: f"user{n}")
    email = factory.LazyAttribute(lambda obj: f"{obj.username}@example.com")


class TrainingSessionFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = TrainingSession

    scenario = factory.SubFactory(ScenarioFactory)
    current_step = None
    metadata = factory.LazyFunction(dict)
    status = TrainingSession.Status.ONGOING
    score = 0
