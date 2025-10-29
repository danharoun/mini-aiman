# TalkingHead 3D Avatar Integration

This document describes the TalkingHead 3D avatar integration with your React app using the Aiman model.

## Overview

The integration includes:
- ✅ TalkingHead library (v1.6) integration
- ✅ Custom Aiman GLB model support
- ✅ LiveKit voice assistant synchronization
- ✅ Real-time lip-sync capabilities
- ✅ Interactive controls for poses, gestures, moods
- ✅ Full component library for React

## Files Created

### Core Components
- `hooks/useTalkingHead.ts` - Main hook for managing TalkingHead instances
- `hooks/useTalkingHeadLiveKit.ts` - Integration hooks for LiveKit audio streaming
- `components/livekit/talking-head-avatar.tsx` - Full-featured avatar component with controls
- `components/livekit/talking-head-tile.tsx` - Compact tile component for session view
- `lib/talkinghead.mjs` - TalkingHead library wrapper

### Demo Pages
- `app/components/talkinghead/page.tsx` - Full animation playground demo
- `app/components/livekit/page.tsx` - Updated with TalkingHead demo

### Modified Files
- `components/livekit/media-tiles.tsx` - Added TalkingHead avatar support
- `components/session-view.tsx` - Enabled TalkingHead by default

## Features

### 1. Avatar Controls
- **Camera Views**: Full body, mid, upper body, head-only
- **Moods**: Neutral, happy, sad, angry, fear, love
- **Body Poses**: Straight, side, hip, wide
- **Hand Gestures**: Hand up, thumbs up/down, OK, point, shrug
- **Look Direction**: Camera, ahead, eye contact

### 2. Speech & Lip-Sync
- Text-to-speech with Google Cloud TTS
- Real-time lip synchronization
- Word-based viseme generation
- Audio streaming support

### 3. Animations
- Support for external FBX animations (Mixamo compatible)
- Built-in gesture library
- Pose templates
- Smooth transitions

### 4. LiveKit Integration
- Reactive to agent state changes
- Automatic mood and gesture updates
- Eye contact during conversation
- Audio streaming for lip-sync (advanced)

## Usage

### Basic Usage (Standalone Component)

```tsx
import { TalkingHeadAvatar } from '@/components/livekit/talking-head-avatar';

export default function MyPage() {
  return (
    <div className="h-screen w-full">
      <TalkingHeadAvatar 
        avatarUrl="/aiman.glb"
        enableControls={true}
      />
    </div>
  );
}
```

### With LiveKit Session

The TalkingHead avatar is already integrated into the main session view. It's enabled by default in `components/session-view.tsx`:

```tsx
<MediaTiles chatOpen={chatOpen} useTalkingHead={true} />
```

To disable it, set `useTalkingHead={false}`.

### Using the Hook Directly

```tsx
import { useRef } from 'react';
import { useTalkingHead } from '@/hooks/useTalkingHead';

function MyComponent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { head, isLoading, isAvatarLoaded, error, loadAvatar } = useTalkingHead(
    containerRef,
    {
      lipsyncModules: ['en'],
      cameraView: 'full',
    }
  );

  // Load avatar
  React.useEffect(() => {
    if (head && !isAvatarLoaded) {
      loadAvatar({
        url: '/aiman.glb',
        body: 'M',
        avatarMood: 'neutral',
        ttsLang: 'en-GB',
        ttsVoice: 'en-GB-Standard-C',
        lipsyncLang: 'en',
      });
    }
  }, [head, isAvatarLoaded]);

  // Control the avatar
  const speak = () => {
    if (head) {
      head.speakText('Hello, world!');
    }
  };

  const wave = () => {
    if (head) {
      head.playGesture('handup', 3);
    }
  };

  return (
    <div>
      <div ref={containerRef} className="h-[600px] w-full" />
      <button onClick={speak}>Speak</button>
      <button onClick={wave}>Wave</button>
    </div>
  );
}
```

## Demo Pages

### 1. Full Animation Playground
Navigate to: `/components/talkinghead`

This page provides a complete testing environment with:
- All camera views
- All mood options
- Body poses
- Hand gestures
- Look direction controls
- Text-to-speech
- External animation loading
- Combo demo sequence

