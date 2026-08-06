from django.contrib import admin

from core.models import AllergyTag, GuestProfile, Scenario, TrainingSession

# Register your models here.
# admin.site.register(DiningType)


@admin.register(AllergyTag)
class AllergyTagAdmin(admin.ModelAdmin):
    list_display = ("name", "is_major")
    list_filter = ("is_major",)
    search_fields = ("name",)


@admin.register(Scenario)
class ScenarioAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "description", "created_at")


@admin.register(TrainingSession)
class SessionAdmin(admin.ModelAdmin):
    list_display = ("id", "uuid", "user", "status", "started_at")


admin.site.register(GuestProfile)
