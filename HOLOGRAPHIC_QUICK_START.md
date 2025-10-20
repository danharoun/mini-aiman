# 🎨 Holographic Effect - Quick Start Guide

Transform your aiman avatar into a stunning holographic display in 3 easy steps!

## 🚀 Quick Start (3 Steps)

### Step 1: Enable Holographic Effect

Add the `holographic` prop to your TalkingHeadAvatar component:

```tsx
<TalkingHeadAvatar
  avatarUrl="/aiman.glb"
  holographic={{
    enabled: true,
    color: '#70c1ff'  // Classic cyan hologram
  }}
/>
```

### Step 2: Enable Controls (Optional)

Want to toggle the effect in real-time? Enable controls:

```tsx
<TalkingHeadAvatar
  avatarUrl="/aiman.glb"
  enableControls={true}  // Shows holographic toggle button
  holographic={{
    enabled: false,  // Start disabled, toggle via UI
    color: '#70c1ff'
  }}
/>
```

### Step 3: Test It!

Navigate to `/components/talkinghead` and click the "✨ Holographic Effect" button!

---

## 🎬 Try It Now!

### Option 1: Use the Demo Page
```bash
# Start your dev server
npm run dev

# Navigate to:
http://localhost:3000/components/talkinghead

# Click "Holographic OFF" to enable the effect
```

### Option 2: Update the LiveKit Page

Open `app/components/livekit/page.tsx` and update the TalkingHeadTile component:

```tsx
<TalkingHeadTile
  agentParticipant={agentParticipant}
  holographic={{
    enabled: true,
    color: '#70c1ff'
  }}
/>
```

---

## 🎨 Popular Color Presets

Click the color picker and try these:

| Color | Hex | Style |
|-------|-----|-------|
| 🔵 Cyan (Default) | `#70c1ff` | Classic hologram |
| 🟢 Matrix Green | `#00ff41` | Matrix/Hacker style |
| 🟣 Purple | `#bf00ff` | Futuristic/Cyberpunk |
| 🟠 Orange | `#ff8800` | Warm sci-fi |
| 🔴 Red | `#ff0040` | Emergency/Alert |
| ⚪ White | `#ffffff` | Ghost/Spirit |

---

## 🎮 Interactive Demo

### With UI Controls

```tsx
import { TalkingHeadAvatar } from '@/components/livekit/talking-head-avatar';

export default function MyAvatar() {
  return (
    <div className="h-screen w-screen">
      <TalkingHeadAvatar
        avatarUrl="/aiman.glb"
        enableControls={true}
        holographic={{
          enabled: false,
          color: '#70c1ff'
        }}
      />
    </div>
  );
}
```

**Features:**
- Toggle holographic effect on/off
- Color picker for real-time color changes
- Camera view controls
- Mood and gesture controls

---

## 🔧 Programmatic Control

### Toggle Effect Dynamically

```tsx
import { useTalkingHead } from '@/hooks/useTalkingHead';
import { useRef } from 'react';

export default function MyAvatar() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { head, setHolographic } = useTalkingHead(containerRef);

  return (
    <div>
      <div ref={containerRef} className="h-96" />
      
      <button onClick={() => setHolographic(true, '#70c1ff')}>
        Enable Holographic
      </button>
      
      <button onClick={() => setHolographic(false)}>
        Disable Holographic
      </button>
      
      <button onClick={() => setHolographic(true, '#00ff41')}>
        Matrix Green
      </button>
    </div>
  );
}
```

---

## 💡 Pro Tips

### Tip 1: Best Camera Views for Holographic Effect
The Fresnel effect is most visible at certain angles:
- **Full view** - See the glitch waves across the body
- **Upper view** - Perfect for showcasing edge glow
- **Head view** - Great for detailed facial hologram

### Tip 2: Combine with Moods
```tsx
head.setMood('happy');
setHolographic(true, '#00ff41');  // Happy hologram!
```

### Tip 3: Color Transitions
```tsx
// Gradually change colors
const colors = ['#70c1ff', '#00ff41', '#bf00ff', '#ff8800'];
let index = 0;

setInterval(() => {
  setHolographic(true, colors[index % colors.length]);
  index++;
}, 2000);
```

### Tip 4: Audio-Reactive (Coming Soon)
Consider adding audio analysis to make the glitch intensity react to speech volume!

---

## 🐛 Troubleshooting

### Problem: Effect not visible
**Solution:** Make sure avatar is loaded first
```tsx
const { isAvatarLoaded } = useTalkingHead(containerRef);

{isAvatarLoaded && (
  <button onClick={() => setHolographic(true)}>
    Enable Holographic
  </button>
)}
```

### Problem: Color not changing
**Solution:** Enable effect before changing color
```tsx
// Wrong ❌
setHolographic(false);
setHolographic(false, '#ff0000');  // Won't work

// Right ✅
setHolographic(true, '#ff0000');
```

### Problem: Performance issues
**Solution:** The effect is GPU-intensive. For low-end devices:
```tsx
const isLowEnd = navigator.hardwareConcurrency < 4;

<TalkingHeadAvatar
  holographic={{
    enabled: !isLowEnd,  // Disable on low-end devices
    color: '#70c1ff'
  }}
/>
```

---

## 🎯 Use Cases

### 1. **AI Assistant**
Perfect for representing AI agents in a futuristic way:
```tsx
<TalkingHeadAvatar
  holographic={{ enabled: true, color: '#70c1ff' }}
  // ... other props
/>
```

### 2. **Video Calls**
Make your avatar stand out in LiveKit calls:
```tsx
<TalkingHeadTile
  agentParticipant={agent}
  holographic={{ enabled: true, color: '#00ff41' }}
/>
```

### 3. **Gaming NPCs**
Use different colors for different character types:
```tsx
// Friendly NPC
<TalkingHeadAvatar holographic={{ enabled: true, color: '#00ff41' }} />

// Enemy NPC
<TalkingHeadAvatar holographic={{ enabled: true, color: '#ff0040' }} />

// Quest Giver
<TalkingHeadAvatar holographic={{ enabled: true, color: '#bf00ff' }} />
```

### 4. **Educational Demos**
Toggle effect to show before/after:
```tsx
const [showHolographic, setShowHolographic] = useState(false);

<button onClick={() => setShowHolographic(!showHolographic)}>
  Toggle Holographic Effect
</button>

<TalkingHeadAvatar
  holographic={{ enabled: showHolographic, color: '#70c1ff' }}
/>
```

---

## 📚 Next Steps

- Read [HOLOGRAPHIC_EFFECT.md](./HOLOGRAPHIC_EFFECT.md) for detailed documentation
- Explore shader customization options
- Try different color combinations
- Share your creations with the community!

---

## 🎉 Have Fun!

The holographic effect is designed to be plug-and-play. Just enable it and enjoy your futuristic avatar!

Need help? Check the [troubleshooting section](#-troubleshooting) or open an issue on GitHub.

**Happy Coding! ✨**





