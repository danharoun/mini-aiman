/**
 * Holographic Material for TalkingHead avatars
 * Creates a holographic effect using custom shaders
 */

// Vertex Shader
const vertexShader = `
uniform float uTime;

varying vec3 vPosition;
varying vec3 vNormal;

float random2D(vec2 value)
{
    return fract(sin(dot(value.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void main()
{
    // Position
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    // Glitch effect
    float glitchTime = uTime - modelPosition.y;
    float glitchStrength = sin(glitchTime) + sin(glitchTime * 3.45) + sin(glitchTime * 8.76);
    glitchStrength /= 3.0;
    glitchStrength = smoothstep(0.3, 1.0, glitchStrength);
    glitchStrength *= 0.25;
    modelPosition.x += (random2D(modelPosition.xz + uTime) - 0.5) * glitchStrength;
    modelPosition.z += (random2D(modelPosition.zx + uTime) - 0.5) * glitchStrength;

    // Final position
    gl_Position = projectionMatrix * viewMatrix * modelPosition;

    // Model normal (don't apply translation)
    vec4 modelNormal = modelMatrix * vec4(normal, 0.0);

    // Varyings
    vPosition = modelPosition.xyz;
    vNormal = modelNormal.xyz;
}
`;

// Fragment Shader
const fragmentShader = `
uniform vec3 uColor;
uniform float uTime;

varying vec3 vPosition;
varying vec3 vNormal;

void main()
{
    // Normal
    vec3 normal = normalize(vNormal);
    if(!gl_FrontFacing)
        normal *= - 1.0;

    // Stripes pattern
    float stripes = mod((vPosition.y - uTime * 0.02) * 20.0, 1.0);
    stripes = pow(stripes, 3.0);

    // Fresnel effect
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    float fresnel = dot(viewDirection, normal) + 1.0;
    fresnel = pow(fresnel, 2.0);

    // Falloff at edges
    float falloff = smoothstep(0.8, 0.0, fresnel);

    // HEIGHT-BASED INTENSITY GRADIENT
    // Upper parts (face/hair) = less holographic, Lower parts (body) = more holographic
    // Adjust these values based on your avatar height:
    // - Upper threshold (1.3) = head/face area (low intensity)
    // - Lower threshold (0.3) = body area (full intensity)
    float heightFade = smoothstep(1.3, 0.3, vPosition.y);
    
    // Scale the intensity: face gets 20% effect, body gets 100% effect
    float intensityMultiplier = mix(0.2, 1.0, heightFade);

    // Holographic combination
    float holographic = stripes * fresnel;
    holographic += fresnel * 1.25;
    holographic *= falloff;
    
    // Apply height-based intensity reduction
    holographic *= intensityMultiplier;

    // Final color
    gl_FragColor = vec4(uColor, holographic);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
`;

export interface HolographicOptions {
  color?: string;
  enabled?: boolean;
  excludeMeshNames?: string[];  // Array of mesh names to exclude from holographic effect
  excludeMaterialNames?: string[];  // Array of material names to exclude
  // Height-based intensity control
  faceIntensity?: number;  // 0.0 to 1.0, default 0.2 (20% effect on face/hair)
  bodyIntensity?: number;  // 0.0 to 1.0, default 1.0 (100% effect on body)
  upperThreshold?: number; // Y position for face/hair, default 1.3
  lowerThreshold?: number; // Y position for body, default 0.3
}

/**
 * Apply holographic material to a TalkingHead avatar
 * This function traverses the avatar's 3D model and replaces materials with the holographic shader
 */
