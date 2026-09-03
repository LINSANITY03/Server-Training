import time
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FutureTimeoutError

from django.db import connections
from django.http import JsonResponse
from django.db.utils import OperationalError
from django.views.decorators.cache import never_cache
from django.views.decorators.http import require_GET

CHECK_TIMEOUT_SECONDS = 2


def _check_postgres():
    start = time.monotonic()
    try:
        conn = connections["default"]
        with conn.cursor() as cursor:
            cursor.execute("SELECT 1")
        return {
            "status": "ok",
            "latency_ms": round((time.monotonic() - start) * 1000, 1),
        }
    except OperationalError as exc:
        return {"status": "down", "error": str(exc)}


def _check_redis():
    start = time.monotonic()
    try:
        import redis
        from django.conf import settings

        client = redis.from_url(
            getattr(settings, "REDIS_URL", "redis://localhost:6379/0"),
            socket_connect_timeout=CHECK_TIMEOUT_SECONDS,
            socket_timeout=CHECK_TIMEOUT_SECONDS,
        )
        client.ping()
        return {
            "status": "ok",
            "latency_ms": round((time.monotonic() - start) * 1000, 1),
        }
    except Exception as exc:
        return {"status": "down", "error": str(exc)}


def _check_celery():
    start = time.monotonic()
    try:
        from servox.celery import app as celery_app

        inspector = celery_app.control.inspect(timeout=CHECK_TIMEOUT_SECONDS)
        pings = inspector.ping()
        if not pings:
            return {"status": "down", "error": "no workers responded"}
        return {
            "status": "ok",
            "workers": list(pings.keys()),
            "latency_ms": round((time.monotonic() - start) * 1000, 1),
        }
    except Exception as exc:
        return {"status": "down", "error": str(exc)}


def _run_with_timeout(fn, timeout=CHECK_TIMEOUT_SECONDS):
    with ThreadPoolExecutor(max_workers=1) as pool:
        future = pool.submit(fn)
        try:
            return future.result(timeout=timeout)
        except FutureTimeoutError:
            return {"status": "down", "error": f"timed out after {timeout}s"}


@require_GET
@never_cache
def status_detail(request):
    postgres = _run_with_timeout(_check_postgres)
    redis_status = _run_with_timeout(_check_redis)
    celery_status = _run_with_timeout(_check_celery, timeout=CHECK_TIMEOUT_SECONDS + 1)

    critical_ok = postgres["status"] == "ok"
    all_ok = (
        critical_ok
        and redis_status["status"] == "ok"
        and celery_status["status"] == "ok"
    )

    if all_ok:
        overall = "healthy"
        http_status = 200
    elif critical_ok:
        overall = "degraded"
        http_status = 200
    else:
        overall = "unhealthy"
        http_status = 503

    return JsonResponse(
        {
            "status": overall,
            "checks": {
                "django": {"status": "ok"},
                "postgres": postgres,
                "redis": redis_status,
                "celery": celery_status,
            },
        },
        status=http_status,
    )
