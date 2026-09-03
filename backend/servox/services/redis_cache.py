import os
import redis


class RedisClient:
    _client = None

    @classmethod
    def get_redis(cls) -> redis.Redis:
        if cls._client is None:
            redis_url = os.getenv("REDIS_URL")

            if not redis_url:
                raise ValueError("REDIS_URL environment variable is not set")

            cls._client = redis.Redis.from_url(
                redis_url,
                socket_timeout=30,
                socket_connect_timeout=5,
                health_check_interval=30,
                decode_responses=False,
            )

        return cls._client
