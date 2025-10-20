# Debugging Lip-Sync Issue

## What We Changed

### Simplified the Hook

**File**: `hooks/useTalkingHeadTranscription.ts`

Changed from complex approach to simple:
```tsx
// When we get a final transcription from the agent
if (text && isFinal && segmentId !== lastSegmentRef.current && latest.identity !== 'user') {
  console.log('💬 Lip-sync:', text.substring(0, 50));
  
  // Just call speakText - TalkingHead handles the lip-sync automatically!
  head.speakText(text);
}
```

### Added Debug Component

**File**: `components/livekit/transcription-debug.tsx`

Shows real-time transcription data in bottom-right corner:
- Agent state
- Transcription count  
- Latest transcription details

## How to Test

1. **Start your app**:
   ```bash
   npm run dev
   ```

2. **Open the app** in your browser

3. **Start a voice session** with your LiveKit agent

4. **Look at the bottom-right corner** - you'll see the debug panel

5. **Speak to the agent** and wait for response

6. **Check what you see**:
   - Does transcription count increase?
   - Is the agent identity showing correctly?
   - Is `Final` showing as `true`?
   - Do you see text appearing?

## Expected Console Logs

When lip-sync is working, you should see:
```
💬 Lip-sync: Hello, how can I help you today?
```

## Troubleshooting Steps

### Issue 1: No Transcriptions Appearing

**Symptom**: Transcription Count stays at 0

**Check**:
1. Is your Python agent configured to send transcriptions?
2. In `agent.py`, check:
   ```python
   await session.start(
       agent=MyAgent(),
       room=ctx.room,
       room_output_options=RoomOutputOptions(
           transcription_enabled=True,  # Must be True!
       ),
   )
   ```

### Issue 2: Transcriptions Show But No Lip-Sync

**Symptom**: You see transcriptions in debug panel but mouth doesn't move

**Check**:
1. Open browser console (F12)
2. Look for `💬 Lip-sync:` messages
3. If you don't see them, the condition is failing

**Possible causes**:
- `identity` might not be what we expect
- `isFinal` might not be 'true'
- `segmentId` issue

**Fix**: Look at the debug panel and adjust the condition in the hook:

```tsx
// Current condition:
if (text && isFinal && segmentId !== lastSegmentRef.current && latest.identity !== 'user')

// Try without identity check:
if (text && isFinal && segmentId !== lastSegmentRef.current)

// Or try without isFinal check (will trigger more often):
if (text && segmentId !== lastSegmentRef.current && latest.identity !== 'user')
```

### Issue 3: Avatar Not Loading

**Symptom**: Black screen or small square

**Check**:
1. Is `/aiman.glb` in your `public/` folder?
2. Open browser console - any errors?
3. Check Network tab - is aiman.glb loading?

### Issue 4: Double Audio

**Symptom**: You hear two audio sources

**This is expected!**
- LiveKit plays the agent's audio
- TalkingHead's `speakText()` generates its own TTS audio

**Solutions**:
1. **Accept it** - The lip-sync works, audio is just doubled
2. **Mute TalkingHead** - Need to modify the library (advanced)
3. **Use audio streaming** - Capture LiveKit audio and stream to TalkingHead (see FIXES_APPLIED.md)

## Quick Fixes to Try

### Fix 1: Simplify Identity Check

```tsx
// In hooks/useTalkingHeadTranscription.ts, line 48
// Change from:
if (text && isFinal && segmentId !== lastSegmentRef.current && latest.identity !== 'user')

// To:
const isNotUser = !latest.identity?.includes('user');
if (text && isFinal && segmentId !== lastSegmentRef.current && isNotUser)
```

### Fix 2: Add More Logging

```tsx
// Add before the if statement:
console.log('🔍 Checking transcription:', {
  hasText: !!text,
  isFinal,
  identity: latest.identity,
  segmentId,
  lastSegment: lastSegmentRef.current,
});
```

### Fix 3: Remove isFinal Requirement

```tsx
// Trigger on every transcription (not just final)
if (text && segmentId !== lastSegmentRef.current && latest.identity !== 'user') {
  console.log('💬 Lip-sync:', text.substring(0, 50));
  head.speakText(text);
}
```

## Python Agent Configuration

Make sure your agent is configured correctly:

```python
# In your Python agent code
from livekit.agents import voice
from livekit.agents.voice import RoomOutputOptions

session = voice.AgentSession(
    # ... your STT, LLM, TTS, VAD config ...
)

await session.start(
    agent=your_agent,
    room=ctx.room,
    room_output_options=RoomOutputOptions(
        transcription_enabled=True,  # REQUIRED for lip-sync
        sync_transcription=True,     # Recommended
    ),
)
```

## What to Check in Browser Console

Open DevTools (F12) and look for:

✅ **Good signs**:
```
✅ TalkingHead library loaded successfully
✓ Enhanced gestures for avatar with 4-bone fingers
🤖 Agent state: speaking
💬 Lip-sync: Hello...
```

❌ **Bad signs**:
```
❌ Failed to load TalkingHead library
Error: Cannot read properties of null
Failed to load aiman.glb
```

## Agent State Flow

The agent goes through these states:
1. **connecting** → Agent joining
2. **listening** → Waiting for user input
3. **thinking** → Processing user input
4. **speaking** → Agent is responding (THIS IS WHEN LIP-SYNC SHOULD HAPPEN!)
5. **idle** → Session inactive

## Next Steps

1. **Check the debug panel** - Does it show transcriptions?
2. **Check browser console** - Are there errors?
3. **Check Python agent logs** - Is it sending transcriptions?
4. **Try the fixes above** - Start with Fix 2 (more logging)

## Remove Debug Panel

Once it's working, remove the debug panel:

```tsx
// In components/session-view.tsx
// Delete or comment out:
<TranscriptionDebug />
```

## Summary

The lip-sync should work with just:
1. ✅ TalkingHead loaded
2. ✅ Avatar loaded (aiman.glb)
3. ✅ LiveKit transcriptions enabled
4. ✅ Agent in 'speaking' state
5. ✅ Transcription is final and from agent
6. ✅ Call `head.speakText(text)`

That's it! TalkingHead handles the rest automatically.






