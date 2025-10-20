# 🎨 Quality Settings Guide

## Overview

The app now includes **5 quality levels** that you can change at any time to optimize performance for your device. Each quality level adjusts rendering, holographic effects, and glitch animation.

---

## 🎯 Quality Levels

### 🔴 Ultra Low (2GB RAM Devices)
**Perfect for: 2GB RAM phones, old devices**

- **Pixel Ratio**: 0.75 (very low resolution)
- **Antialiasing**: OFF
- **Shadows**: OFF
- **Target FPS**: 30
- **Holographic Effect**:
  - Face: 5% opacity (barely visible)
  - Body: 30% opacity (subtle)
  - **Glitch**: COMPLETELY DISABLED
  - Stripes: 10 (half detail)
- **Power Mode**: Low power

**Use when**: Your device has 2GB RAM or less, or you're experiencing severe lag.

---

### 🟠 Low (4GB RAM Devices)
**Perfect for: Budget phones, low-end Android**

- **Pixel Ratio**: 1.0 (standard resolution)
- **Antialiasing**: OFF
- **Shadows**: OFF
- **Target FPS**: 45
- **Holographic Effect**:
  - Face: 10% opacity
  - Body: 50% opacity
  - **Glitch**: Enabled, 15% intensity (very subtle)
  - Glitch Speed: 0.5x (very slow)
  - Stripes: 15
- **Power Mode**: Low power

**Use when**: You have 4GB RAM or experience occasional lag.

---

### 🟡 Medium (6GB RAM Devices)
**Perfect for: Mid-range phones (default for most)**

- **Pixel Ratio**: 1.5 (good resolution)
- **Antialiasing**: ON
- **Shadows**: OFF
- **Target FPS**: 60
- **Holographic Effect**:
  - Face: 20% opacity
  - Body: 70% opacity
  - **Glitch**: Enabled, 25% intensity (smooth)
  - Glitch Speed: 1.0x (normal)
  - Stripes: 20 (full detail)
- **Power Mode**: Default

**Use when**: You have 6GB RAM and want balanced quality/performance.

---

### 🟢 High (8GB+ RAM Devices)
**Perfect for: High-end phones, flagships**

- **Pixel Ratio**: 2.0 (high resolution)
- **Antialiasing**: ON
- **Shadows**: OFF
- **Target FPS**: 60
- **Holographic Effect**:
  - Face: 20% opacity
  - Body: 90% opacity
  - **Glitch**: Enabled, 35% intensity (strong)
  - Glitch Speed: 1.5x (fast)
  - Stripes: 20
- **Power Mode**: High performance

**Use when**: You have 8GB+ RAM and want great quality.

---

### 💎 Ultra (Desktop / Gaming Phones)
**Perfect for: Desktop browsers, gaming phones**

- **Pixel Ratio**: 2.0 (maximum resolution)
- **Antialiasing**: ON
- **Shadows**: ON
- **Target FPS**: 60
- **Holographic Effect**:
  - Face: 20% opacity
  - Body: 100% opacity (full effect)
  - **Glitch**: Enabled, 50% intensity (maximum)
  - Glitch Speed: 2.0x (full speed)
  - Stripes: 25 (extra detail)
- **Power Mode**: High performance

**Use when**: On desktop or have a gaming phone (12GB+ RAM).

---

## 🔧 How to Change Quality

### Option 1: In-App Selector (Easiest)
1. Tap **☰** (hamburger menu) to show UI
2. Look at **top-left corner** for the quality selector
3. Tap it to see all 5 quality levels
4. Select your preferred quality
5. Page will **reload automatically** to apply settings

### Option 2: Browser Console
1. Open Chrome DevTools (F12)
2. Go to Console tab
3. Type one of these:
   ```javascript
   localStorage.setItem('qualityLevel', 'ultra-low')
   localStorage.setItem('qualityLevel', 'low')
   localStorage.setItem('qualityLevel', 'medium')
   localStorage.setItem('qualityLevel', 'high')
   localStorage.setItem('qualityLevel', 'ultra')
   ```
4. Refresh page

---

## 📊 Performance Comparison

| Quality | Resolution | Glitch | FPS | GPU Usage | Battery |
|---------|-----------|--------|-----|-----------|---------|
| Ultra Low | 75% | OFF | 30 | ~30% | Best |
| Low | 100% | Very Subtle | 45 | ~45% | Good |
| Medium | 150% | Smooth | 60 | ~60% | OK |
| High | 200% | Strong | 60 | ~75% | Heavy |
| Ultra | 200% | Maximum | 60 | ~85% | Heaviest |

---

## 🎭 Glitch Effect Comparison

### Ultra Low: NO GLITCH
- **Intensity**: 0% (completely disabled)
- **Why**: Too expensive for 2GB RAM devices
- **Result**: Smooth, static holographic effect

### Low: VERY SUBTLE GLITCH
- **Intensity**: 15%
- **Speed**: 0.5x (very slow)
- **Frequencies**: Slower (2.34, 5.67 instead of 3.45, 8.76)
- **Why**: Minimal impact on performance
- **Result**: Barely noticeable, smooth animation

