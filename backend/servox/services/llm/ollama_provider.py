import logging
from .base import LLMProvider, LLMProviderError
import json
import requests

logger = logging.getLogger(__name__)


class OllamaProvider(LLMProvider):
    def __init__(self, model, base_url):
        self.model = model
        self.base_url = base_url

    def stream_chat(self, messages):
        try:
            resp = requests.post(
                f"{self.base_url}/api/chat",
                json={"model": self.model, "messages": messages, "stream": True},
                stream=True,
                timeout=60,
            )
            resp.raise_for_status()
        except requests.RequestException as exc:
            logger.exception("Ollama stream_chat request failed")
            raise LLMProviderError(
                "Failed to reach the language model service."
            ) from exc

        for line in resp.iter_lines():
            if not line:
                continue
            try:
                chunk = json.loads(line)
            except json.JSONDecodeError:
                logger.warning("Skipping malformed Ollama chunk: %r", line)
                continue
            if content := chunk.get("message", {}).get("content"):
                yield content
            if chunk.get("done"):
                if chunk.get("error"):
                    raise LLMProviderError(chunk["error"])
                break

    def structured_chat(self, messages, schema):
        try:
            resp = requests.post(
                f"{self.base_url}/api/chat",
                json={
                    "model": self.model,
                    "messages": messages,
                    "format": schema,
                    "stream": False,
                },
                timeout=60,
            )
            resp.raise_for_status()
            return json.loads(resp.json()["message"]["content"])
        except (requests.RequestException, KeyError, json.JSONDecodeError) as exc:
            logger.exception("Ollama structured_chat failed")
            raise LLMProviderError(
                "Failed to get a structured evaluation from the model."
            ) from exc
