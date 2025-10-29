# TalkingHead Integration - Quick Start

## 🎉 What's Been Added

Your React app now includes a fully functional **TalkingHead 3D avatar** using your **Aiman model** (`aiman.glb`)!

## 🚀 Quick Test

1. **Start the dev server** (already running):
   ```bash
   npm run dev
   ```

2. **Open your browser** to:
   - Main app with TalkingHead: `http://localhost:3000`
   - Animation Playground: `http://localhost:3000/components/talkinghead`
   - LiveKit Demo: `http://localhost:3000/components/livekit`

## 📁 Key Files

### Components
- `components/livekit/talking-head-avatar.tsx` - Main avatar component
- `components/livekit/talking-head-tile.tsx` - Compact tile for session view

### Hooks
- `hooks/useTalkingHead.ts` - Core TalkingHead management
- `hooks/useTalkingHeadLiveKit.ts` - LiveKit integration

### Demo Pages
- `app/components/talkinghead/page.tsx` - Full testing playground
- `app/components/livekit/page.tsx` - Component showcase

## 🎮 Features

### Camera Views
- **Full Body** - Complete avatar view
- **Mid** - Torso and up
- **Upper** - Chest and up
- **Head** - Head only (best for chat)

### Moods
- Neutral, Happy, Sad, Angry, Fear, Love

### Gestures
- Hand Up, Thumbs Up/Down, OK Sign, Point, Shrug

### Poses
- Straight, Side, Hip, Wide

### Speech
- Text-to-Speech with lip-sync
- Real-time audio streaming (LiveKit)

## 💡 Quick Examples

### Using in Your Components

```tsx
import { TalkingHeadAvatar } from '@/components/livekit/talking-head-avatar';

export default function MyPage() {
  return (
    <TalkingHeadAvatar 
      avatarUrl="/aiman.glb"
      enableControls={true}
    />
  );
}
```

### Controlling the Avatar Programmatically

```tsx
import { useRef } from 'react';
import { useTalkingHead } from '@/hooks/useTalkingHead';

function MyComponent() {
  const containerRef = useRef(null);
  const { head, loadAvatar } = useTalkingHead(containerRef);

  // Load avatar
  React.useEffect(() => {
    if (head) {
      loadAvatar({
        url: '/aiman.glb',
        body: 'M',
        avatarMood: 'neutral',
        lipsyncLang: 'en',
      });
    }
  }, [head]);

  return (
    <div>
      <div ref={containerRef} className="h-[600px]" />
      <button onClick={() => head?.speakText('Hello!')}>
        Speak
      </button>
      <button onClick={() => head?.playGesture('thumbup', 3)}>
        Thumbs Up
      </button>
    </div>
  );
}
```

## 🔧 Configuration

### Change TTS Voice

Edit `hooks/useTalkingHead.ts` or pass options:

```tsx
const { head } = useTalkingHead(containerRef, {
  ttsApikey: 'YOUR_GOOGLE_CLOUD_API_KEY',
  lipsyncModules: ['en'],
});
```

### Toggle TalkingHead in Main App

Edit `components/session-view.tsx`:

```tsx
// Enable TalkingHead (default)
<MediaTiles chatOpen={chatOpen} useTalkingHead={true} />

// Disable TalkingHead
<MediaTiles chatOpen={chatOpen} useTalkingHead={false} />
```

## 📚 Available Gestures

- `handup` - Raise hand
- `thumbup` - Thumbs up
- `thumbdown` - Thumbs down  
- `ok` - OK sign
- `index` - Point with index finger
- `shrug` - Shoulder shrug

## 📚 Available Poses

- `straight` - Standing straight
- `side` - Weight on one leg
- `hip` - Hand on hip
- `wide` - Wide stance

## 🎨 Customization

### Use Different Avatar

```tsx
<TalkingHeadAvatar avatarUrl="/path/to/your/avatar.glb" />
```

### Custom Camera View

```tsx
const { head } = useTalkingHead(containerRef, {
  cameraView: 'head', // 'full' | 'mid' | 'upper' | 'head'
});
```

## 🐛 Troubleshooting

### Avatar not loading?
- Check that `public/aiman.glb` exists
- Open browser console for errors
- Verify Three.js is installed: `npm install three @types/three` ✅

### Lip-sync not working?
- Default Google TTS API key is demo (limited usage)
- Get your own key: https://cloud.google.com/text-to-speech
- Update in component or hook

### Performance issues?
- Use 'head' view instead of 'full'
- Close other browser tabs
- Enable hardware acceleration in browser

## 📖 Full Documentation

See `TALKINGHEAD_INTEGRATION.md` for complete API reference and advanced features.

## 🎯 Next Steps

1. **Test the demos** - Try `/components/talkinghead` for full controls
2. **Customize moods** - Add your own facial expressions
3. **Add custom gestures** - Extend the gesture library
4. **Integrate with agent** - Connect to LiveKit voice responses
5. **Load animations** - Add Mixamo FBX animations

## 🌟 Based On

- [TalkingHead Library](https://github.com/met4citizen/TalkingHead) by met4citizen
- [Ready Player Me](https://readyplayer.me/) avatars
- [Three.js](https://threejs.org/) 3D engine
- [LiveKit](https://livekit.io/) real-time infrastructure

Enjoy your new 3D avatar! 🎭✨










