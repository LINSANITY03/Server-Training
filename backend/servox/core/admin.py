from django.contrib import admin

from core.models import DiningType, ScenarioTag, AllergyTag, Scenario, Product

# Register your models here.
admin.site.register(DiningType)
admin.site.register(ScenarioTag)
admin.site.register(AllergyTag)
admin.site.register(Scenario)
admin.site.register(Product)
