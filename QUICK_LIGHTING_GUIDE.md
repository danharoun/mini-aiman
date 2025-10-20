# 🌙 Quick Lighting Guide

## Current Settings

### Scene Lighting Intensity:
- **DirectionalLight**: 50% (was 100%)
- **AmbientLight**: 60% (was 100%)
- **PointLight/SpotLight**: 50% (was 100%)

### Background:
- **Color**: Black (#000000) ✅

---

## How to Adjust

### Make it DARKER (more dramatic):
Edit `hooks/useTalkingHead.ts`, line ~259-263:

```typescript
// Very dark (30%)
child.intensity *= 0.3;

// Dark (40%)
child.intensity *= 0.4;
```

### Make it LIGHTER (more visible):
```typescript
// Slightly dim (70%)
child.intensity *= 0.7;

// Almost full (80%)
child.intensity *= 0.8;
```

### Current (balanced):
```typescript
// Directional/Point/Spot
child.intensity *= 0.5; // 50%

// Ambient
child.intensity *= 0.6; // 60%
```

---

## Visual Reference

```
100% ☀️ ========== Very Bright (Original)
 80% 💡 ========   Bright
 60% 🔆 ======     Moderate
 50% 🌙 =====      Soft (Current)
 40% 🌑 ====       Dim
 30% ⚫ ===        Very Dim
```

**Current**: 50-60% = Soft, atmospheric lighting 🌙

---

## Test It

1. Reload the app
2. Avatar loads with **softer lighting**
3. Check console for:
   ```
   💡 Found light: DirectionalLight, intensity: 1.0
   ✅ Reduced to: 0.5
   🌙 Scene lighting reduced for softer look
   ```

---

## Perfect For:
- ✅ Holographic mode (softer glow)
- ✅ Cinematic look
- ✅ Reduce eye strain
- ✅ Dark theme aesthetic
- ✅ Black background

---

## Quick Fix:

**Too Dark?** Change 0.5 → 0.7
**Too Bright?** Change 0.5 → 0.3

That's it! 🌙✨

