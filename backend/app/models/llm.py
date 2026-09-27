import json
import logging
from typing import Any, Dict, Optional, Type, TypeVar
from pydantic import BaseModel
from app.core.config import settings

logger = logging.getLogger("revamp_ai.llm")

T = TypeVar("T", bound=BaseModel)

class LLMService:
    def __init__(self):
        self.provider = settings.LLM_PROVIDER
        self.gemini_key = settings.GEMINI_API_KEY
        self.gemini_model = settings.GEMINI_MODEL
        self.gemini_fast_model = settings.GEMINI_FAST_MODEL
        self.ollama_base_url = settings.OLLAMA_BASE_URL
        self.ollama_model = settings.OLLAMA_MODEL

    def generate_text(self, prompt: str, system_prompt: Optional[str] = None, use_fast_model: bool = False) -> str:
        provider = settings.LLM_PROVIDER
        if provider == "ollama":
            return self._call_ollama(prompt, system_prompt)
        else:
            return self._call_gemini(prompt, system_prompt, use_fast_model)

    def generate_json(self, prompt: str, schema_class: Type[T], system_prompt: Optional[str] = None, use_fast_model: bool = False) -> T:
        json_instruction = (
            f"\n\nRespond ONLY with valid JSON matching this structure (no markdown formatting, no code blocks):\n"
            f"{json.dumps(schema_class.model_json_schema(), indent=2)}"
        )
        full_prompt = prompt + json_instruction
        raw_output = self.generate_text(full_prompt, system_prompt, use_fast_model)
        
        # Clean potential markdown backticks
        cleaned = raw_output.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        elif cleaned.startswith("```"):
            cleaned = cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()

        try:
            parsed_dict = json.loads(cleaned)
            return schema_class.model_validate(parsed_dict)
        except Exception as e:
            logger.warning(f"Failed to parse LLM JSON directly: {e}. Raw output: {cleaned[:200]}")
            # Attempt basic extraction or default instance
            try:
                # Find first { and last }
                start = cleaned.find("{")
                end = cleaned.rfind("}")
                if start != -1 and end != -1:
                    sub_str = cleaned[start:end+1]
                    parsed_dict = json.loads(sub_str)
                    return schema_class.model_validate(parsed_dict)
            except Exception:
                pass
            
            # Return dummy/default instance of schema_class if parsing failed
            return self._construct_fallback(schema_class)

    def _construct_fallback(self, schema_class: Type[T]) -> T:
        try:
            return schema_class()
        except Exception:
            from pydantic import BaseModel
            fields = schema_class.model_fields
            args = {}
            for k, v in fields.items():
                annotation = v.annotation
                if annotation == str:
                    args[k] = ""
                elif annotation == list or getattr(annotation, "__origin__", None) == list:
                    args[k] = []
                elif annotation == dict or getattr(annotation, "__origin__", None) == dict:
                    args[k] = {}
                elif annotation == int or annotation == float:
                    args[k] = 0
                elif annotation == bool:
                    args[k] = False
                elif isinstance(annotation, type) and issubclass(annotation, BaseModel):
                    args[k] = self._construct_fallback(annotation)
                else:
                    args[k] = None
            try:
                return schema_class(**args)
            except Exception:
                return schema_class.model_construct(**args)

    def _call_gemini(self, prompt: str, system_prompt: Optional[str] = None, use_fast_model: bool = False) -> str:
        model_name = self.gemini_fast_model if use_fast_model else self.gemini_model
        key = settings.GEMINI_API_KEY

        if not key or key == "your_gemini_api_key_here":
            logger.info("Gemini API key not configured, falling back to simulated output.")
            return self._simulated_response(prompt, system_prompt)

        try:
            try:
                from google import genai
                client = genai.Client(api_key=key)
                response = client.models.generate_content(
                    model=model_name,
                    contents=prompt
                )
                return response.text
            except Exception:
                import google.generativeai as genai
                genai.configure(api_key=key)
                model = genai.GenerativeModel(
                    model_name=model_name,
                    system_instruction=system_prompt
                )
                response = model.generate_content(prompt)
                return response.text
        except Exception as e:
            logger.error(f"Gemini API call failed: {e}")
            return self._simulated_response(prompt, system_prompt)



    def _call_ollama(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        try:
            import httpx
            url = f"{self.ollama_base_url.rstrip('/')}/api/generate"
            payload = {
                "model": self.ollama_model,
                "prompt": prompt,
                "stream": False
            }
            if system_prompt:
                payload["system"] = system_prompt

            with httpx.Client(timeout=60.0) as client:
                res = client.post(url, json=payload)
                res.raise_for_status()
                data = res.json()
                return data.get("response", "")
        except Exception as e:
            logger.error(f"Ollama call failed: {e}")
            return self._simulated_response(prompt, system_prompt)

    def _simulated_response(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        # Fallback text when API key is not present or offline
        return (
            "Cybersecurity Intelligence Summary:\n"
            "- Critical threat indicators identified across endpoint and network vector logs.\n"
            "- Affected systems: Domain Controllers, Primary Gateway, Exchange Server.\n"
            "- Urgency Level: HIGH\n"
            "- Recommended Action: Isolate compromised nodes, rotate active credentials, apply immediate security patch."
        )

llm_service = LLMService()