### Medium: SMOOTH GLITCH
- **Intensity**: 25%
- **Speed**: 1.0x (normal)
- **Why**: Balanced visual effect
- **Result**: Nice glitch without being jarring

### High: STRONG GLITCH
- **Intensity**: 35%
- **Speed**: 1.5x (fast)
- **Why**: Full experience on capable devices
- **Result**: Clear, energetic glitch effect

### Ultra: MAXIMUM GLITCH
- **Intensity**: 50%
- **Speed**: 2.0x (full speed)
- **Why**: Maximum visual fidelity
- **Result**: Full original glitch effect as designed

---

## 🚀 Recommendations

### If You Have 2GB RAM:
1. Use **Ultra Low** quality
2. Keep holographic **OFF** most of the time
3. Only enable holographic for screenshots
4. Expected FPS: 30-40

### If You Have 4GB RAM:
1. Use **Low** quality
2. Holographic is usable but subtle
3. Glitch is barely visible (by design)
4. Expected FPS: 40-50

### If You Have 6GB RAM:
1. Use **Medium** quality (recommended)
2. Great balance of quality and performance
3. Smooth glitch animation
4. Expected FPS: 50-60

### If You Have 8GB+ RAM:
1. Use **High** quality
2. Full holographic experience
3. Strong glitch effect
4. Expected FPS: 60

### If You're on Desktop:
1. Use **Ultra** quality
2. Maximum visual fidelity
3. All effects enabled
4. Expected FPS: 60

---

## 🔍 Auto-Detection

The app **automatically detects** your device and recommends a quality level:

```
2GB RAM or less → Ultra Low
3-4GB RAM → Low
5-6GB RAM (mobile) → Medium
7-8GB RAM (mobile) or Desktop (≤8GB) → High
9GB+ RAM (mobile) or Desktop (>8GB) → Ultra
```

You'll see a console log when the page loads:
```
🔴 2GB RAM detected → Recommended: ULTRA-LOW quality
⚙️  Active quality: ULTRA-LOW
```

---

## 💡 Tips

### For Best Performance:
- Use **Auto-detected** quality (don't change it)
- If still laggy, go **one level lower**
- Monitor **FPS counter** (top-right on mobile)
- Keep FPS **above 30** for smooth experience

### For Best Quality:
- If your device can handle it, go **one level higher**
- Check if FPS stays **above 50**
- Watch for **overheating**
- If it gets hot, go **one level lower**

### Battery Saving:
- Use **Ultra Low** or **Low** quality
- Disable holographic when not needed
- Lower quality = longer battery life

---

## 🛠️ Troubleshooting

### Issue: "The glitch looks too crazy/jarring"
**Solution**: Lower quality level. The glitch is designed to be subtle on lower qualities.

### Issue: "2GB RAM device still laggy on Ultra Low"
**Solution**: 
1. Disable holographic effect (tap ✨)
2. Close all background apps
3. Enable Force GPU rendering (see `ANDROID_OPTIMIZATION.md`)

### Issue: "High quality not smooth (8GB RAM)"
**Solution**: 
1. Check if other apps are running (free RAM)
2. Try Medium quality instead
3. Your device might be throttling (overheating)

### Issue: "Want more glitch on Medium quality"
**Solution**: Switch to High quality for stronger glitch effect.

### Issue: "Quality selector not visible"
**Solution**: Tap ☰ (hamburger menu top-right) to show UI.

---

## 📱 Quality on Specific Devices

### Samsung Galaxy A Series:
- A52, A53: **Medium** (6GB RAM)
- A32, A42: **Low** (4GB RAM)
- A12, A22: **Ultra Low** (2-3GB RAM)

### Samsung Galaxy S Series:
- S21+, S22, S23: **High** (8-12GB RAM)
- S20, S21: **High** (8GB RAM)
- S10, S20 FE: **Medium** (6-8GB RAM)

### Google Pixel:
- Pixel 6, 7, 8: **High** (8-12GB RAM)
- Pixel 4a, 5, 5a: **Medium** (6-8GB RAM)
- Pixel 3a, 4a: **Low** (4-6GB RAM)

### OnePlus:
- OnePlus 9, 10, 11: **High** (8-12GB RAM)
- OnePlus Nord: **Medium** (6-8GB RAM)
- OnePlus Nord N series: **Low** (4-6GB RAM)

### Budget Phones:
- Most 2GB RAM phones: **Ultra Low**
- Most 3-4GB RAM phones: **Low**
- Mid-range 6GB+ RAM: **Medium**

---

## 🎯 Quick Reference

**2GB RAM** → Ultra Low → No glitch → 30 FPS  
**4GB RAM** → Low → Subtle glitch (15%) → 45 FPS  
**6GB RAM** → Medium → Smooth glitch (25%) → 60 FPS  
**8GB+ RAM** → High → Strong glitch (35%) → 60 FPS  
**Desktop** → Ultra → Max glitch (50%) → 60 FPS  

---

**Tip**: The quality selector shows a colored dot:
- 🔴 Red = Ultra Low
- 🟠 Orange = Low
- 🟡 Yellow = Medium
- 🟢 Green = High
- 💎 Cyan = Ultra

---

**Last Updated**: December 2024  
**Version**: 1.0 - Quality Settings System





