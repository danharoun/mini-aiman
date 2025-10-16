# 📱 Android Performance Optimization Guide

## 🎯 Overview

The app now includes **automatic performance optimizations** for Android devices, but you can do more on your phone to improve performance.

---

## ✅ Automatic Optimizations (Built-in)

### What the App Does Automatically:

1. **Device Detection**
   - Detects if you're on mobile vs desktop
   - Identifies low-end devices (< 4GB RAM, < 4 CPU cores)
   - Adjusts quality based on device capabilities

2. **Renderer Optimizations**
   - **Low-End Devices**: 
     - Pixel ratio: 1.0 (lower resolution)
     - Antialiasing: OFF
     - Shadows: OFF
     - Reduced render resolution (75%)
   
   - **Mid-Range Mobile**:
     - Pixel ratio: 1.5
     - Antialiasing: ON
     - Shadows: OFF
     - Normal resolution
   
   - **Desktop/High-End**:
     - Pixel ratio: 2.0
     - Antialiasing: ON
     - Shadows: ON
     - Full resolution

3. **Holographic Effect Optimization**
   - **Low-End**: Lighter effect (60% opacity), glitch disabled
   - **Mid-Range**: Medium effect (80% opacity)
   - **High-End**: Full effect (100% opacity)

---

## 🔧 Phone Settings to Improve Performance

### 1. **Enable Developer Options** (Android)
1. Go to **Settings** → **About Phone**
2. Tap **Build Number** 7 times (enables Developer Options)
3. Go back → **Settings** → **Developer Options**

### 2. **GPU Settings** (in Developer Options)
Enable these:
- ✅ **Force GPU rendering** (or "Force GPU 2D rendering")
- ✅ **Disable HW overlays**
- ✅ **GPU view updates** (optional, for debugging)

### 3. **Animation Settings** (in Developer Options)
Reduce or disable:
- **Window animation scale** → 0.5x or OFF
- **Transition animation scale** → 0.5x or OFF
- **Animator duration scale** → 0.5x or OFF

### 4. **Chrome Flags** (for better WebGL)
Open Chrome and go to: `chrome://flags`

Enable these:
- `#enable-webgl2-compute-context` → **Enabled**
- `#enable-gpu-rasterization` → **Enabled**
- `#enable-zero-copy` → **Enabled**
- `#enable-vulkan` → **Enabled** (if available)

Then **restart Chrome**

### 5. **Battery & Performance**
- **Performance Mode**: Settings → Battery → Performance mode
- **Close Background Apps**: Free up RAM
- **Disable Battery Saver**: Can throttle GPU

### 6. **Chrome Settings**
In Chrome:
- Settings → Site settings → JavaScript → **Enabled**
- Settings → Site settings → Cookies → **Allow all**
- Settings → **Lite mode** → **OFF** (can interfere with 3D)

---

## 🚀 Quick Performance Checklist

### Before Using the App:
- [ ] Close other apps (free up RAM)
- [ ] Enable Performance Mode (if available)
- [ ] Disable Battery Saver
- [ ] Have at least 20% battery
- [ ] Good WiFi/4G connection (for LiveKit audio)

### In the App:
- [ ] Hide UI when not needed (tap ☰)
- [ ] Keep background black (less rendering work)
- [ ] Lower holographic opacity if laggy
- [ ] Disable holographic if very laggy (tap ✨)

---

## 📊 Performance Indicators

### Check Console Logs:
```
📱 Device capabilities: {
  isMobile: true,
  isLowEnd: false,
  pixelRatio: 1.5,
  cores: 8,
  memory: 6
}
✅ Pixel ratio set to: 1.5
✅ Shadows disabled
✅ TalkingHead optimized for device
```

### Expected Performance:
- **High-End** (Snapdragon 8xx, 8GB+ RAM): 60 FPS smooth
- **Mid-Range** (Snapdragon 7xx, 6GB RAM): 45-60 FPS
- **Low-End** (Snapdragon 6xx, 4GB RAM): 30-45 FPS

---

## 🐛 If Still Laggy

### Troubleshooting Steps:

1. **Force Low-End Mode**
   - Open browser console (DevTools)
   - Type: `localStorage.setItem('forceLowEndMode', 'true')`
   - Refresh page

2. **Reduce Resolution Manually**
   - Open console
   - Type: `window.devicePixelRatio = 1`
   - Refresh page

3. **Disable Holographic**
   - Tap ✨ button to turn OFF
   - Much better performance without shaders

4. **Clear Chrome Cache**
   - Settings → Privacy → Clear browsing data
   - Select "Cached images and files"
   - Clear data

