import os

from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "servox.settings")

app = Celery("servox")

app.config_from_object(
    "django.conf:settings",
    namespace="CELERY",
)

app.autodiscover_tasks()
