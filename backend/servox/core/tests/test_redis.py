"""
Unit tests for services/redis_cache.py.

No real Redis server is used. Redis.Redis.from_url is mocked so these
tests verify RedisClient's configuration and singleton behavior without
creating a real Redis client connection.
"""

import pytest

from services.redis_cache import RedisClient


@pytest.fixture(autouse=True)
def reset_singleton():
    """RedisClient._client is a class-level singleton; make sure each test
    starts from a clean slate and doesn't leak state to the next test."""
    RedisClient._client = None
    yield
    RedisClient._client = None


def test_get_redis_raises_when_env_var_missing(monkeypatch):
    monkeypatch.delenv("REDIS_URL", raising=False)

    with pytest.raises(ValueError, match="REDIS_URL"):
        RedisClient.get_redis()


def test_get_redis_builds_client_from_url(monkeypatch, mocker):
    monkeypatch.setenv("REDIS_URL", "redis://localhost:6379/0")
    fake_client = mocker.Mock(name="fake-redis-client")
    from_url = mocker.patch(
        "services.redis_cache.redis.Redis.from_url", return_value=fake_client
    )

    client = RedisClient.get_redis()

    assert client is fake_client
    from_url.assert_called_once_with(
        "redis://localhost:6379/0",
        socket_timeout=30,
        socket_connect_timeout=5,
        health_check_interval=30,
        decode_responses=False,
    )


def test_get_redis_returns_cached_singleton_on_subsequent_calls(monkeypatch, mocker):
    monkeypatch.setenv("REDIS_URL", "redis://localhost:6379/0")
    fake_client = mocker.Mock(name="fake-redis-client")
    from_url = mocker.patch(
        "services.redis_cache.redis.Redis.from_url", return_value=fake_client
    )

    first = RedisClient.get_redis()
    second = RedisClient.get_redis()

    assert first is second
    # from_url should only ever be called once — the cached client prevents
    # repeatedly creating Redis client/connection-pool objects.
    from_url.assert_called_once()


def test_get_redis_does_not_reconstruct_client_even_if_env_var_changes_later(
    monkeypatch, mocker
):
    """Once a client is cached, get_redis() never looks at REDIS_URL again
    (this documents existing behavior, not necessarily desired behavior --
    e.g. rotating REDIS_URL at runtime won't take effect without a process
    restart or manually clearing RedisClient._client)."""
    monkeypatch.setenv("REDIS_URL", "redis://localhost:6379/0")
    fake_client = mocker.Mock(name="fake-redis-client")
    mocker.patch("services.redis_cache.redis.Redis.from_url", return_value=fake_client)
    RedisClient.get_redis()

    monkeypatch.delenv("REDIS_URL", raising=False)

    # Should NOT raise, because the cached client is returned without
    # re-checking the environment variable.
    assert RedisClient.get_redis() is fake_client
