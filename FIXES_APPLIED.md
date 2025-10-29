# Fixes Applied

## Issue 1: Small Square Avatar ✅ FIXED

**Problem**: The avatar appeared as a small square instead of filling the full page.

**Root Cause**: The camera view was set to `'head'` (small tile view) and sizing classes weren't properly configured for full-screen mode.

**Solution**:
1. Updated `MediaTiles` to dynamically switch camera views:
   - **Chat open**: `head` view (90x90px tile)
   - **Chat closed**: `full` view (full body, fills screen)

2. Added proper sizing classes:
   ```tsx
   className={cn(chatOpen ? 'h-[90px] w-[90px]' : 'h-full w-full max-w-full')}
   ```

3. Made `cameraView` prop dynamic in `TalkingHeadTile`:
   ```tsx
   cameraView={chatOpen ? 'head' : 'full'}
   ```

4. Added `useEffect` to update view when prop changes:
   ```tsx
   React.useEffect(() => {
     if (head && isAvatarLoaded) {
       head.setView(cameraView);
     }
   }, [head, isAvatarLoaded, cameraView]);
   ```

**Result**: Avatar now fills the entire screen when chat is closed and shrinks to a small tile when chat is open.

---

## Issue 2: No Lip-Sync ✅ FIXED

**Problem**: The avatar's mouth wasn't moving when the agent spoke.

**Root Cause**: Not integrated with LiveKit's transcription stream.

**Solution**:

### Created New Hook: `useTalkingHeadTranscription`

This hook (`hooks/useTalkingHeadTranscription.ts`) integrates TalkingHead with LiveKit's real-time transcription system:

1. **Listens to LiveKit transcriptions**:
   ```tsx
   const transcriptions = useTranscriptions(); // From @livekit/components-react
   ```

2. **Filters for agent speech**:
   ```tsx
   const isAgent = latestTranscription.identity !== 'user';
   const isFinal = latestTranscription.info?.attributes?.['lk.transcription_final'] === 'true';
   ```

3. **Triggers lip-sync animation**:
   ```tsx
   if (agentState === 'speaking' && isFinal) {
     animateLipSync(head, text);
   }
   ```

4. **Syncs mood with agent state**:
   - `listening` → neutral mood, look at camera
   - `thinking` → neutral mood
   - `speaking` → happy mood, make eye contact
   - `idle` → neutral mood, look ahead

### Updated Components

**TalkingHeadTile**:
```tsx
// OLD: Simple reactions
useTalkingHeadSimple({ head, enabled: isAvatarLoaded });

// NEW: Real transcription-based lip-sync
useTalkingHeadTranscription({ head, enabled: isAvatarLoaded });
```

**Result**: Avatar now moves its mouth in sync with the agent's speech using LiveKit's transcription data.

---

## How It Works

### Transcription Flow

1. **Agent speaks** → LiveKit agent generates audio
2. **LiveKit streams transcription** → Text data sent via `lk.transcription` topic
3. **React receives transcription** → `useTranscriptions()` hook captures it
4. **Filter & process** → Check if it's from agent and is final
5. **Trigger lip-sync** → Call `head.speakText(text)` for mouth animation
6. **Visual feedback** → Avatar's mouth moves while LiveKit plays audio

### Timing Note

Currently, TalkingHead generates its own TTS audio when `speakText()` is called. This means:
- ✅ Lip movement happens
- ⚠️ Timing might be slightly off from LiveKit's audio
- ⚠️ Two audio sources (LiveKit + TalkingHead TTS)

**Future Enhancement**: For perfect sync, we should:
1. Extract audio from LiveKit's track
2. Use `head.speakAudio(audioBuffer)` instead
3. This would eliminate double audio and perfect the timing

---

## Files Modified

### New Files:
- `hooks/useTalkingHeadTranscription.ts` - LiveKit transcription integration

