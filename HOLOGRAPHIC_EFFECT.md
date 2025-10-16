# Holographic Effect for TalkingHead Avatar

## Overview

The holographic effect transforms your TalkingHead avatar (aiman.glb) into a stunning holographic display inspired by sci-fi aesthetics. This effect uses custom GLSL shaders to create:

- **Animated striped patterns** that flow across the model
- **Fresnel effect** for edge highlighting based on viewing angle
- **Glitch animation** with vertex displacement for a futuristic feel
- **Customizable colors** to match your design
- **Transparency and additive blending** for a true holographic appearance

## Features

### Visual Effects

1. **Stripes Pattern**
   - Animated horizontal stripes flowing upward
   - Adjustable frequency and animation speed
   - Sharp gradient transitions using power functions

2. **Fresnel Effect**
   - Brighter edges when viewed at shallow angles
   - Natural falloff toward the center
   - Respects surface normals for realistic lighting

3. **Glitch Effect**
   - Random vertex displacement waves
   - Multiple sine wave frequencies for organic movement
   - Smooth transitions using smoothstep

4. **Color Customization**
   - Choose any color via color picker
   - Default cyan (#70c1ff) for classic hologram look
   - Real-time color updates

## Implementation

### Architecture

```
lib/
├── shaders/
│   ├── holographic/
│   │   ├── vertex.glsl      # Vertex shader with glitch effect
│   │   └── fragment.glsl    # Fragment shader with stripes & fresnel
│   └── includes/
│       └── random2D.glsl    # Random number generation utility
├── holographic-material.ts  # Material management utility
└── load-talkinghead.ts      # TalkingHead library loader

hooks/
└── useTalkingHead.ts        # Updated with holographic support

components/
└── livekit/
    └── talking-head-avatar.tsx  # Updated with holographic controls
```

### How It Works

#### 1. Shader Creation

The holographic effect is achieved through custom GLSL shaders:

**Vertex Shader (`vertex.glsl`)**
- Transforms vertices using model, view, and projection matrices
- Applies glitch effect by displacing vertices randomly
- Uses time-based animation for wave-like motion
- Passes position and normal data to fragment shader

**Fragment Shader (`fragment.glsl`)**
- Creates animated stripe pattern using modulo operations
- Calculates Fresnel effect based on view angle and surface normal
- Combines effects with multiplication and addition
- Applies falloff for edge transparency
- Uses additive blending for holographic glow

#### 2. Material Application

The `applyHolographicMaterial` function:
1. Traverses the avatar's 3D model hierarchy
2. Stores original materials for restoration
3. Replaces materials with custom ShaderMaterial
4. Sets up animation loop to update time uniform
5. Configures transparency and blending modes

#### 3. Integration with TalkingHead

The holographic system integrates seamlessly:
- Optional `holographic` config in `TalkingHeadOptions`
- Applied automatically after avatar loads
- Toggle on/off without reloading avatar
- Real-time color updates

## Usage

### Basic Usage

```typescript
import { TalkingHeadAvatar } from '@/components/livekit/talking-head-avatar';

function MyComponent() {
  return (
    <TalkingHeadAvatar
      avatarUrl="/aiman.glb"
      holographic={{
        enabled: true,
        color: '#70c1ff'
      }}
    />
  );
}
```

### With Controls

```typescript
import { TalkingHeadAvatar } from '@/components/livekit/talking-head-avatar';

function MyComponent() {
  return (
    <TalkingHeadAvatar
      avatarUrl="/aiman.glb"
      enableControls={true}  // Shows UI controls including holographic toggle
      holographic={{
        enabled: false,  // Start with effect disabled
        color: '#70c1ff'
      }}
    />
  );
}
```

### Programmatic Control

```typescript
import { useTalkingHead } from '@/hooks/useTalkingHead';

function MyComponent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { head, setHolographic } = useTalkingHead(containerRef, {
    holographic: { enabled: false }
  });

  const toggleHolographic = () => {
    setHolographic(true, '#00ff00');  // Enable with green color
  };

  return (
    <div>
      <div ref={containerRef} />
      <button onClick={toggleHolographic}>Enable Holographic</button>
    </div>
  );
}
```

### Direct API Usage

```typescript
import {
  applyHolographicMaterial,
  updateHolographicColor,
  disableHolographicEffect
} from '@/lib/holographic-material';

// Apply effect
applyHolographicMaterial(head, {
  enabled: true,
  color: '#70c1ff'
});

// Change color
updateHolographicColor(head, '#ff00ff');

// Disable effect
disableHolographicEffect(head);
```

## Customization

### Shader Parameters

You can customize the effect by modifying the shader code in `lib/holographic-material.ts`:

#### Stripe Frequency
```glsl
// In fragment shader, line ~60
float stripes = mod((vPosition.y - uTime * 0.02) * 20.0, 1.0);
//                                              ^^^^
//                                          Increase for more stripes
```

#### Animation Speed
```glsl
// In fragment shader, line ~60
float stripes = mod((vPosition.y - uTime * 0.02) * 20.0, 1.0);
//                                         ^^^^
//                                    Increase for faster animation
```

#### Glitch Intensity
```glsl
// In vertex shader, line ~28
glitchStrength *= 0.25;
//                ^^^^
//            Increase for stronger glitch
```

#### Fresnel Power
```glsl
// In fragment shader, line ~66
fresnel = pow(fresnel, 2.0);
//                     ^^^
//                 Increase for sharper edges
```

#### Edge Falloff
```glsl
// In fragment shader, line ~69
float falloff = smoothstep(0.8, 0.0, fresnel);
//                         ^^^  ^^^
//                    Adjust range for different falloff
```

### Color Presets

Common holographic colors:

```typescript
const colors = {
  cyan: '#70c1ff',      // Classic hologram
  green: '#00ff41',     // Matrix style
  blue: '#0080ff',      // Cool blue
  purple: '#bf00ff',    // Futuristic purple
  orange: '#ff8800',    // Warm glow
  pink: '#ff00ff',      // Neon pink
};
```

## Technical Details

### Shader Uniforms

- `uTime` (float): Elapsed time for animations
- `uColor` (vec3): RGB color for the hologram

### Shader Attributes

- `position` (vec3): Vertex position
- `normal` (vec3): Vertex normal

### Shader Varyings

- `vPosition` (vec3): World-space position passed to fragment
- `vNormal` (vec3): World-space normal passed to fragment

### Material Properties

```javascript
{
  transparent: true,           // Enable transparency
  side: THREE.DoubleSide,      // Render both faces
  depthWrite: false,           // Don't write to depth buffer
  blending: THREE.AdditiveBlending  // Additive blending for glow
}
```

## Performance

The holographic effect is optimized for real-time rendering:

- Single ShaderMaterial applied to entire avatar
- Efficient GLSL code with minimal operations
- Hardware-accelerated vertex and fragment processing
- ~60 FPS on modern GPUs

### Performance Tips

1. Reduce glitch complexity by using fewer sine waves
2. Lower stripe frequency to reduce fragment shader work
3. Use simpler random function if needed
4. Consider disabling effect on low-end devices

## Browser Compatibility

Requires WebGL support:
- ✅ Chrome/Edge 90+
- ✅ Firefox 90+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS 14+, Android Chrome 90+)

