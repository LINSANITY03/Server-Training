from django.contrib import admin

from core.models import DiningType, AllergyTag, Scenario, Product, Session

# Register your models here.
admin.site.register(DiningType)


@admin.register(AllergyTag)
class AllergyTagAdmin(admin.ModelAdmin):
    list_display = ("name", "is_major")
    list_filter = ("is_major",)
    search_fields = ("name",)


@admin.register(Scenario)
class ScenarioAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "description", "dining_type", "created_at")


admin.site.register(Product)


@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ("id", "scenario", "created_at", "user")
