# 🎮 Where to Find Holographic Controls

## ✨ Main Application (http://localhost:3000/)

### Sidebar Controls
The holographic toggle is now available in the **right sidebar** on your main agent page!

**To Access:**
1. Navigate to `http://localhost:3000/`
2. Wait for the avatar to load
3. Click the **controls button** in the top-right corner (gear/sliders icon)
4. Scroll down in the sidebar to find **"✨ Holographic Effect"**
5. Click the button to toggle ON/OFF
6. When enabled, use the color picker to change the hologram color

**Location in Sidebar:**
```
┌─────────────────────────────┐
│ 🎮 Animation Controls      │
├─────────────────────────────┤
│ Status: [message]           │
│                             │
│ 📷 Camera View              │
│ 😊 Mood                     │
│ 🧍 Body Pose                │
│ 👋 Hand Gestures            │
│ 👁️ Look Direction           │
│ 🗣️ Text-to-Speech           │
│ 🎬 External Animation       │
│                             │
│ ✨ Holographic Effect       │
│ ┌─────────────────────────┐ │
│ │ [Holographic OFF]       │ │
│ └─────────────────────────┘ │
│                             │
│ 🎭 Combo Demo               │
└─────────────────────────────┘
```

---

## 🔧 What Got Fixed

### Problem
- "THREE.js is not loaded yet, waiting..." message looping forever
- Holographic effect not applying

### Solution
Updated `lib/load-talkinghead.ts` to explicitly expose THREE.js on window:

```typescript
import { TalkingHead } from 'talkinghead';
import * as THREE from 'three';
window.TalkingHead = TalkingHead;
window.THREE = THREE;  // ← This was added!
```

Now THREE.js is globally available for the holographic shaders!

---

## 🎨 How to Use

### Step 1: Open the Controls
Click the controls button (top-right corner) to open the sidebar

### Step 2: Toggle Holographic
Scroll down to "✨ Holographic Effect" and click the button

### Step 3: Customize Color
When enabled, use the color picker to try different colors:
- **#70c1ff** - Classic cyan (default)
- **#00ff41** - Matrix green
- **#bf00ff** - Futuristic purple
- **#ff8800** - Warm orange
- **#ff0040** - Alert red

### Step 4: Enjoy!
The holographic effect updates in real-time!

---

## 📍 All Control Locations

### 1. Main Application (Production UI)
- **URL:** `http://localhost:3000/`
- **Controls:** Right sidebar (click button in top-right)
- **Features:** Full integration with LiveKit agent

### 2. Demo Page (Testing)
- **URL:** `http://localhost:3000/components/talkinghead`
- **Controls:** Left panel
- **Features:** Full animation playground with all controls

### 3. Component Demo
- **URL:** `http://localhost:3000/components/livekit`
- **Controls:** Bottom overlay
- **Features:** Component-level demo

---

## 🐛 Troubleshooting

### Still seeing "THREE.js is not loaded"?
1. **Clear browser cache** (Ctrl+Shift+R or Cmd+Shift+R)
2. **Restart dev server:**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```
3. **Check console** for "✅ THREE.js loaded: true"

### Controls not appearing?
1. Make sure avatar has loaded (no loading spinner)
2. Click the controls button in top-right corner
3. Check that `enableControls={true}` is set (already done!)

### Effect not visible?
1. Make sure you toggled it ON
2. Try changing the color to something bright like **#00ff00**
3. Try different camera views (Full, Mid, Upper, Head)

---

## 🎉 Success Checklist

- ✅ THREE.js now loads globally with TalkingHead
- ✅ Holographic controls added to main sidebar
- ✅ Color picker for real-time customization
- ✅ Works on main application at `http://localhost:3000/`
- ✅ Status messages show effect state
- ✅ No more infinite "waiting" loops

---

## 💡 Pro Tips

1. **Best viewing angle:** Try "Full" or "Upper" camera view for maximum holographic effect
2. **Fresnel effect:** Move the camera to see edge glow from different angles
3. **Glitch waves:** Watch the vertices slightly shift for the futuristic glitch effect
4. **Combine with moods:** Try Happy + Cyan or Angry + Red for themed holograms
5. **Performance:** Effect is GPU-accelerated and should run at 60 FPS

---

**Need more help?** Check out [HOLOGRAPHIC_QUICK_START.md](./HOLOGRAPHIC_QUICK_START.md) for detailed usage guide!