export function applyHolographicMaterial(
  head: any,
  options: HolographicOptions = {}
): void {
  if (typeof window === 'undefined') {
    console.warn('Cannot apply holographic material: window is undefined');
    return;
  }

  // Check if head instance is valid
  if (!head || !head.armature) {
    console.warn('Invalid head instance or armature not found');
    return;
  }

  // Get THREE.js from window (loaded by TalkingHead)
  const THREE = (window as any).THREE;
  if (!THREE) {
    console.error('THREE.js is not loaded. Make sure TalkingHead library is fully loaded.');
    return;
  }

  const { 
    color = '#70c1ff', 
    enabled = true,
    excludeMeshNames = [],
    excludeMaterialNames = [],
    faceIntensity = 0.2,
    bodyIntensity = 1.0,
    upperThreshold = 1.3,
    lowerThreshold = 0.3
  } = options;

  if (!enabled) {
    // Restore original materials if disabled
    restoreOriginalMaterials(head);
    return;
  }

  // Prevent re-applying if already applied with same settings
  if ((head as any)._holographicApplied && 
      (head as any)._holographicColor === color &&
      (head as any)._holographicMaterials) {
    console.log('⏭️  Holographic already applied with same color, skipping');
    return;
  }

  // Access the avatar's armature (3D model)
  const armature = head.armature;
  if (!armature) {
    console.error('Avatar armature not found');
    return;
  }

  // Create base holographic shader material with intensity controls
  const baseHolographicMaterial = {
    vertexShader,
    fragmentShader,
    uniforms: {
      uTime: new THREE.Uniform(0),
      uColor: new THREE.Uniform(new THREE.Color(color)),
      uFaceIntensity: new THREE.Uniform(faceIntensity),
      uBodyIntensity: new THREE.Uniform(bodyIntensity),
      uUpperThreshold: new THREE.Uniform(upperThreshold),
      uLowerThreshold: new THREE.Uniform(lowerThreshold),
    },
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  };

  // Store original materials for restoration
  const originalMaterials = new Map();
  const holographicMaterials: any[] = [];

  // Traverse the avatar and inject holographic shader into existing materials
  armature.traverse((child: any) => {
    if (child.isMesh && child.material) {
      const mat = child.material;
      
      // Check if this mesh/material should be excluded
      const shouldExclude = 
        excludeMeshNames.includes(child.name) ||
        excludeMaterialNames.includes(mat.name);

      if (shouldExclude) {
        console.log('⏭️  Skipping excluded mesh:', child.name, '(material:', mat.name + ')');
        return;
      }
      
      // DEBUG: Print mesh details
      console.log('🔍 Mesh found:', {
        name: child.name,
        materialName: mat.name,
        materialType: mat.type,
        hasSkinning: !!child.skeleton,
        hasMorphTargets: !!child.morphTargetInfluences,
      });
      
      // Store ORIGINAL onBeforeCompile before we modify it
      const originalOnBeforeCompile = mat.onBeforeCompile;
      
      // Store original material and shader (only first time)
      if (!originalMaterials.has(child.uuid)) {
        originalMaterials.set(child.uuid, {
          onBeforeCompile: originalOnBeforeCompile,
          customProgramCacheKey: mat.customProgramCacheKey,
          transparent: mat.transparent,
          side: mat.side,
          depthWrite: mat.depthWrite,
          blending: mat.blending,
        });
      }

      // Setup material properties for holographic effect
      mat.transparent = true;
      mat.side = THREE.DoubleSide;
      mat.depthWrite = false;
      mat.blending = THREE.AdditiveBlending;

      // CRITICAL: Force Three.js to recognize this as a different material
      // by setting a custom cache key that includes our holographic flag
      const holographicCacheKey = `holographic_${Date.now()}_${Math.random()}`;
      mat.customProgramCacheKey = () => holographicCacheKey;
      
      // Inject custom shader code BEFORE compilation
      mat.onBeforeCompile = (shader: any) => {
        // Call original onBeforeCompile if it exists (preserves TalkingHead's shader modifications)
        if (originalOnBeforeCompile && typeof originalOnBeforeCompile === 'function') {
          originalOnBeforeCompile(shader);
        }
        
        // Add custom uniforms
        shader.uniforms.uTime = baseHolographicMaterial.uniforms.uTime;
        shader.uniforms.uColor = baseHolographicMaterial.uniforms.uColor;
        shader.uniforms.uFaceIntensity = baseHolographicMaterial.uniforms.uFaceIntensity;
        shader.uniforms.uBodyIntensity = baseHolographicMaterial.uniforms.uBodyIntensity;
        shader.uniforms.uUpperThreshold = baseHolographicMaterial.uniforms.uUpperThreshold;
        shader.uniforms.uLowerThreshold = baseHolographicMaterial.uniforms.uLowerThreshold;

        // Add uniform declarations to vertex shader
        shader.vertexShader = 'uniform float uTime;\n' + shader.vertexShader;
        shader.vertexShader = 'varying vec3 vWorldPosition;\n' + shader.vertexShader;

        // Modify vertex shader - add glitch effect (static on face, moving on body)
        shader.vertexShader = shader.vertexShader.replace(
          '#include <begin_vertex>',
          `#include <begin_vertex>
          
          // HEIGHT-BASED GLITCH: Static on face, animated on body
          // Face glitch (upper) - static pattern based on position only
          float faceGlitchX = fract(sin(dot(transformed.xz, vec2(12.9898,78.233))) * 43758.5453123);
          float faceGlitchZ = fract(sin(dot(transformed.zx, vec2(78.233,12.9898))) * 43758.5453123);
          float faceGlitchStrength = (faceGlitchX + faceGlitchZ) * 0.5;
          faceGlitchStrength = smoothstep(0.3, 1.0, faceGlitchStrength) * 0.15;
          
          // Body glitch (lower) - animated moving pattern
          float glitchTime = uTime - transformed.y;
          float bodyGlitchStrength = sin(glitchTime) + sin(glitchTime * 3.45) + sin(glitchTime * 8.76);
          bodyGlitchStrength /= 3.0;
          bodyGlitchStrength = smoothstep(0.3, 1.0, bodyGlitchStrength);
          bodyGlitchStrength *= 0.25;
          
          float random2D_x = fract(sin(dot(transformed.xz + uTime, vec2(12.9898,78.233))) * 43758.5453123);
          float random2D_z = fract(sin(dot(transformed.zx + uTime, vec2(12.9898,78.233))) * 43758.5453123);
          
          // Mix glitch based on height (face vs body)
          float glitchHeightMix = smoothstep(1.3, 0.3, transformed.y); // 0 = face, 1 = body
          float finalGlitchStrength = mix(faceGlitchStrength, bodyGlitchStrength, glitchHeightMix);
          
          transformed.x += (random2D_x - 0.5) * finalGlitchStrength;
          transformed.z += (random2D_z - 0.5) * finalGlitchStrength;
          `
        );

        // Add world position calculation
        shader.vertexShader = shader.vertexShader.replace(
          '#include <worldpos_vertex>',
          `#include <worldpos_vertex>
          vWorldPosition = worldPosition.xyz;
          `
        );

        // Add uniform declarations to fragment shader
        shader.fragmentShader = 'uniform float uTime;\n' + shader.fragmentShader;
        shader.fragmentShader = 'uniform vec3 uColor;\n' + shader.fragmentShader;
        shader.fragmentShader = 'uniform float uFaceIntensity;\n' + shader.fragmentShader;
        shader.fragmentShader = 'uniform float uBodyIntensity;\n' + shader.fragmentShader;
        shader.fragmentShader = 'uniform float uUpperThreshold;\n' + shader.fragmentShader;
        shader.fragmentShader = 'uniform float uLowerThreshold;\n' + shader.fragmentShader;
        shader.fragmentShader = 'varying vec3 vWorldPosition;\n' + shader.fragmentShader;
        
        // Modify fragment shader - add holographic effect
        shader.fragmentShader = shader.fragmentShader.replace(
          'vec4 diffuseColor = vec4( diffuse, opacity );',
          `
          // Holographic stripes
          float stripes = mod((vWorldPosition.y - uTime * 0.02) * 20.0, 1.0);
          stripes = pow(stripes, 3.0);
          
          // Fresnel effect
          vec3 viewDirection = normalize(vWorldPosition - cameraPosition);
          vec3 worldNormal = normalize(vNormal);
          if (!gl_FrontFacing) worldNormal *= -1.0;
          float fresnel = dot(viewDirection, worldNormal) + 1.0;
          fresnel = pow(fresnel, 2.0);
          
          // Falloff
          float falloff = smoothstep(0.8, 0.0, fresnel);
          
          // HEIGHT-BASED INTENSITY GRADIENT
          // Face/hair (upper) = less holographic, body (lower) = more holographic
          float heightFade = smoothstep(uUpperThreshold, uLowerThreshold, vWorldPosition.y);
          float intensityMultiplier = mix(uFaceIntensity, uBodyIntensity, heightFade);
          
          // Holographic combination
          float holographic = stripes * fresnel;
          holographic += fresnel * 1.25;
          holographic *= falloff;
          holographic *= intensityMultiplier;  // Apply height gradient
          
          vec4 diffuseColor = vec4(uColor, holographic);
          `
        );

        // Store shader for updates
        mat.userData.holographicShader = shader;
        console.log(`✅ Shader stored for material: ${mat.name || 'unnamed'}`);
      };

      holographicMaterials.push(mat);
      
      // CRITICAL: Force shader recompilation
      console.log(`🔧 Applying holographic to: ${mat.name || 'unnamed'}`);
      console.log(`  • Has existing program: ${!!mat.program}`);
      console.log(`  • Current version: ${mat.version}`);
      console.log(`  • onBeforeCompile type: ${typeof mat.onBeforeCompile}`);
      console.log(`  • userData.holographicShader exists: ${!!mat.userData.holographicShader}`);
      
      // 1. Dispose existing program
      if (mat.program) {
        console.log(`  🗑️  Disposing existing shader program`);
        mat.program = null;
      }
      
      // 2. Increment version to invalidate cached program
      if (mat.version !== undefined) {
        mat.version++;
        console.log(`  📈 Incremented version to: ${mat.version}`);
      }
      
      // 3. Force material update
      mat.needsUpdate = true;
      console.log(`  ✅ Material configured (will compile on next render)`);
    }
  });

  console.log(`📦 Total materials with holographic effect: ${holographicMaterials.length}`);

  // Store references for updates and restoration
  (head as any)._holographicMaterials = holographicMaterials;
  (head as any)._originalMaterials = originalMaterials;
  (head as any)._holographicApplied = true;
  (head as any)._holographicColor = color;

  // CRITICAL: Force immediate shader compilation
  console.log('🔄 Forcing shader compilation...');
  
  // Mark all materials as needing shader recompilation
  holographicMaterials.forEach((mat: any) => {
    mat.needsUpdate = true;
  });

  // FORCE the renderer to dispose of ALL cached programs
  // This ensures Three.js will call onBeforeCompile on next render
  if (head.renderer && head.renderer.info && head.renderer.info.programs) {
    const programsCount = head.renderer.info.programs.length;
    console.log(`🧹 Clearing ${programsCount} cached programs from renderer`);
    
    // Clear all cached programs to force full recompilation
    head.renderer.info.programs.length = 0;
  }

  // Traverse all meshes and mark them for update
  armature.traverse((child: any) => {
    if (child.isMesh) {
      // Force the mesh to be re-rendered
      if (child.geometry && child.geometry.attributes.position) {
        child.geometry.attributes.position.needsUpdate = true;
      }
    }
  });

  // Setup animation loop - it will start updating uniforms once shaders compile
  setupAnimationLoop(head);

  console.log('✨ Holographic shader effect applied (animations preserved)');
}

