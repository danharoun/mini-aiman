"""
Mini AiMan LiveKit agent worker.

This variant mirrors the simplified structure from the vivid_agent project:
pick STT/LLM/TTS providers, register a few function tools, and let the worker
run continuously. Extra behaviours:
- Avatar animation tool (mapped to frontend gestures via LiveKit data packets)
- Hotword-style activation so the agent only responds after trigger phrases
"""

from __future__ import annotations

import asyncio
import json
import logging
import os
from typing import Literal, Sequence

from dotenv import load_dotenv

from livekit import rtc
from livekit.agents import (
    AgentSession,
    AssignmentTimeoutError,
    JobContext,
    JobRequest,
    RoomOutputOptions,
    WorkerOptions,
    cli,
    voice,
)
from livekit.agents.llm import function_tool
from livekit.agents.voice import ConversationItemAddedEvent
from livekit.plugins import openai

load_dotenv()

AnimationName = Literal["ok", "high_five", "hands_back", "wave"]


def _configure_logging() -> logging.Logger:
    level_name = os.getenv("LOG_LEVEL", "INFO").upper()
    level_value = getattr(logging, level_name, logging.INFO)
    logging.basicConfig(
        level=level_value,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    )
    logger = logging.getLogger("mini-aiman-agent")
    logger.setLevel(level_value)
    return logger


LOGGER = _configure_logging()


def _require_env(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"Environment variable {name} must be set")
    return value


def _parse_trigger_phrases(raw: str | None) -> list[str]:
    if not raw:
        return ["hey aiman", "aiman"]
    phrases = [phrase.strip().lower() for phrase in raw.split(",")]
    return [phrase for phrase in phrases if phrase]


class MiniAimanAgent(voice.Agent):
    """Chat agent with avatar animation tools and trigger phrase gating."""

    _ANIMATION_GESTURES: dict[AnimationName, dict[str, float]] = {
        "ok": {"gesture": "ok", "duration": 3.0},
        "high_five": {"gesture": "handup", "duration": 3.0},
        "hands_back": {"gesture": "shrug", "duration": 3.0},
        "wave": {"gesture": "index", "duration": 3.0},
    }

    def __init__(
        self,
        room: rtc.Room,
        trigger_phrases: Sequence[str],
    ) -> None:
        instructions = os.getenv(
            "AGENT_INSTRUCTIONS",
            (
                "You are Mini AiMan, a concise holographic concierge. Respond in short, upbeat "
                "sentences and keep explanations beginner-friendly. Use the `play_avatar_animation` "
                "tool to trigger gestures (‘ok’, ‘high five’, ‘hands back’, or ‘wave’) when it adds "
                "emphasis or celebrates success."
            ),
        )
        fallback_prompt = os.getenv(
            "AGENT_FALLBACK_PROMPT",
            "Stay cheerful and helpful even if the user input is unclear.",
        )
        if fallback_prompt:
            instructions = f"{instructions}\n\nFallback guidance: {fallback_prompt}"
        super().__init__(instructions=instructions)
        self._room = room
        self._trigger_phrases = list(trigger_phrases)
        self._engaged = False

    def should_process_text(self, text: str) -> bool:
        """Return True once a trigger phrase is detected."""
        if self._engaged:
            return True

        normalized = text.lower()
        for phrase in self._trigger_phrases:
            if phrase and phrase in normalized:
                self._engaged = True
                LOGGER.info("Activation phrase detected: %s", phrase)
                return True
        return False

    @function_tool()
    async def play_avatar_animation(
        self,
        animation: AnimationName,
        duration_seconds: float | None = None,
    ) -> dict[str, str | float | bool]:
        """
        Trigger a pre-defined TalkingHead gesture on the frontend avatar.

        Args:
            animation: One of "ok", "high_five", "hands_back", "wave".
            duration_seconds: Optional override for gesture duration (seconds).
        """

        mapping = self._ANIMATION_GESTURES.get(animation)
        if mapping is None:
            return {
                "ok": False,
                "reason": f"Unsupported animation '{animation}'.",
            }

        duration = float(duration_seconds or mapping["duration"])
        payload = {
            "type": "avatar:animation",
            "animation": animation,
            "gesture": mapping["gesture"],
            "duration": duration,
        }

        try:
            await self._room.local_participant.publish_data(
                json.dumps(payload).encode("utf-8"),
                data_kind=rtc.DataPacketKind.RELIABLE,
            )
            LOGGER.debug("Sent animation command: %s", payload)
            return {"ok": True, "animation": animation, "duration": duration}
        except Exception as exc:  # pragma: no cover - defensive
            LOGGER.error("Failed to publish animation command: %s", exc)
            return {"ok": False, "reason": str(exc)}


async def entrypoint(ctx: JobContext) -> None:
    """Main worker entrypoint executed for each accepted job."""
    openai_api_key = _require_env("OPENAI_API_KEY")

    session = AgentSession(
        llm=openai.realtime.RealtimeModel(
            api_key=openai_api_key,
            model=os.getenv("OPENAI_REALTIME_MODEL", "gpt-realtime"),
            voice=os.getenv("OPENAI_REALTIME_VOICE", "marin"),
        ),
        turn_detection="realtime_llm",
        resume_false_interruption=True,
        preemptive_generation=True,
    )

    trigger_phrases = _parse_trigger_phrases(os.getenv("TRIGGER_PHRASES"))
    assistant = MiniAimanAgent(ctx.room, trigger_phrases)

    @session.on("conversation_item_added")
    def _on_conversation_item_added(ev: ConversationItemAddedEvent) -> None:
        if ev.item.role != "user":
            return

        text = (ev.item.as_text() or "").strip()
        if not text:
            return

        if not assistant.should_process_text(text):
            LOGGER.debug("Waiting for activation phrase, ignoring: %s", text)
            return

        if assistant.session is None:
            LOGGER.warning("Agent session not ready; skipping reply")
            return

        asyncio.create_task(assistant.session.generate_reply())

    await session.start(
        agent=assistant,
        room=ctx.room,
        room_output_options=RoomOutputOptions(
            transcription_enabled=True,
            sync_transcription=True,
        ),
    )


async def _request_fnc(job_req: JobRequest) -> None:
    """Accept incoming jobs with a predictable identity like vivid_agent."""
    agent_name = os.getenv("LIVEKIT_AGENT_NAME", "mini-aiman-python")
    try:
        await job_req.accept(
            name=agent_name,
            identity=f"{agent_name}-{job_req.id}",
        )
    except AssignmentTimeoutError:
        LOGGER.warning("Assignment timed out before acceptance")


def main() -> None:
    """Entry point for uv script."""
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            request_fnc=_request_fnc,
        )
    )


if __name__ == "__main__":
    main()
