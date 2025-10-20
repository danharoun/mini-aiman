/**
 * Quality settings presets for different devices and user preferences
 */

export type QualityLevel = 'ultra-low' | 'low' | 'medium' | 'high' | 'ultra';

export interface QualitySettings {
  // Renderer
  pixelRatio: number;
  antialias: boolean;
  shadowMapEnabled: boolean;
  powerPreference: 'low-power' | 'default' | 'high-performance';
  
  // Holographic
  holographic: {
    faceIntensity: number;
    bodyIntensity: number;
    enableGlitch: boolean;
    glitchIntensity: number; // 0.0 - 1.0
    glitchFrequency: number; // Lower = smoother
    stripeCount: number; // Lower = less detail
  };
  
  // Performance
  targetFPS: number;
  reducedMotion: boolean;
}

/**
 * Quality presets
 */
export const QUALITY_PRESETS: Record<QualityLevel, QualitySettings> = {
  'ultra-low': {
    // 2GB RAM devices
    pixelRatio: 0.75,
    antialias: false,
    shadowMapEnabled: false,
    powerPreference: 'low-power',
    holographic: {
      faceIntensity: 0.05, // Barely visible
      bodyIntensity: 0.3,
      enableGlitch: false, // No glitch at all
      glitchIntensity: 0,
      glitchFrequency: 0,
      stripeCount: 10, // Half the stripes
    },
    targetFPS: 30,
    reducedMotion: true,
  },
  
  'low': {
    // 4GB RAM low-end devices
    pixelRatio: 1.0,
    antialias: false,
    shadowMapEnabled: false,
    powerPreference: 'low-power',
    holographic: {
      faceIntensity: 0.1,
      bodyIntensity: 0.5,
      enableGlitch: true,
      glitchIntensity: 0.15, // Very subtle
      glitchFrequency: 0.5, // Very slow
      stripeCount: 15,
    },
    targetFPS: 45,
    reducedMotion: false,
  },
  
  'medium': {
    // 6GB RAM mid-range devices - ULTRA OPTIMIZED
    pixelRatio: 1.5,
    antialias: true,
    shadowMapEnabled: false,
    powerPreference: 'default',
    holographic: {
      faceIntensity: 0.4, // Visible but light
      bodyIntensity: 0.9, // Strong body effect
      enableGlitch: true,
      glitchIntensity: 0.12, // Very light glitch (was 0.18)
      glitchFrequency: 0.5, // Slow animation (was 0.8)
      stripeCount: 12, // Fewer stripes (was 15)
    },
    targetFPS: 60,
    reducedMotion: false,
  },
  
  'high': {
    // 8GB+ RAM high-end mobile
    pixelRatio: 2.0,
    antialias: true,
    shadowMapEnabled: false,
    powerPreference: 'high-performance',
    holographic: {
      faceIntensity: 0.2,
      bodyIntensity: 0.9,
      enableGlitch: true,
      glitchIntensity: 0.35, // Strong
      glitchFrequency: 1.5, // Fast
      stripeCount: 20,
    },
    targetFPS: 60,
    reducedMotion: false,
  },
  
  'ultra': {
    // Desktop / Gaming phones
    pixelRatio: 2.0,
    antialias: true,
    shadowMapEnabled: true,
    powerPreference: 'high-performance',
    holographic: {
      faceIntensity: 0.2,
      bodyIntensity: 1.0,
      enableGlitch: true,
      glitchIntensity: 0.5, // Full effect
      glitchFrequency: 2.0, // Full speed
      stripeCount: 25, // Extra detail
    },
    targetFPS: 60,
    reducedMotion: false,
  },
};

/**
 * Auto-detect recommended quality level based on device
 */
export function detectRecommendedQuality(): QualityLevel {
  if (typeof window === 'undefined') return 'medium';
  
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  const cores = navigator.hardwareConcurrency || 4;
  const memory = (navigator as any).deviceMemory || 4; // GB
  const pixelRatio = window.devicePixelRatio || 1;
  
  // Ultra-low: 2GB RAM or less
  if (memory <= 2) {
    console.log('🔴 2GB RAM detected → Recommended: ULTRA-LOW quality');
    return 'ultra-low';
  }
  
  // Low: 3-4GB RAM or < 4 cores
  if (memory <= 4 || cores < 4) {
    console.log('🟡 Low-end device detected → Recommended: LOW quality');
    return 'low';
  }
  
  // Medium: Mobile with 4-6GB RAM
  if (isMobile && memory <= 6) {
    console.log('🟢 Mid-range device detected → Recommended: MEDIUM quality');
    return 'medium';
  }
  
  // High: Mobile with 8GB+ or desktop
  if ((isMobile && memory > 6) || (!isMobile && memory <= 8)) {
    console.log('🔵 High-end device detected → Recommended: HIGH quality');
    return 'high';
  }
  
  // Ultra: Gaming desktop
  console.log('💎 Ultra device detected → Recommended: ULTRA quality');
  return 'ultra';
}

/**
 * Get quality settings from local storage or use MEDIUM as default
 */
export function getCurrentQuality(): QualityLevel {
  if (typeof window === 'undefined') return 'medium';
  
  const stored = localStorage.getItem('qualityLevel');
  if (stored && stored in QUALITY_PRESETS) {
    console.log(`⚙️  Using saved quality: ${stored.toUpperCase()}`);
    return stored as QualityLevel;
  }
  
  // Default to MEDIUM quality on first load (not auto-detect)
  console.log('⚙️  First load → Using MEDIUM quality by default');
  return 'medium';
}

/**
 * Save quality preference
 */
export function saveQualityPreference(quality: QualityLevel): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('qualityLevel', quality);
  console.log(`💾 Quality saved: ${quality.toUpperCase()}`);
}

/**
 * Get quality settings for current device
 */
export function getQualitySettings(quality?: QualityLevel): QualitySettings {
  const level = quality || getCurrentQuality();
  const settings = QUALITY_PRESETS[level];
  
  console.log(`⚙️  Active quality: ${level.toUpperCase()}`, settings);
  
  return settings;
}

/**
 * Quality level descriptions for UI
 */
export const QUALITY_DESCRIPTIONS: Record<QualityLevel, string> = {
  'ultra-low': '2GB RAM - Minimal (30 FPS, no glitch)',
  'low': '4GB RAM - Basic (45 FPS, subtle glitch)',
  'medium': '6GB RAM - Balanced (60 FPS, smooth)',
  'high': '8GB+ RAM - Quality (60 FPS, full effects)',
  'ultra': 'Desktop - Maximum (60 FPS, all features)',
};

