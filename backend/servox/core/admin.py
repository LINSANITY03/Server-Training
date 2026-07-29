from django.contrib import admin

from core.models import DiningType, AllergyTag, Scenario, Product, Session

# Register your models here.
admin.site.register(DiningType)


@admin.register(AllergyTag)
class AllergyTagAdmin(admin.ModelAdmin):
    list_display = ("name", "is_major")
    list_filter = ("is_major",)
    search_fields = ("name",)


admin.site.register(Scenario)
admin.site.register(Product)
admin.site.register(Session)
