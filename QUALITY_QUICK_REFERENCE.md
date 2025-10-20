# ⚡ Quality Settings - Quick Reference

## 🎯 Choose Your Quality

### 🔴 ULTRA LOW (2GB RAM)
```
NO GLITCH | 30 FPS | 0.75x Resolution
Best for: Old phones, 2GB RAM
```

### 🟠 LOW (4GB RAM)
```
15% Glitch | 45 FPS | 1.0x Resolution
Best for: Budget phones, 4GB RAM
```

### 🟡 MEDIUM (6GB RAM) ⭐ DEFAULT
```
25% Glitch | 60 FPS | 1.5x Resolution
Best for: Mid-range phones, most users
```

### 🟢 HIGH (8GB+ RAM)
```
35% Glitch | 60 FPS | 2.0x Resolution
Best for: Flagship phones, 8GB+ RAM
```

### 💎 ULTRA (Desktop)
```
50% Glitch | 60 FPS | 2.0x Resolution + Shadows
Best for: Desktop, gaming phones (12GB+)
```

---

## 🔧 How to Change

**In-App:**
1. Tap **☰** (top-right)
2. Tap **Quality** (top-left)
3. Select level
4. Page reloads

**Console:**
```javascript
localStorage.setItem('qualityLevel', 'ultra-low')
localStorage.setItem('qualityLevel', 'low')
localStorage.setItem('qualityLevel', 'medium')
localStorage.setItem('qualityLevel', 'high')
localStorage.setItem('qualityLevel', 'ultra')
```

---

## 📊 Comparison Table

| Quality | RAM | Glitch | Speed | FPS | Resolution |
|---------|-----|--------|-------|-----|-----------|
| 🔴 Ultra Low | 2GB | ❌ OFF | - | 30 | 75% |
| 🟠 Low | 4GB | 15% | 0.5x | 45 | 100% |
| 🟡 Medium | 6GB | 25% | 1.0x | 60 | 150% |
| 🟢 High | 8GB+ | 35% | 1.5x | 60 | 200% |
| 💎 Ultra | Desktop | 50% | 2.0x | 60 | 200% |

---

## 💡 Quick Tips

**Laggy?** → Go one level **lower**  
**Too smooth?** → Go one level **higher**  
**2GB RAM?** → Use **Ultra Low**  
**Desktop?** → Use **Ultra**  
**Battery low?** → Use **Low**  

---

## 🎭 What Changes

**Ultra Low vs Ultra:**
- **Resolution**: 4x difference
- **Glitch**: OFF vs Maximum
- **Stripes**: 10 vs 25
- **FPS**: 30 vs 60
- **GPU**: 30% vs 85%

---

## 📱 Device Examples

**2GB RAM**: Samsung A12, Redmi 9A → **Ultra Low**  
**4GB RAM**: Samsung A32, Pixel 4a → **Low**  
**6GB RAM**: Samsung A52, Pixel 5 → **Medium**  
**8GB RAM**: Samsung S21, Pixel 6 → **High**  
**Desktop**: Any PC/Mac → **Ultra**

---

**Quick Answer**: Tap ☰ → Quality (top-left) → Select your RAM level





