# TalkingHead Lipsync - Quick Reference

## ✅ What's Working Now

- **Audio**: Clean playback through LiveKit (RoomAudioRenderer)
- **Lipsync**: Real-time mouth movements via TalkingHead streaming API
- **No Noise**: `gain: 0` prevents duplicate audio

## 🔑 Critical Settings

### In `hooks/useProcessAgentAudio.ts`:
```typescript
head.streamStart({
  sampleRate: audioContext.sampleRate,
  gain: 0,  // ← MUST BE 0 to prevent duplicate audio
  lipsyncLang: 'en',
  lipsyncType: 'visemes',
  waitForAudioChunks: false,
});
```

### In `components/app.tsx`:
```typescript
<RoomAudioRenderer />  // ← MUST BE PRESENT for audio playback
```

## 🎯 How It Works (Simple)

1. **LiveKit** plays agent audio normally (RoomAudioRenderer)
2. **AudioWorklet** copies audio data in real-time
3. **TalkingHead** receives audio, generates visemes, moves mouth
4. **gain: 0** ensures TalkingHead doesn't play audio again

## 🐛 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Duplicate audio / noise | Verify `gain: 0` in streamStart |
| No lipsync | Check console for "Audio streaming pipeline fully established" |
| No audio | Verify RoomAudioRenderer is present |
| Avatar mouth doesn't move | Check `isAgentSpeaking` is true |

## 📝 Console Logs (When Working)

```
🎤 Setting up real-time audio streaming
🎵 AudioContext ready, sample rate: 48000
✅ Audio worklet module loaded
🎙️ Starting TalkingHead stream with config
✅ TalkingHead audio playback started
🎙️ Audio streaming pipeline fully established
```

## 🔧 Key Files

- `hooks/useProcessAgentAudio.ts` - Audio streaming logic
- `hooks/useTalkingHeadTranscription.ts` - Mood and state sync
- `components/app.tsx` - RoomAudioRenderer
- `public/agent-audio-processor.js` - AudioWorklet processor

## 💡 Remember

**The Magic**: `gain: 0` separates audio playback from lipsync visualization!
- LiveKit = Audio 🔊
- TalkingHead = Lipsync 👄
- Together = Perfect sync! ✨












