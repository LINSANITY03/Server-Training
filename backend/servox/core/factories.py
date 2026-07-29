import factory
from django.utils import timezone
from core.models import AllergyTag, DiningType, Scenario, Product


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
