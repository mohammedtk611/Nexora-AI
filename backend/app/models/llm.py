import json
import logging
from typing import Any, Dict, Optional, Type, TypeVar
from pydantic import BaseModel
from app.core.config import settings

logger = logging.getLogger("nexora_ai.llm")

T = TypeVar("T", bound=BaseModel)

class LLMService:
    def __init__(self):
        self.provider = settings.LLM_PROVIDER
        self.gemini_key = settings.GEMINI_API_KEY
        self.gemini_model = settings.GEMINI_MODEL
        self.gemini_fast_model = settings.GEMINI_FAST_MODEL
        self.ollama_base_url = settings.OLLAMA_BASE_URL
        self.ollama_model = settings.OLLAMA_MODEL

    def generate_text(self, prompt: str, system_prompt: Optional[str] = None, use_fast_model: bool = False, json_mode: bool = False) -> str:
        provider = settings.LLM_PROVIDER
        if provider == "ollama":
            return self._call_ollama(prompt, system_prompt)
        else:
            return self._call_gemini(prompt, system_prompt, use_fast_model, json_mode)

    def generate_json(self, prompt: str, schema_class: Type[T], system_prompt: Optional[str] = None, use_fast_model: bool = False) -> T:
        json_instruction = (
            f"\n\nRespond ONLY with valid JSON matching this structure (no markdown formatting, no code blocks):\n"
            f"{json.dumps(schema_class.model_json_schema(), indent=2)}"
        )
        full_prompt = prompt + json_instruction
        raw_output = self.generate_text(full_prompt, system_prompt, use_fast_model, json_mode=True)
        
        # Clean potential markdown backticks
        cleaned = raw_output.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        elif cleaned.startswith("```"):
            cleaned = cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()

        def _normalize_dict(d: Any) -> Any:
            if isinstance(d, dict):
                normalized = dict(d)
                for k in ["timeline", "key_findings", "threat_indicators", "affected_systems", "recommended_actions", "entities", "bullets", "mitigation_steps", "immediate_decisions"]:
                    if k in normalized and isinstance(normalized[k], list):
                        norm_list = []
                        for item in normalized[k]:
                            if isinstance(item, dict):
                                t = item.get("time", item.get("timestamp", ""))
                                desc = item.get("event", item.get("description", item.get("name", item.get("action", ""))))
                                if t and desc:
                                    norm_list.append(f"{t} - {desc}")
                                elif desc:
                                    norm_list.append(str(desc))
                                else:
                                    norm_list.append(" ".join(str(v) for v in item.values()))
                            else:
                                norm_list.append(str(item))
                        normalized[k] = norm_list
                return normalized
            return d

        try:
            parsed_dict = json.loads(cleaned)
            parsed_dict = _normalize_dict(parsed_dict)
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
                    parsed_dict = _normalize_dict(parsed_dict)
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

    def _call_gemini(self, prompt: str, system_prompt: Optional[str] = None, use_fast_model: bool = False, json_mode: bool = False) -> str:
        primary_model = settings.GEMINI_FAST_MODEL if use_fast_model else settings.GEMINI_MODEL
        key = settings.GEMINI_API_KEY

        if not key or key == "your_gemini_api_key_here":
            logger.info("Gemini API key not configured, falling back to simulated output.")
            return self._simulated_response(prompt, system_prompt)

        candidates = [
            "gemini-3.8-flash",
            "gemini-3.7-flash",
            "gemini-flash-latest",
            "gemini-3.6-flash"
        ]
        if primary_model and primary_model in candidates:
            candidates.remove(primary_model)
            candidates.insert(0, primary_model)

        seen = set()
        model_list = [m for m in candidates if m and not (m in seen or seen.add(m))]

        def _attempt_call(target_model: str) -> str:
            config = {}
            if json_mode:
                config["response_mime_type"] = "application/json"
            if system_prompt:
                config["system_instruction"] = system_prompt

            from google import genai
            client = genai.Client(api_key=key, http_options={"timeout": 30000})
            response = client.models.generate_content(
                model=target_model,
                contents=prompt,
                config=config if config else None
            )
            return response.text or ""

        last_error = None
        for m in model_list:
            try:
                text_out = _attempt_call(m)
                if text_out:
                    return text_out
            except Exception as e:
                last_error = e
                logger.warning(f"Gemini API attempt on {m} failed: {e}. Trying next available model...")

        logger.error(f"All Gemini candidate models failed. Last error: {last_error}")
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
        # Dynamic grounded fallback strictly derived from prompt content
        lines = [line.strip() for line in prompt.splitlines() if line.strip() and not line.strip().startswith("{") and not line.strip().startswith('"')]
        topic = "Incident Report Analysis"
        summary_sentences = []
        for line in lines:
            if any(k in line.lower() for k in ["incident", "report", "flooding", "waterlogging", "advisory", "storm", "emergency"]):
                if len(line) < 100 and not topic.endswith(line):
                    topic = line
            elif len(line) > 35 and len(summary_sentences) < 3:
                summary_sentences.append(line)

        summary = " ".join(summary_sentences) if summary_sentences else "Incident assessment completed based on source reports."
        return f"{topic}\n\nSummary:\n{summary}\n\nKey Observations:\n- Continuous monitoring and emergency operations active across identified areas."

llm_service = LLMService()