/**
 * Setup animation loop to update shader time
 * Uses a shared clock to avoid creating multiple animation loops
 */
function setupAnimationLoop(head: any): void {
  // Cancel any existing animation loop
  if ((head as any)._holographicAnimationId) {
    cancelAnimationFrame((head as any)._holographicAnimationId);
    (head as any)._holographicAnimationId = null;
  }

  // Create or reuse clock (keep continuous time)
  if (!(head as any)._holographicClock) {
    (head as any)._holographicClock = new (window as any).THREE.Clock();
    (head as any)._holographicClock.start(); // Ensure clock is running
  }

  const clock = (head as any)._holographicClock;

  function animate() {
    // Check if holographic is still enabled
    if (!(head as any)._holographicApplied) {
      (head as any)._holographicAnimationId = null;
      console.log('⏹️  Holographic animation stopped (effect disabled)');
      return;
    }

    const elapsedTime = clock.getElapsedTime();
    const materials = (head as any)._holographicMaterials;
    
    if (materials && materials.length > 0) {
      let updatedCount = 0;
      let notCompiledCount = 0;
      
      materials.forEach((mat: any) => {
        // Check if shader is compiled
        if (mat.userData.holographicShader && mat.userData.holographicShader.uniforms && mat.userData.holographicShader.uniforms.uTime) {
          mat.userData.holographicShader.uniforms.uTime.value = elapsedTime;
          updatedCount++;
        } else {
          notCompiledCount++;
        }
      });
      
      // Debug log every 60 frames (once per second at 60fps)
      if (Math.floor(elapsedTime * 60) % 60 === 0) {
        if (notCompiledCount > 0) {
          console.log(`🎬 Holographic animation: ${updatedCount}/${materials.length} materials updated, ${notCompiledCount} waiting for shader compilation (time: ${elapsedTime.toFixed(2)}s)`);
        } else {
          console.log(`🎬 Holographic animation running (${updatedCount}/${materials.length} materials, time: ${elapsedTime.toFixed(2)}s)`);
        }
      }
    }
    
    (head as any)._holographicAnimationId = requestAnimationFrame(animate);
  }

  console.log('▶️  Starting holographic animation loop');
  animate();
}

