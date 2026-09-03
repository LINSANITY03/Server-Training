import os
from .ollama_provider import OllamaProvider
from dotenv import load_dotenv
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent.parent
load_dotenv(BASE_DIR / ".env.local")

LLM_PROVIDER = os.getenv("LLM_PROVIDER")


def get_llm_provider():
    if LLM_PROVIDER == "local":
        return OllamaProvider(
            model=os.getenv("LOCAL_MODEL"),
            base_url=os.getenv("LOCAL_MODEL_URL"),
        )
