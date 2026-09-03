from abc import ABC, abstractmethod
from typing import Iterator, TypedDict


class ChatMessage(TypedDict):
    role: str
    content: str


class LLMProviderError(Exception):
    """Raised when an LLM provider fails to produce a usable response
    (network failure, timeout, malformed/non-conforming output)."""


class LLMProvider(ABC):
    @abstractmethod
    def stream_chat(self, messages: list[ChatMessage]) -> Iterator[str]:
        """Yield response text chunks as they arrive."""

    @abstractmethod
    def structured_chat(self, messages: list[ChatMessage], schema: dict) -> dict:
        """Return a parsed JSON object matching schema."""