5. **Update Chrome**
   - Play Store → My apps → Chrome → Update
   - Newer versions have better WebGL performance

6. **Restart Phone**
   - Sometimes helps free up resources

---

## 🔬 Advanced Optimization

### For Developers:

1. **Manual Device Configuration**
   Edit `lib/performance-utils.ts`:
   ```typescript
   // Force specific settings
   export function getRendererSettings(capabilities: DeviceCapabilities) {
     return {
       antialias: false,
       pixelRatio: 1,
       shadowMapEnabled: false,
       maxLights: 1,
     };
   }
   ```

2. **Reduce Lipsync Quality**
   Edit `hooks/useTalkingHeadStreaming.ts`:
   ```typescript
   // Use longer word intervals
   const msPerWord = 500; // Was 333, now slower but smoother
   ```

3. **Disable Animations**
   In `lib/holographic-material.ts`:
   ```typescript
   // Comment out the animation loop
   // setupAnimationLoop(head);
   ```

---

## 📱 Recommended Devices

### Great Performance:
- Samsung Galaxy S21+ or newer
- Google Pixel 6 or newer
- OnePlus 9 or newer
- Xiaomi Mi 11 or newer
- Any flagship from 2021+

### Good Performance:
- Samsung Galaxy A52 or newer
- Google Pixel 4a or newer
- OnePlus Nord series
- Mid-range from 2020+

### Minimum Requirements:
- Android 9.0+
- 4GB RAM
- Chrome 90+
- OpenGL ES 3.0+

---

## 💡 Performance Tips

### Best Practices:
1. **Use in Portrait Mode**: Optimized for portrait
2. **Full Brightness**: Easier to see (optional)
3. **Stable Internet**: 4G/WiFi for smooth audio
4. **Close Instagram/TikTok**: Heavy apps in background
5. **Cool Phone**: Overheating = throttling

### What Affects Performance Most:
1. **Holographic Effect** (disable for 2x speed)
2. **Pixel Ratio** (lower = faster)
3. **Screen Resolution** (1080p vs 1440p)
4. **Background Apps** (free RAM!)
5. **Battery Level** (< 20% = slower)

---

## 🎯 Performance Modes

### Mode 1: Ultra Performance (Low-End)
- Holographic: OFF
- Resolution: 720p equivalent
- Shadows: OFF
- FPS: ~60

### Mode 2: Balanced (Mid-Range)
- Holographic: ON (80% opacity)
- Resolution: 1080p equivalent
- Shadows: OFF
- FPS: ~45

### Mode 3: Quality (High-End)
- Holographic: ON (100% opacity)
- Resolution: 1440p equivalent
- Shadows: ON (if supported)
- FPS: ~60

---

## 📈 Monitoring Performance

### Chrome DevTools on Android:
1. Connect phone to PC via USB
2. Enable USB Debugging in Developer Options
3. Open `chrome://inspect` on PC
4. Inspect the page
5. Check **Performance** tab

### Key Metrics:
- **FPS**: Should be 30+ (60 is ideal)
- **Frame Time**: Should be < 33ms
- **GPU Memory**: Check for leaks
- **JS Heap**: Should stabilize after load

---

## 🚨 Known Issues

### Issue: Lag after 5-10 minutes
**Cause**: Memory leak in THREE.js or browser
**Solution**: Refresh page, or disable/re-enable holographic

### Issue: Choppy audio
**Cause**: Network or CPU throttling
**Solution**: Disable holographic, check internet

### Issue: Black screen on load
**Cause**: WebGL context lost
**Solution**: Refresh page, update Chrome

### Issue: Overheating
**Cause**: Continuous 3D rendering + holographic
**Solution**: Disable holographic, take breaks

---

## ✅ Performance Checklist Summary

**Phone Settings:**
- [ ] Developer Options enabled
- [ ] Force GPU rendering ON
- [ ] Animation scales reduced (0.5x or OFF)
- [ ] Chrome flags enabled (GPU rasterization, etc.)
- [ ] Performance mode enabled
- [ ] Background apps closed

**App Settings:**
- [ ] UI hidden when not needed
- [ ] Holographic OFF if laggy
- [ ] Black background
- [ ] Portrait orientation

**Environment:**
- [ ] Good WiFi/4G signal
- [ ] Phone battery > 20%
- [ ] Phone not overheating
- [ ] Chrome updated to latest

---

## 🔗 Resources

- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [WebGL Performance](https://www.khronos.org/webgl/wiki/Performance)
- [Android Developer Options](https://developer.android.com/studio/debug/dev-options)

---

**Last Updated**: December 2024
**Version**: 1.0 - Android Optimization Guide


