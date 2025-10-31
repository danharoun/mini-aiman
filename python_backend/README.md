# Mini AiMan Python Agent Backend

This directory packages a lightweight LiveKit voice agent that mirrors the
architecture used in the `vivid_agent` project, simplified for the holographic
Mini AiMan demo. It relies on inexpensive OpenAI models for streaming STT,
LLM reasoning, and TTS, and is managed with [uv](https://docs.astral.sh/uv/).

## 1. Prerequisites

- Python 3.11+
- [uv CLI](https://docs.astral.sh/uv/getting-started/installation/)
- LiveKit project credentials (URL, API key, API secret)
- OpenAI API key (or compatible provider)

## 2. Installation

```bash
cd python_backend
uv venv
source .venv/bin/activate
uv sync
cp .env.example .env
```

Fill in `.env` with your LiveKit and OpenAI credentials.  
`LIVEKIT_AGENT_NAME` defaults to `mini-aiman-python`, the same identifier the
Next.js client uses when requesting connection details.

## 3. Running the agent

```bash
uv run mini-aiman-agent
```

The worker registers itself with LiveKit and waits for jobs. Start the Next.js
frontend (`pnpm dev`) and it will automatically request the `mini-aiman-python`
agent. When a user joins, LiveKit hands the call to this worker and streams audio
and transcriptions in real time.

Prefer the named entry point above, but `uv run main.py` works as well if you
need to call the module directly.

To export environment variables directly instead of using `.env`, set the
standard LiveKit values before launching:

```bash
export LIVEKIT_URL=https://your-project.livekit.cloud
export LIVEKIT_API_KEY=...
export LIVEKIT_API_SECRET=...
uv run mini-aiman-agent
```

## 4. Behaviour overview

- **Activation phrases**: the agent listens continuously but only responds after
  hearing one of the comma-separated `TRIGGER_PHRASES` (default:
  `hey aiman,aiman`).
- **Avatar gestures**: the LLM can call the `play_avatar_animation` tool with
  `ok`, `high_five`, `hands_back`, or `wave`. The backend relays those to the
  frontend via LiveKit data packets so the TalkingHead avatar performs matching
  gestures instantly.
- **Long-running session**: once activated, the session stays engaged until the
  call ends, so you can continue the conversation without repeating the trigger.

## 5. Customising cost and providers

- **Cheaper LLM**: set `OPENAI_MODEL` (e.g. `gpt-4o-mini`, `o4-mini`). If you
  want another provider, swap `_build_llm` in `main.py` for the appropriate
  plugin (Groq, Mistral, DeepSeek, etc.).
- **Different STT**: replace `_build_stt` with another provider from
  `livekit.plugins` (Deepgram, Speechmatics, faster-whisper, …).
- **Different TTS**: substitute `_build_tts` with ElevenLabs, Cartesia, or any
  other available plugin.
- **Offline / fully local**: use Silero/Faster-Whisper for STT and Coqui or
  XTTS for TTS to remove per-token costs.

Keep `RoomOutputOptions.transcription_enabled=True` so the front-end continues
receiving transcripts for lip-sync animation.

## 6. Troubleshooting

- No lipsync? Verify the worker logs include “conversation_item_added” events
  and that transcriptions are flowing (check browser console).
- Worker never receives jobs? Ensure `LIVEKIT_AGENT_NAME` matches the value in
  `app-config.ts` or any `NEXT_PUBLIC_LIVEKIT_AGENT_NAME` override.
- Need more detail? Run with `LOG_LEVEL=DEBUG` to inspect signalling events.
