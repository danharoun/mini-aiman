# TalkingHead Lipsync Debugging Guide

## Current Status

Based on your logs, I can see:
- ✅ Audio streaming pipeline is being established
- ✅ Agent state transitions are working (listening → speaking)
- ⚠️ **Issue**: Streaming starts and stops rapidly
- ⚠️ **Issue**: Lipsync not visible despite audio flowing

## Key Changes Made

### 1. Use Agent State Instead of Speaking Participants
**Problem**: `speakingParticipants` fluctuates during speech, causing rapid start/stop cycles

**Solution**: Changed from:
```typescript
const isAgentSpeaking = agent && speakingParticipants.some((p) => p.identity === agent.identity);
```

To:
```typescript
const isAgentSpeaking = Boolean(agent && agentState === 'speaking');
```

This provides a stable trigger based on agent's state machine.

### 2. Enhanced Logging
Added audio chunk counting and detailed logs to verify:
- Audio worklet is receiving data
- TalkingHead is receiving audio chunks
- Stream config is correct

## Expected Console Output

When working correctly, you should see:
```
🤖 Agent state: speaking | Agent speaking: true
🎤 Setting up real-time audio streaming
🎵 AudioContext ready, sample rate: 48000
✅ Audio worklet module loaded
🎙️ TalkingHead stream config: {sampleRate: 48000, gain: 0, ...}
✅ TalkingHead audio playback started (gain=0, so silent)
🎙️ Audio streaming pipeline fully established
🎵 Audio chunk #1, size: 512
🎵 Audio chunk #2, size: 512
🎵 Audio chunk #3, size: 512
📊 Audio chunks received so far: 150
```

## Troubleshooting Checklist

### ✅ Check 1: Audio Pipeline Established
Look for: `🎙️ Audio streaming pipeline fully established`
- If missing: AudioWorklet failed to load
- Solution: Check `/agent-audio-processor.js` exists

### ✅ Check 2: Audio Chunks Flowing
Look for: `🎵 Audio chunk #1, size: XXX`
- If missing: Audio track has no data
- Solution: Verify agent's microphone track is active

### ✅ Check 3: Stable Streaming
Look for: Stream should NOT rapidly stop/start
- If unstable: Check `isAgentSpeaking` logic
- Solution: Use `agentState === 'speaking'` not `speakingParticipants`

### ✅ Check 4: No Duplicate Audio
Listen for: Should hear ONE clean audio stream
- If doubled/noisy: TalkingHead is playing audio
- Solution: Verify `gain: 0` in streamStart

### ✅ Check 5: TalkingHead Instance Ready
Look for: `🎭 TalkingHead instance: true`
- If false: Avatar not loaded
- Solution: Wait for avatar to load before connecting

## Why Lipsync Might Still Not Work

### Theory 1: TalkingHead Streaming API Limitations
The TalkingHead streaming API (`streamAudio`) is designed for:
- Receiving audio + viseme data together
- OR receiving just audio and generating visemes internally

**Test**: Check if TalkingHead is generating visemes from your audio.

### Theory 2: Audio Format Mismatch
TalkingHead might expect:
- Specific sample rate (16kHz vs 48kHz)
- Specific bit depth (Int16 vs Float32)
- Specific channel layout (mono vs stereo)

**Current**: We're sending Float32Array at 48kHz mono
**Try**: Convert to Int16 or resample to 16kHz

### Theory 3: LiveKit Audio is Compressed
LiveKit streams might be:
- Opus-encoded
- Has silence suppression
- Has VAD (Voice Activity Detection)

**Test**: Check if raw PCM is actually reaching the worklet

## Next Steps to Try

### Option A: Verify Audio is Reaching TalkingHead
Add this to worklet onmessage:
```typescript
if (audioChunkCountRef.current === 1) {
  const view = new Float32Array(event.data);
  console.log('First 10 samples:', Array.from(view.slice(0, 10)));
}
```

### Option B: Try Different Sample Rate
Change streamStart config:
```typescript
sampleRate: 16000, // Instead of audioContext.sampleRate
```

### Option C: Use speakText as Fallback
If streaming doesn't work, use transcriptions with speakText:
```typescript
// When transcription is final
if (isFinal && text) {
  head.speakText(text);
}
```

## Alternative Approach: Hybrid Method

If pure streaming doesn't work, consider:
1. Let LiveKit play audio normally (Room AudioRenderer)
2. Use transcriptions to trigger `speakText()` with muted audio
3. TalkingHead generates lipsync from text-to-viseme conversion

This would look like:
```typescript
head.speakText(text, {
  audio: false, // Don't play audio
  lipsync: true // Just do lipsync
});
```

## Key Files to Check

- `hooks/useProcessAgentAudio.ts` - Main streaming logic
- `public/agent-audio-processor.js` - AudioWorklet processor  
- `hooks/useTalkingHeadTranscription.ts` - Agent state handling
- Browser console - For all debug logs

## References

- [TalkingHead Streaming API](https://github.com/met4citizen/TalkingHead/blob/main/doc/guide.md#streaming-interface)
- [LiveKit Audio Tracks](https://docs.livekit.io/home/client/tracks/)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)






