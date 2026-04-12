"""
Groq API client helpers for async AI chat usage.
"""

import asyncio
import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

_groq_api_key = os.getenv("GROQ_API_KEY")
if not _groq_api_key:
    raise ValueError("GROQ_API_KEY not found in environment variables")

client = Groq(api_key=_groq_api_key)


def _format_response_text(text: str) -> str:
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    return "\n".join(lines[:5])


def _sync_chat_completion(prompt: str) -> str:
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a professional fitness trainer providing clear, practical advice. "
                        "Respond in clean English with an Indian conversational tone. "
                        "Keep responses to max 3-4 bullet points. No long paragraphs. "
                        "Be direct and practical. Focus on consistency, safety, and actionable steps."
                    ),
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.4,
            max_tokens=220,
            top_p=1,
            stream=False,
        )
        return _format_response_text(response.choices[0].message.content or "")
    except Exception as exc:
        error_message = str(exc)
        if "api_key" in error_message.lower():
            raise Exception("Groq API key not configured. Please set GROQ_API_KEY.") from exc
        raise Exception(f"Failed to get AI response: {error_message}") from exc


async def get_ai_response(prompt: str) -> str:
    return await asyncio.to_thread(_sync_chat_completion, prompt)
