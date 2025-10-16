# TalkingHead Lipsync Solution

## Problem
The lipsync wasn't working because the TalkingHead avatar's mouth wasn't moving when the LiveKit agent spoke.

## Root Cause
The original implementation was trying to use transcription text fragments with `speakText()`, which caused issues:
1. Transcriptions arrive as incomplete sentence fragments
2. `speakText()` triggers its own TTS audio (conflicting with LiveKit agent audio)
3. This creates audio duplication and desynced lipsync

## Solution
Use TalkingHead's **streaming API** to process the agent's live audio stream:

### How It Works

1. **Capture Agent Audio**: Extract the live audio stream from the LiveKit agent's microphone track
2. **Process with AudioWorklet**: Use Web Audio API's AudioWorklet to process audio in real-time
3. **Stream to TalkingHead**: Feed PCM audio chunks to TalkingHead's streaming interface
4. **Automatic Viseme Generation**: TalkingHead automatically generates visemes (mouth shapes) from the audio

### Key Components

#### 1. Audio Worklet Processor (`public/agent-audio-processor.js`)
```javascript
class AgentAudioProcessor extends AudioWorkletProcessor {
  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (input.length > 0) {
      const pcmFloat32Data = input[0];
      const copy = new Float32Array(pcmFloat32Data);
      this.port.postMessage(copy.buffer, [copy.buffer]);
    }
    return true;
  }
}
```

This runs in a separate audio thread and extracts PCM audio data.

#### 2. Audio Processing Hook (`hooks/useProcessAgentAudio.ts`)
```typescript
export function useProcessAgentAudio(
  head: TalkingHeadInstance | null,
  agent: Participant | undefined,
  isAgentSpeaking: boolean
)
```

This hook:
- Sets up the audio processing pipeline when agent speaks
- Connects: Agent Audio → AudioWorklet → TalkingHead
- Cleans up when agent stops speaking

#### 3. Transcription Hook (`hooks/useTalkingHeadTranscription.ts`)
```typescript
export function useTalkingHeadTranscription({
  head,
  enabled = true
})
```

This hook:
- Monitors agent state (listening, thinking, speaking)
- Controls avatar mood and gestures
- Delegates lipsync to `useProcessAgentAudio`

### TalkingHead Streaming API

The solution uses these TalkingHead methods:

1. **`streamStart(options)`**: Initialize streaming mode
   - `sampleRate`: Audio sample rate (from AudioContext)
   - **`gain: 0`**: **CRITICAL** - Disables TalkingHead's audio playback
   - `lipsyncLang`: Language for lipsync ('en')
   - `lipsyncType`: Type of lipsync ('visemes')
   - `waitForAudioChunks`: Process immediately (false)

2. **`streamAudio({ audio })`**: Feed audio chunks
   - `audio`: ArrayBuffer containing PCM Float32 audio data

3. **`streamNotifyEnd()`**: Signal end of utterance

4. **`streamStop()`**: Stop streaming mode

### Audio Separation (Critical for No Noise)

**Problem**: TalkingHead's `streamAudio()` plays audio by default, causing duplication with LiveKit's audio.

**Solution**: Use `gain: 0` in `streamStart()` to disable TalkingHead's audio playback.

```typescript
head.streamStart({
  gain: 0,  // ← This prevents audio playback, only does lipsync
  // ... other options
});
```

This way:
- LiveKit's `RoomAudioRenderer` handles audio playback (clean, no noise)
- TalkingHead only generates visemes for lipsync visualization
- No duplicate audio = no noise!

### Audio Pipeline Flow

```
LiveKit Agent (Speaking)
  ↓
Agent's Microphone Track
  ↓
MediaStream
  ↓
AudioContext.createMediaStreamSource()
  ↓
AudioWorkletNode (agent-audio-processor)
  ↓
postMessage(PCM audio buffer)
  ↓
head.streamAudio({ audio })
  ↓
TalkingHead (generates visemes automatically)
  ↓
Avatar mouth moves in sync! ✅
```

### Key Differences from HTML Example

The HTML example uses:
```javascript
head.speakText("Hello! I am testing lip synchronization...");
```

This works because:
- `speakText()` internally calls TTS API
- Generates both audio AND visemes
- Plays audio through TalkingHead's audio system

Our solution uses:
```javascript
head.streamStart({ ... });
head.streamAudio({ audio: pcmBuffer });
```

This works because:
- We already have audio from LiveKit agent
- TalkingHead generates visemes from our PCM audio
- No duplicate audio or TTS API calls

### Why This Approach Works

1. **Real-time**: Audio is processed as it arrives, not after transcription
2. **Accurate**: Visemes are generated from actual audio, not reconstructed from text
3. **Efficient**: No unnecessary TTS API calls
4. **Low-latency**: AudioWorklet provides sub-millisecond processing

### Configuration

Make sure your TalkingHead instance is initialized with lipsync modules:

```typescript
const { head } = useTalkingHead(containerRef, {
  lipsyncModules: ['en'],  // Load English lipsync module
  cameraView: 'full',
});
```

### Troubleshooting

If lipsync still doesn't work:

1. **Check console logs**:
   ```
   ✅ Audio worklet module loaded
   🎙️ Starting TalkingHead stream with config
   ✅ TalkingHead audio playback started
   🎙️ Audio streaming pipeline fully established
   ```

2. **Verify audio track**: Make sure agent has an active microphone track
3. **Check AudioContext**: Ensure AudioContext is running (not suspended)
4. **Browser compatibility**: AudioWorklet requires modern browsers (Chrome 66+, Firefox 76+)

### References

- [TalkingHead GitHub](https://github.com/met4citizen/TalkingHead)
- [TalkingHead Streaming API](https://github.com/met4citizen/TalkingHead#streaming-interface)
- [LiveKit Docs](https://docs.livekit.io/)
- [Web Audio API - AudioWorklet](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorklet)

