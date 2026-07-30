import uuid
import factory
from django.utils import timezone
from django.contrib.auth import get_user_model
from core.models import AllergyTag, DiningType, Scenario, Product, Session


class DiningTypeFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = DiningType

    name = factory.Sequence(lambda n: f"DiningType {n}")
    code = factory.Sequence(lambda n: f"Code {n}")
    description = factory.Sequence(lambda n: f"Description {n}")
    created_at = timezone.now()


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
    guest_count = 5

    dining_type = factory.SubFactory(DiningTypeFactory)
    allergy = factory.SubFactory(AllergyTagFactory)
    created_at = timezone.now()


class ProductFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Product

    name = factory.Sequence(lambda n: f"Scenario {n}")
    description = factory.Sequence(lambda n: f"description {n}")
    dining_type = factory.SubFactory(DiningTypeFactory)
    allergy = factory.SubFactory(AllergyTagFactory)
    created_at = timezone.now()


class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = get_user_model()

    username = factory.Sequence(lambda n: f"user{n}")
    email = factory.LazyAttribute(lambda obj: f"{obj.username}@example.com")


class SessionFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Session
        skip_postgeneration_save = True

    uuid = factory.LazyFunction(uuid.uuid4)
    user = factory.SubFactory(UserFactory)
    scenario = factory.SubFactory(ScenarioFactory)
    metadata = factory.LazyFunction(dict)
    status = Session.Status.ONGOING

    @factory.post_generation
    def allergy(self, create, extracted, **kwargs):
        if not create:
            return

        if extracted:
            self.allergy.add(*extracted)
        else:
            self.allergy.add(AllergyTagFactory(), AllergyTagFactory())