### Modified Files:
- `components/livekit/talking-head-tile.tsx` - Added transcription hook, dynamic camera view
- `components/livekit/media-tiles.tsx` - Dynamic sizing and camera view switching

---

## Testing

### Test Issue 1 (Sizing):
1. Start the app: `npm run dev`
2. Open `http://localhost:3000`
3. Start a session
4. **Without chat**: Avatar should fill the entire screen (full body view)
5. **Click chat button**: Avatar shrinks to small tile (head-only view)
6. **Close chat**: Avatar expands back to full screen

### Test Issue 2 (Lip-Sync):
1. Start the app with LiveKit agent running
2. Start a voice session
3. Speak to the agent
4. When agent responds:
   - ✅ Avatar's mouth should move
   - ✅ See console logs: `🗣️ Agent transcription:` and `💬 Triggering lip-sync`
   - ✅ Avatar mood changes (happy when speaking)
   - ✅ Avatar makes eye contact

### Console Logs to Look For:
```
🗣️ Agent transcription: { text: "...", isFinal: true, ... }
💬 Triggering lip-sync animation for: ...
✅ Triggered lip-sync for: "..."
```

---

## Configuration

### Adjust Lip-Sync Behavior

Edit `hooks/useTalkingHeadTranscription.ts`:

```tsx
// Change when lip-sync triggers
if (agentState === 'speaking' && isFinal) {
  // Only for final transcriptions (default)
}

// OR trigger for interim too (more responsive but may be choppy)
if (agentState === 'speaking') {
  // Triggers for every chunk
}
```

### Adjust Camera Views

Edit `components/livekit/media-tiles.tsx`:

```tsx
cameraView={chatOpen ? 'head' : 'full'}
// Options: 'full', 'mid', 'upper', 'head'

// Examples:
// Always show full body:
cameraView='full'

// Always show head only:
cameraView='head'

// Upper body when chat closed:
cameraView={chatOpen ? 'head' : 'upper'}
```

---

## Known Limitations

1. **Audio Doubling**: TalkingHead generates its own TTS audio. You may hear two audio sources.
   - **Workaround**: Mute TalkingHead's audio (future enhancement)
   - **Better solution**: Use `speakAudio()` with LiveKit's audio buffer

2. **Timing Drift**: Lip-sync timing is approximate since TalkingHead and LiveKit run separate audio.
   - **Impact**: Mouth movement might be slightly ahead/behind actual speech
   - **Better solution**: Stream LiveKit audio directly to TalkingHead

3. **TTS API Key**: Using demo Google TTS key (has rate limits)
   - **For production**: Get your own key from Google Cloud

---

## Next Steps for Perfect Lip-Sync

To achieve frame-perfect lip-sync with LiveKit audio:

1. **Capture LiveKit audio track**:
   ```tsx
   const audioTrack = agent.audioTrack;
   const mediaStream = new MediaStream([audioTrack.mediaStreamTrack]);
   ```

2. **Convert to PCM buffer**:
   ```tsx
   // Use Web Audio API to capture audio samples
   const audioContext = new AudioContext();
   const source = audioContext.createMediaStreamSource(mediaStream);
   // ... capture PCM data
   ```

3. **Stream to TalkingHead**:
   ```tsx
   head.streamStart({ waitForAudioChunks: false });
   head.streamAudio({ audio: pcmBuffer });
   ```

4. **Use transcription for text display only**:
   - Show subtitles
   - Don't trigger separate TTS

This would give you:
- ✅ Single audio source (LiveKit)
- ✅ Perfect lip-sync timing
- ✅ Real-time mouth movement
- ✅ No audio doubling

---

## Summary

Both issues are now fixed:

1. ✅ **Avatar sizing**: Full screen when chat closed, small tile when chat open
2. ✅ **Lip-sync**: Mouth moves based on LiveKit transcriptions

The integration works and provides visual feedback. For production use, consider implementing the advanced audio streaming approach for perfect synchronization.










