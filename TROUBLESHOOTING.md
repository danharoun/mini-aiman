# TalkingHead Integration - Troubleshooting

## Common Issues and Solutions

### Issue: `__turbopack_context__.x is not a function`

**Problem**: Direct CDN imports don't work with Next.js/Turbopack's module system.

**Solution**: We've implemented a dynamic script loader that:
1. Loads the TalkingHead library via script tags
2. Exposes it on the window object
3. Uses import maps for dependencies

**Files involved**:
- `lib/load-talkinghead.ts` - Script loader utility
- `hooks/useTalkingHead.ts` - Updated to use the loader
- `types/talkinghead.d.ts` - TypeScript declarations
- `next.config.ts` - CSP headers for external scripts

### Issue: Import Map Already Exists

**Problem**: Multiple TalkingHead components trying to load the library simultaneously.

**Solution**: The loader caches the load promise and reuses it across all instances.

```typescript
// The loader ensures only one load attempt happens
export function loadTalkingHead(): Promise<void> {
  if (loadPromise) {
    return loadPromise; // Reuse existing promise
  }
  // ... load logic
}
```

### Issue: Three.js Conflicts

**Problem**: Your app might already have Three.js installed via npm.

**Solution**: The TalkingHead library uses its own Three.js from CDN. They don't conflict because:
- The CDN version is loaded as an ES module
- It's used only within TalkingHead's scope
- Your npm Three.js remains available for other uses

### Issue: Avatar Not Loading

**Symptoms**:
- Spinner keeps showing
- Console shows 404 errors
- Error message about missing file

**Solutions**:

1. **Check file location**:
   ```bash
   # Make sure aiman.glb is in the correct location
   ls public/aiman.glb
   ```

2. **Check file path in code**:
   ```tsx
   // Should be relative to public directory
   <TalkingHeadAvatar avatarUrl="/aiman.glb" />
   // NOT: avatarUrl="./aiman.glb" or avatarUrl="public/aiman.glb"
   ```

3. **Check browser console** for specific error messages

### Issue: Lip-Sync Not Working

**Symptoms**:
- Avatar loads but mouth doesn't move
- No speech audio
- Console errors about TTS

**Solutions**:

1. **Check TTS API key**:
   ```typescript
   // lib/talkinghead-config.ts
   export const TALKINGHEAD_CONFIG = {
     tts: {
       apiKey: 'YOUR_GOOGLE_CLOUD_API_KEY', // Update this
     }
   };
   ```

2. **Get a free Google Cloud TTS API key**:
   - Go to https://cloud.google.com/text-to-speech
   - Enable the Text-to-Speech API
   - Create credentials
   - Update the config

3. **Check network requests**:
   - Open DevTools → Network tab
   - Filter for "texttospeech"
   - Check if requests are failing

### Issue: Performance Problems

**Symptoms**:
- Laggy animations
- Slow frame rate
- Browser freezing

**Solutions**:

1. **Use head-only view**:
   ```typescript
   const { head } = useTalkingHead(containerRef, {
     cameraView: 'head', // Less rendering overhead
   });
   ```

2. **Enable hardware acceleration**:
   - Chrome: `chrome://settings/system`
   - Enable "Use hardware acceleration when available"

3. **Close other applications** and browser tabs

4. **Lower quality settings** (if available in future updates)

### Issue: Module Not Found Errors

**Symptoms**:
- TypeScript errors about missing modules
- Build failures

**Solutions**:

1. **Install dependencies**:
   ```bash
   npm install three @types/three
   ```

2. **Clear Next.js cache**:
   ```bash
   rm -rf .next
   npm run dev
   ```

3. **Restart dev server**:
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

### Issue: CSP (Content Security Policy) Errors

**Symptoms**:
- Console errors about blocked scripts
- Scripts not loading from CDN

**Solution**: Already configured in `next.config.ts`:

```typescript
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net;",
        },
      ],
    },
  ];
}
```

If still having issues, check your hosting provider's CSP settings.

### Issue: Avatar Appears Black or Corrupted

**Symptoms**:
- Avatar loads but appears completely black
- Strange visual artifacts

**Solutions**:

1. **Check lighting** (TalkingHead handles this, but you can verify):
   ```typescript
   // The library should automatically set up lighting
   // If issues persist, check browser WebGL support
   ```

2. **Verify WebGL support**:
   - Visit: https://get.webgl.org/
   - Should see a spinning cube
   - If not, update graphics drivers

3. **Try different browser**:
   - Chrome (recommended)
   - Firefox
   - Edge

### Issue: TypeScript Errors

**Symptoms**:
- Red squiggly lines in IDE
- Type checking errors

**Solutions**:

1. **Check type definitions exist**:
   ```bash
   ls types/talkinghead.d.ts
   ```

2. **Restart TypeScript server** in VS Code:
   - Cmd/Ctrl + Shift + P
   - Type "TypeScript: Restart TS Server"

3. **Add type casting** if needed:
   ```typescript
   const TalkingHead = getTalkingHead() as any;
   ```

## Getting Help

### Check Console Logs

The integration includes helpful console logs:
- ✅ "TalkingHead library loaded successfully"
- ✓ "Enhanced gestures for avatar with 4-bone fingers"

### Enable Debug Mode

Add to your component:

```typescript
React.useEffect(() => {
  if (head) {
    console.log('TalkingHead instance:', head);
    console.log('Available gestures:', Object.keys(head.gestureTemplates));
  }
}, [head]);
```

### Minimal Test Case

Create a simple test page:

```tsx
// app/test/page.tsx
'use client';
import { useRef } from 'react';
import { useTalkingHead } from '@/hooks/useTalkingHead';

export default function Test() {
  const ref = useRef(null);
  const { head, isLoading, error } = useTalkingHead(ref);

  return (
    <div>
      <div ref={ref} className="h-screen" />
      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {head && <p>Success!</p>}
    </div>
  );
}
```

### Browser Compatibility

**Recommended**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

**Required features**:
- WebGL 2.0
- ES Modules
- Import Maps
- Web Audio API
- Async/Await

### Report Issues

If you're still having problems:

1. Check browser console for errors
2. Note your browser version and OS
3. Check if the issue occurs in incognito/private mode
4. Try the demo page: `/components/talkinghead`
5. Check the original TalkingHead repo: https://github.com/met4citizen/TalkingHead

## Performance Tips

1. **Use appropriate camera view**:
   - `head` - Best performance (recommended for chat)
   - `upper` - Good balance
   - `mid` - More expensive
   - `full` - Most expensive (use for showcases only)

2. **Limit simultaneous avatars**: One avatar per page for best performance

3. **Disable when not visible**:
   ```typescript
   useEffect(() => {
     if (!isVisible && head) {
       head.stop();
     } else if (isVisible && head) {
       head.start();
     }
   }, [isVisible, head]);
   ```

4. **Clean up properly**:
   ```typescript
   useEffect(() => {
     return () => {
       if (head) {
         head.stop();
       }
     };
   }, [head]);
   ```

## Next Steps

After resolving issues:
1. Visit `/components/talkinghead` for the full playground
2. Customize in `lib/talkinghead-config.ts`
3. Read `TALKINGHEAD_INTEGRATION.md` for full API docs
4. Check `QUICK_START.md` for usage examples


