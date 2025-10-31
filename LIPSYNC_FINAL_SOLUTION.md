# TalkingHead Lipsync - Final Solution

## Problem Summary
1. **Original Issue**: Lipsync wasn't working at all
2. **Second Issue**: After initial fix, there was noise/duplicate audio

## Root Causes
1. **Lipsync not working**: Was trying to use transcription text with `speakText()`, which doesn't work with streaming audio from LiveKit agent
2. **Audio noise**: TalkingHead was playing audio through its own audio system while LiveKit was also playing it through `RoomAudioRenderer`

## Final Solution

### Architecture
```
LiveKit Agent Audio
  ↓
RoomAudioRenderer (plays audio normally through browser)
  ↓ (parallel)
AudioWorklet (extracts PCM data)
  ↓
TalkingHead.streamAudio({ audio }) with gain: 0
  ↓
Generates visemes for lipsync WITHOUT playing audio
  ↓
Avatar mouth moves in perfect sync! ✅
```

### Key Components

#### 1. Audio Streaming Hook (`hooks/useProcessAgentAudio.ts`)
- Captures agent's audio stream
- Processes audio through AudioWorklet
- Sends PCM data to TalkingHead with **gain: 0** (critical!)
- TalkingHead generates visemes but doesn't play audio

#### 2. Audio Playback (`components/app.tsx`)
- **RoomAudioRenderer** stays enabled
- LiveKit handles audio playback normally
- No audio duplication or noise

#### 3. Lipsync Configuration
```typescript
head.streamStart({
  sampleRate: audioContext.sampleRate,
  gain: 0, // ← CRITICAL: Disables TalkingHead audio playback
  lipsyncLang: 'en',
  lipsyncType: 'visemes',
  waitForAudioChunks: false,
})
```

### Why This Works

1. **Separate Concerns**:
   - LiveKit: Handles audio playback (RoomAudioRenderer)
   - TalkingHead: Handles lipsync visualization only (gain: 0)

2. **Real-time Processing**:
   - AudioWorklet extracts PCM data in real-time
   - TalkingHead generates visemes from PCM data
   - No latency between audio and lipsync

3. **No Duplication**:
   - `gain: 0` ensures TalkingHead doesn't play audio
   - RoomAudioRenderer is the only audio output
   - Clean, noise-free audio

### Configuration Checklist

✅ **RoomAudioRenderer** is enabled in `components/app.tsx`  
✅ **AudioWorklet** (`/agent-audio-processor.js`) is loaded  
✅ **TalkingHead streamStart** uses `gain: 0`  
✅ **Lipsync modules** are loaded: `lipsyncModules: ['en']`  

### Testing

When it works correctly, you should see these console logs:
```
🎤 Setting up real-time audio streaming
🎵 AudioContext ready, sample rate: 48000
✅ Audio worklet module loaded
🎙️ Starting TalkingHead stream with config
✅ TalkingHead audio playback started
🎙️ Audio streaming pipeline fully established
```

And you should:
- ✅ Hear clean audio from the agent (no noise/duplication)
- ✅ See the avatar's mouth moving in sync with the audio
- ✅ See the avatar's mood changing based on agent state

### Troubleshooting

**If you hear noise/duplicate audio:**
- Check that `gain: 0` is set in `streamStart()`
- Verify only ONE `RoomAudioRenderer` exists

**If lipsync doesn't work:**
- Check console for audio pipeline logs
- Verify `isAgentSpeaking` is true when agent talks
- Check browser console for AudioWorklet errors

**If audio is silent:**
- Make sure `RoomAudioRenderer` is present
- Check that agent audio track is not muted
- Verify browser audio permissions

### Code Changes Summary

1. **`hooks/useProcessAgentAudio.ts`**: Added `gain: 0` to streamStart
2. **`components/app.tsx`**: Kept RoomAudioRenderer (not removed)
3. **`public/agent-audio-processor.js`**: AudioWorklet for PCM extraction

### References

- [TalkingHead Streaming API](https://github.com/met4citizen/TalkingHead#streaming-interface)
- [LiveKit Audio Rendering](https://docs.livekit.io/home/client/tracks/subscribe/)
- [Web Audio API - AudioWorklet](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorklet)