### 2. LiveKit Components Demo
Navigate to: `/components/livekit`

Shows the TalkingHead avatar as a component with integrated controls.

### 3. Main App
Navigate to: `/`

The main app now uses the TalkingHead avatar in the session view, synchronized with the LiveKit voice assistant.

## API Reference

### useTalkingHead Hook

```typescript
const {
  head,              // TalkingHeadInstance | null
  isLoading,         // boolean
  isAvatarLoaded,    // boolean
  error,             // string | null
  loadAvatar,        // (options: AvatarOptions) => Promise<void>
} = useTalkingHead(containerRef, options);
```

### TalkingHead Instance Methods

```typescript
head.showAvatar(options, onProgress)
head.setView('full' | 'mid' | 'upper' | 'head')
head.setMood('neutral' | 'happy' | 'sad' | 'angry' | 'fear' | 'love')
head.playPose(pose, time, duration)
head.stopPose()
head.playGesture(gesture, duration)
head.stopGesture()
head.lookAtCamera(duration)
head.lookAhead(duration)
head.makeEyeContact(duration)
head.speakText(text)
head.speakAudio(audioBuffer)
head.playAnimation(url, onProgress, duration, animIndex, scale)
head.stopAnimation()
head.start()
head.stop()
```

### Streaming API (Advanced)

```typescript
head.streamStart(options, onAudioStart, onAudioEnd, onSubtitles, onMetrics)
head.streamAudio({ audio, visemes, vtimes, vdurations, words, wtimes, wdurations })
head.streamNotifyEnd()
head.streamInterrupt()
head.streamStop()
```

## Customization

### Using a Different Avatar

Replace `/aiman.glb` with your own Ready Player Me avatar:

```tsx
<TalkingHeadAvatar avatarUrl="/path/to/your/avatar.glb" />
```

Requirements:
- Ready Player Me format or compatible GLB
- Armature root named "Armature"
- ARKit-compatible blend shapes for lip-sync

### Custom Gestures

Access and modify gesture templates:

```typescript
if (head) {
  // View existing gestures
  console.log(head.gestureTemplates);
  
  // Create custom gesture
  head.gestureTemplates.myCustomGesture = {
    'LeftHandThumb1.rotation': { x: 0, y: 0, z: 0.5 },
    'LeftHandIndex1.rotation': { x: 0, y: 0, z: 0.5 },
    // ... more bone rotations
  };
  
  // Play custom gesture
  head.playGesture('myCustomGesture', 3);
}
```

### TTS Configuration

Change the TTS provider or voice:

```typescript
const { head } = useTalkingHead(containerRef, {
  ttsEndpoint: 'https://eu-texttospeech.googleapis.com/v1beta1/text:synthesize',
  ttsApikey: 'YOUR_GOOGLE_API_KEY',
  lipsyncModules: ['en'],
});

// Then load avatar with voice settings
loadAvatar({
  url: '/aiman.glb',
  ttsLang: 'en-US',
  ttsVoice: 'en-US-Neural2-J',
  lipsyncLang: 'en',
});
```

## Troubleshooting

### Avatar Not Loading
- Verify `/aiman.glb` exists in the `public/` directory
- Check browser console for errors
- Ensure Three.js is properly installed (`npm install three @types/three`)

### Lip-Sync Not Working
- Verify TTS API key is valid
- Check network requests in browser DevTools
- Ensure `lipsyncModules` matches the language

### Performance Issues
- Use simpler camera views (e.g., 'head' instead of 'full')
- Reduce animation complexity
- Check browser hardware acceleration is enabled

### Audio Streaming Issues
- Ensure browser supports Web Audio API
- Check microphone/audio permissions
- Verify LiveKit connection is established

## Credits

- **TalkingHead Library**: [met4citizen/TalkingHead](https://github.com/met4citizen/TalkingHead)
- **Three.js**: 3D rendering engine
- **Ready Player Me**: Avatar platform
- **LiveKit**: Real-time audio/video infrastructure

## License

This integration follows the MIT license of the TalkingHead library.










