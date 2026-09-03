import json
import pytest
import requests

from services.llm.base import LLMProvider, LLMProviderError

# Testing services/llm/base.py


def test_llm_provider_cannot_be_instantiated_directly():
    """LLMProvider is an ABC with two abstractmethods; Python should refuse
    to instantiate it directly."""
    with pytest.raises(TypeError):
        LLMProvider()


def test_subclass_missing_a_method_still_cannot_be_instantiated():
    class Incomplete(LLMProvider):
        def stream_chat(self, messages):
            yield "hi"

        # structured_chat intentionally not implemented

    with pytest.raises(TypeError):
        Incomplete()


def test_concrete_subclass_implementing_both_methods_can_be_instantiated():
    class Concrete(LLMProvider):
        def stream_chat(self, messages):
            yield "chunk"

        def structured_chat(self, messages, schema):
            return {"met": True, "score": 100}

    provider = Concrete()
    assert list(provider.stream_chat([])) == ["chunk"]
    assert provider.structured_chat([], {}) == {"met": True, "score": 100}


def test_llm_provider_error_is_a_plain_exception():
    err = LLMProviderError("boom")
    assert isinstance(err, Exception)
    assert str(err) == "boom"


def test_llm_provider_error_preserves_original_cause_chain():
    original = ValueError("root cause")
    try:
        try:
            raise original
        except ValueError as exc:
            raise LLMProviderError("wrapped") from exc
    except LLMProviderError as wrapped:
        assert wrapped.__cause__ is original


# Testing services/llm/ollama_provider.py


def _lines(*dicts):
    """Helper: encode a sequence of dicts as NDJSON byte lines, the shape
    Ollama's streaming /api/chat endpoint returns."""
    return [json.dumps(d).encode() for d in dicts]


# ---------------------------------------------------------------------------
# stream_chat
# ---------------------------------------------------------------------------


class TestStreamChat:
    def test_yields_content_chunks_in_order_and_stops_on_done(self, provider, mocker):
        fake_resp = mocker.Mock()
        fake_resp.raise_for_status = mocker.Mock()
        fake_resp.iter_lines.return_value = _lines(
            {"message": {"content": "Hello"}, "done": False},
            {"message": {"content": " there"}, "done": False},
            {"message": {"content": ""}, "done": True},
        )
        post = mocker.patch(
            "services.llm.ollama_provider.requests.post", return_value=fake_resp
        )

        chunks = list(provider.stream_chat([{"role": "user", "content": "hi"}]))

        assert chunks == ["Hello", " there"]
        post.assert_called_once_with(
            "http://ollama.local:11434/api/chat",
            json={
                "model": "llama3",
                "messages": [{"role": "user", "content": "hi"}],
                "stream": True,
            },
            stream=True,
            timeout=60,
        )

    def test_skips_blank_lines(self, provider, mocker):
        fake_resp = mocker.Mock()
        fake_resp.raise_for_status = mocker.Mock()
        fake_resp.iter_lines.return_value = [
            b"",
            json.dumps({"message": {"content": "ok"}, "done": True}).encode(),
        ]
        mocker.patch(
            "services.llm.ollama_provider.requests.post", return_value=fake_resp
        )

        assert list(provider.stream_chat([])) == ["ok"]

    def test_skips_malformed_json_lines_and_logs_warning(
        self, provider, mocker, caplog
    ):
        fake_resp = mocker.Mock()
        fake_resp.raise_for_status = mocker.Mock()
        fake_resp.iter_lines.return_value = [
            b"{not valid json",
            json.dumps({"message": {"content": "recovered"}, "done": True}).encode(),
        ]
        mocker.patch(
            "services.llm.ollama_provider.requests.post", return_value=fake_resp
        )

        with caplog.at_level("WARNING"):
            chunks = list(provider.stream_chat([]))

        assert chunks == ["recovered"]
        assert "malformed" in caplog.text.lower()

    def test_chunk_without_content_yields_nothing_for_that_line(self, provider, mocker):
        fake_resp = mocker.Mock()
        fake_resp.raise_for_status = mocker.Mock()
        fake_resp.iter_lines.return_value = _lines(
            {"message": {}, "done": False},
            {"message": {"content": "only-this"}, "done": True},
        )
        mocker.patch(
            "services.llm.ollama_provider.requests.post", return_value=fake_resp
        )

        assert list(provider.stream_chat([])) == ["only-this"]

    def test_done_with_error_raises_after_yielding_prior_chunks(self, provider, mocker):
        fake_resp = mocker.Mock()
        fake_resp.raise_for_status = mocker.Mock()
        fake_resp.iter_lines.return_value = _lines(
            {"message": {"content": "partial"}, "done": False},
            {"message": {"content": ""}, "done": True, "error": "model crashed"},
        )
        mocker.patch(
            "services.llm.ollama_provider.requests.post", return_value=fake_resp
        )

        gen = provider.stream_chat([])
        assert next(gen) == "partial"
        with pytest.raises(LLMProviderError, match="model crashed"):
            next(gen)

    def test_connection_failure_raises_llm_provider_error(self, provider, mocker):
        mocker.patch(
            "services.llm.ollama_provider.requests.post",
            side_effect=requests.ConnectionError("connection refused"),
        )

        with pytest.raises(
            LLMProviderError, match="Failed to reach the language model service"
        ):
            list(provider.stream_chat([]))

    def test_connection_failure_preserves_original_exception_as_cause(
        self, provider, mocker
    ):
        original = requests.ConnectionError("connection refused")
        mocker.patch("services.llm.ollama_provider.requests.post", side_effect=original)

        with pytest.raises(LLMProviderError) as excinfo:
            list(provider.stream_chat([]))
        assert excinfo.value.__cause__ is original

    def test_http_error_status_raises_llm_provider_error(self, provider, mocker):
        fake_resp = mocker.Mock()
        fake_resp.raise_for_status.side_effect = requests.HTTPError("500 Server Error")
        mocker.patch(
            "services.llm.ollama_provider.requests.post", return_value=fake_resp
        )

        with pytest.raises(
            LLMProviderError, match="Failed to reach the language model service"
        ):
            list(provider.stream_chat([]))

    def test_timeout_raises_llm_provider_error(self, provider, mocker):
        mocker.patch(
            "services.llm.ollama_provider.requests.post",
            side_effect=requests.Timeout("timed out"),
        )

        with pytest.raises(LLMProviderError):
            list(provider.stream_chat([]))


