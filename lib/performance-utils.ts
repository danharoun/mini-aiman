/**
 * Performance utilities for mobile optimization
 */

export interface DeviceCapabilities {
  isMobile: boolean;
  isLowEnd: boolean;
  pixelRatio: number;
  cores: number;
  memory?: number;
}

/**
 * Detect device capabilities
 */
export function detectDeviceCapabilities(): DeviceCapabilities {
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  
  // Detect low-end devices
  const cores = navigator.hardwareConcurrency || 4;
  const memory = (navigator as any).deviceMemory || 4; // GB
  const pixelRatio = window.devicePixelRatio || 1;
  
  // Low-end if: few cores, low memory, or old Android
  const isLowEnd = cores < 4 || memory < 4 || (isMobile && pixelRatio < 2);
  
  return {
    isMobile,
    isLowEnd,
    pixelRatio: Math.min(pixelRatio, isLowEnd ? 1.5 : 2), // Cap pixel ratio
    cores,
    memory,
  };
}

/**
 * Get optimized renderer settings
 */
export function getRendererSettings(capabilities: DeviceCapabilities) {
  if (capabilities.isLowEnd) {
    return {
      antialias: false,
      powerPreference: 'low-power' as const,
      pixelRatio: 1,
      shadowMapEnabled: false,
      maxLights: 2,
    };
  }
  
  if (capabilities.isMobile) {
    return {
      antialias: true,
      powerPreference: 'default' as const,
      pixelRatio: 1.5,
      shadowMapEnabled: false,
      maxLights: 3,
    };
  }
  
  // Desktop - full quality
  return {
    antialias: true,
    powerPreference: 'high-performance' as const,
    pixelRatio: 2,
    shadowMapEnabled: true,
    maxLights: 4,
  };
}

/**
 * Apply performance optimizations to TalkingHead instance
 */
export function optimizeTalkingHead(head: any, capabilities: DeviceCapabilities, qualitySettings?: any) {
  if (!head || !head.renderer) return;
  
  console.log('📱 Device capabilities:', capabilities);
  
  try {
    const settings = qualitySettings || getRendererSettings(capabilities);
    
    // Set pixel ratio (lower = better performance)
    if (head.renderer.setPixelRatio) {
      head.renderer.setPixelRatio(settings.pixelRatio);
      console.log(`✅ Pixel ratio set to: ${settings.pixelRatio}`);
    }
    
    // Disable shadows on mobile (expensive)
    if (head.renderer.shadowMap && !settings.shadowMapEnabled) {
      head.renderer.shadowMap.enabled = false;
      console.log('✅ Shadows disabled');
    }
    
    // Reduce render resolution for ultra-low devices
    if (settings.pixelRatio < 1.0 && head.renderer.domElement) {
      const canvas = head.renderer.domElement;
      const width = Math.floor(canvas.width * settings.pixelRatio);
      const height = Math.floor(canvas.height * settings.pixelRatio);
      head.renderer.setSize(width, height, false);
      console.log(`✅ Render resolution reduced to: ${width}x${height}`);
    }
    
    // Set power preference
    const context = head.renderer.getContext();
    if (context && context.powerPreference !== settings.powerPreference) {
      console.log(`💡 Power preference: ${settings.powerPreference}`);
    }
    
    console.log('✅ TalkingHead optimized for device');
  } catch (error) {
    console.error('❌ Error optimizing TalkingHead:', error);
  }
}

/**
 * Reduce holographic effect quality for performance
 */
export function getHolographicSettings(capabilities: DeviceCapabilities) {
  if (capabilities.isLowEnd) {
    return {
      faceIntensity: 0.15, // Lower opacity = less rendering work
      bodyIntensity: 0.6,
      enableGlitch: false, // Disable expensive glitch on low-end
    };
  }
  
  if (capabilities.isMobile) {
    return {
      faceIntensity: 0.2,
      bodyIntensity: 0.8,
      enableGlitch: true,
    };
  }
  
  // Desktop - full quality
  return {
    faceIntensity: 0.2,
    bodyIntensity: 1.0,
    enableGlitch: true,
  };
}

/**
 * Request low-power mode hints
 */
export function enablePowerSaving() {
  // Request reduced motion if supported
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    console.log('💡 Reduced motion preferred');
    return true;
  }
  
  // Battery API (experimental)
  if ('getBattery' in navigator) {
    (navigator as any).getBattery().then((battery: any) => {
      if (battery.level < 0.2 || battery.charging === false) {
        console.log('🔋 Low battery detected - enabling power saving');
        return true;
      }
    });
  }
  
  return false;
}

/**
 * Throttle animation frame rate on low-end devices
 */
export function createThrottledAnimationFrame(fps: number = 30) {
  const interval = 1000 / fps;
  let lastTime = 0;
  
  return (callback: FrameRequestCallback) => {
    return requestAnimationFrame((currentTime) => {
      if (currentTime - lastTime >= interval) {
        lastTime = currentTime;
        callback(currentTime);
      }
    });
  };
}