/**
 * Update holographic material color
 */
export function updateHolographicColor(head: any, color: string): void {
  const holographicMaterials = (head as any)._holographicMaterials;
  if (!holographicMaterials) {
    console.warn('Holographic materials not found');
    return;
  }

  const THREE = (window as any).THREE;
  if (!THREE) return;

  const newColor = new THREE.Color(color);
  
  holographicMaterials.forEach((material: any) => {
    if (material.userData.holographicShader) {
      material.userData.holographicShader.uniforms.uColor.value = newColor;
    }
  });
}

/**
 * Restore original materials
 */
function restoreOriginalMaterials(head: any): void {
  // FIRST: Stop the animation loop immediately
  if ((head as any)._holographicAnimationId) {
    cancelAnimationFrame((head as any)._holographicAnimationId);
    (head as any)._holographicAnimationId = null;
  }

  const originalMaterials = (head as any)._originalMaterials;
  if (!originalMaterials) return;

  const armature = head.armature;
  if (!armature) return;

  // Get renderer to clear its program cache
  const renderer = head.renderer;
  const THREE = (window as any).THREE;

  // CRITICAL: Clear ALL renderer programs BEFORE restoring materials
  if (renderer && renderer.info && renderer.info.programs) {
    const programsCount = renderer.info.programs.length;
    console.log(`🧹 Clearing ${programsCount} cached programs during restoration`);
    renderer.info.programs.length = 0;
  }

  armature.traverse((child: any) => {
    if (child.isMesh && originalMaterials.has(child.uuid)) {
      const orig = originalMaterials.get(child.uuid);
      const mat = child.material;
      
      // CRITICAL: Properly dispose the WebGL program and force recompilation
      console.log(`🔄 Restoring material: ${mat.name || 'unnamed'}, has program: ${!!mat.program}`);
      
      // 1. Clear the shader reference FIRST
      delete mat.userData.holographicShader;
      
      // 2. Restore original callbacks and cache key
      mat.onBeforeCompile = orig.onBeforeCompile;
      mat.customProgramCacheKey = orig.customProgramCacheKey;
      
      // 3. Dispose the program to force recompilation
      if (mat.program) {
        console.log(`  🗑️  Disposing program for: ${mat.name || 'unnamed'}`);
        mat.program = null;
      }
      
      // 4. Restore original material properties
      mat.transparent = orig.transparent;
      mat.side = orig.side;
      mat.depthWrite = orig.depthWrite;
      mat.blending = orig.blending;
      
      // 5. Increment version to invalidate Three.js cache
      if (mat.version !== undefined) {
        mat.version++;
        console.log(`  📈 Incremented version to: ${mat.version}`);
      }
      
      // 6. Force material update
      mat.needsUpdate = true;
      
      console.log(`  ✅ Material restored: ${mat.name || 'unnamed'}`);
    }
  });

  // Clean up references (keep clock for smooth re-enabling)
  delete (head as any)._holographicMaterials;
  delete (head as any)._originalMaterials;
  delete (head as any)._holographicApplied;
  delete (head as any)._holographicColor;
  // NOTE: Keeping _holographicClock to maintain continuous time

  console.log('✓ Original materials restored');
}

/**
 * Disable holographic effect
 */
export function disableHolographicEffect(head: any): void {
  // Cancel animation loop
  if ((head as any)._holographicAnimationId) {
    cancelAnimationFrame((head as any)._holographicAnimationId);
    delete (head as any)._holographicAnimationId;
  }

  // Restore original materials
  restoreOriginalMaterials(head);
}

/**
 * Check if holographic effect is enabled
 */
export function isHolographicEnabled(head: any): boolean {
  return !!(head as any)._holographicMaterials;
}