# ---------------------------------------------------------------------------
# structured_chat
# ---------------------------------------------------------------------------


class TestStructuredChat:
    SCHEMA = {"type": "object", "properties": {"met": {"type": "boolean"}}}

    def test_returns_parsed_json_object(self, provider, mocker):
        fake_resp = mocker.Mock()
        fake_resp.raise_for_status = mocker.Mock()
        fake_resp.json.return_value = {
            "message": {"content": json.dumps({"met": True, "score": 90})}
        }
        post = mocker.patch(
            "services.llm.ollama_provider.requests.post", return_value=fake_resp
        )

        result = provider.structured_chat(
            [{"role": "user", "content": "eval"}], self.SCHEMA
        )

        assert result == {"met": True, "score": 90}
        post.assert_called_once_with(
            "http://ollama.local:11434/api/chat",
            json={
                "model": "llama3",
                "messages": [{"role": "user", "content": "eval"}],
                "format": self.SCHEMA,
                "stream": False,
            },
            timeout=60,
        )

    def test_request_exception_raises_llm_provider_error(self, provider, mocker):
        mocker.patch(
            "services.llm.ollama_provider.requests.post",
            side_effect=requests.ConnectionError("down"),
        )

        with pytest.raises(
            LLMProviderError, match="Failed to get a structured evaluation"
        ):
            provider.structured_chat([], self.SCHEMA)

    def test_http_error_status_raises_llm_provider_error(self, provider, mocker):
        fake_resp = mocker.Mock()
        fake_resp.raise_for_status.side_effect = requests.HTTPError("500")
        mocker.patch(
            "services.llm.ollama_provider.requests.post", return_value=fake_resp
        )

        with pytest.raises(LLMProviderError):
            provider.structured_chat([], self.SCHEMA)

    def test_missing_expected_keys_raises_llm_provider_error(self, provider, mocker):
        fake_resp = mocker.Mock()
        fake_resp.raise_for_status = mocker.Mock()
        fake_resp.json.return_value = {"message": {}}  # no "content" key -> KeyError
        mocker.patch(
            "services.llm.ollama_provider.requests.post", return_value=fake_resp
        )

        with pytest.raises(
            LLMProviderError, match="Failed to get a structured evaluation"
        ):
            provider.structured_chat([], self.SCHEMA)

    def test_non_json_content_raises_llm_provider_error(self, provider, mocker):
        fake_resp = mocker.Mock()
        fake_resp.raise_for_status = mocker.Mock()
        fake_resp.json.return_value = {"message": {"content": "not json at all"}}
        mocker.patch(
            "services.llm.ollama_provider.requests.post", return_value=fake_resp
        )

        with pytest.raises(LLMProviderError):
            provider.structured_chat([], self.SCHEMA)

    def test_original_exception_preserved_as_cause(self, provider, mocker):
        original = requests.ConnectionError("down")
        mocker.patch("services.llm.ollama_provider.requests.post", side_effect=original)

        with pytest.raises(LLMProviderError) as excinfo:
            provider.structured_chat([], self.SCHEMA)
        assert excinfo.value.__cause__ is original