## Troubleshooting

### Effect Not Visible

1. Check that avatar is loaded: `isAvatarLoaded === true`
2. Verify holographic is enabled: `holographic.enabled === true`
3. Check browser console for shader errors
4. Ensure WebGL is supported: `!!document.createElement('canvas').getContext('webgl')`

### Performance Issues

1. Reduce stripe frequency (change `* 20.0` to `* 10.0`)
2. Simplify glitch effect (use single sine wave)
3. Disable on low-end devices using feature detection

### Color Not Updating

1. Ensure `setHolographic` is called with both parameters
2. Check that effect is enabled when changing color
3. Verify color format is hex: `#rrggbb`

### Shader Compilation Errors

1. Check browser console for detailed error messages
2. Verify GLSL syntax (semicolons, types, etc.)
3. Test in different browsers (some have stricter parsers)

## Examples

### Demo Page

Visit `/components/talkinghead` to see the holographic effect in action with full controls.

### Quick Test

```typescript
// Navigate to /components/talkinghead
// 1. Wait for avatar to load
// 2. Click "Holographic OFF" button to enable
// 3. Use color picker to change hologram color
// 4. Try different camera views to see Fresnel effect
```

## Future Enhancements

Potential improvements:

- [ ] Add UI sliders for stripe frequency, glitch intensity
- [ ] Preset color themes (Matrix, Tron, Star Wars)
- [ ] Multiple animation modes (static, flowing, pulsing)
- [ ] Particle effects around avatar
- [ ] Audio-reactive holographic intensity
- [ ] Glitch patterns triggered by speech

## References

- [TalkingHead Library](https://github.com/met4citizen/TalkingHead)
- [Three.js ShaderMaterial](https://threejs.org/docs/#api/en/materials/ShaderMaterial)
- [GLSL Documentation](https://www.khronos.org/opengl/wiki/OpenGL_Shading_Language)
- [Fresnel Effect Explained](https://www.dorian-iten.com/fresnel/)
- [Book of Shaders - Random](https://thebookofshaders.com/10/)

## Credits

Holographic shader effect inspired by:
- Three.js Journey course by Bruno Simon
- Met4citizen's TalkingHead library
- Sci-fi hologram aesthetics from Star Wars, Blade Runner, etc.

---

**Built with ❤️ for the TalkingHead community**


