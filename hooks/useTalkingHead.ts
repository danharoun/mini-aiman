'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { loadTalkingHead, getTalkingHead } from '@/lib/load-talkinghead';
import {
  applyHolographicMaterial,
  updateHolographicColor,
  disableHolographicEffect,
} from '@/lib/holographic-material';
import {
  detectDeviceCapabilities,
  optimizeTalkingHead,
} from '@/lib/performance-utils';
import { getQualitySettings } from '@/lib/quality-settings';

// TalkingHead types
export interface TalkingHeadOptions {
  ttsEndpoint?: string;
  ttsApikey?: string;
  lipsyncModules?: string[];
  cameraView?: 'full' | 'mid' | 'upper' | 'head';
  avatarMood?: 'neutral' | 'happy' | 'sad' | 'angry' | 'fear' | 'love';
  holographic?: {
    enabled?: boolean;
    color?: string;
  };
}

export interface AvatarOptions {
  url: string;
  body?: 'M' | 'F';
  avatarMood?: 'neutral' | 'happy' | 'sad' | 'angry' | 'fear' | 'love';
  ttsLang?: string;
  ttsVoice?: string;
  lipsyncLang?: string;
}

export interface TalkingHeadInstance {
  showAvatar: (options: AvatarOptions, onProgress?: (ev: ProgressEvent) => void) => Promise<void>;
  setView: (view: 'full' | 'mid' | 'upper' | 'head') => void;
  setMood: (mood: 'neutral' | 'happy' | 'sad' | 'angry' | 'fear' | 'love') => void;
  playPose: (pose: string, time?: number | null, duration?: number) => void;
  stopPose: () => void;
  playGesture: (gesture: string, duration?: number) => void;
  stopGesture: () => void;
  lookAtCamera: (duration?: number) => void;
  lookAhead: (duration?: number) => void;
  makeEyeContact: (duration?: number) => void;
  speakText: (text: string) => void;
  speakAudio: (audioBuffer: ArrayBuffer) => void;
  playAnimation: (
    url: string,
    onProgress?: (ev: ProgressEvent) => void,
    duration?: number,
    animIndex?: number,
    scale?: number
  ) => Promise<void>;
  stopAnimation: () => void;
  start: () => void;
  stop: () => void;
  streamStart: (
    options?: {
      sampleRate?: number;
      gain?: number;
      lipsyncLang?: string;
      lipsyncType?: 'visemes' | 'blendshapes' | 'words';
      waitForAudioChunks?: boolean;
      mood?: string;
    },
    onAudioStart?: () => void,
    onAudioEnd?: () => void,
    onSubtitles?: (text: string) => void,
    onMetrics?: (metrics: any) => void
  ) => void;
  streamAudio: (data: {
    audio?: ArrayBuffer;
    visemes?: string[];
    vtimes?: number[];
    vdurations?: number[];
    words?: string[];
    wtimes?: number[];
    wdurations?: number[];
  }) => void;
  streamNotifyEnd: () => void;
  streamInterrupt: () => void;
  streamStop: () => void;
  gestureTemplates: Record<string, any>;
}

interface UseTalkingHeadReturn {
  head: TalkingHeadInstance | null;
  isLoading: boolean;
  isAvatarLoaded: boolean;
  error: string | null;
  loadAvatar: (options: AvatarOptions) => Promise<void>;
  setHolographic: (enabled: boolean, color?: string, excludeMeshNames?: string[], excludeMaterialNames?: string[]) => void;
}

export function useTalkingHead(
  containerRef: React.RefObject<HTMLDivElement>,
  options: TalkingHeadOptions = {}
): UseTalkingHeadReturn {
  const [head, setHead] = useState<TalkingHeadInstance | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAvatarLoaded, setIsAvatarLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initRef = useRef(false);
  const holographicOptionsRef = useRef(options.holographic);

  // Initialize TalkingHead instance
  useEffect(() => {
    if (!containerRef.current || initRef.current) return;

    let mounted = true;
    initRef.current = true;

    const initializeTalkingHead = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Load TalkingHead library from CDN
        await loadTalkingHead();

        if (!mounted || !containerRef.current) return;

        // Get TalkingHead class
        const TalkingHead = getTalkingHead();

        const defaultOptions = {
          ttsEndpoint: 'https://eu-texttospeech.googleapis.com/v1beta1/text:synthesize',
          ttsApikey: options.ttsApikey || '',
          lipsyncModules: options.lipsyncModules || ['en'],
          cameraView: options.cameraView || 'full',
          ...options,
          // Force enable camera controls (must come after ...options)
          cameraRotateEnable: true,
          cameraPanEnable: true,
          cameraZoomEnable: true,
        };

        const instance = new TalkingHead(containerRef.current, defaultOptions);
        
        // Apply performance optimizations using quality settings
        const capabilities = detectDeviceCapabilities();
        const qualitySettings = getQualitySettings();
        optimizeTalkingHead(instance, capabilities, qualitySettings);
        
        setHead(instance);
      } catch (err) {
        console.error('Error initializing TalkingHead:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize TalkingHead');
      } finally {
        setIsLoading(false);
      }
    };

    initializeTalkingHead();

    return () => {
      mounted = false;
      if (head) {
        head.stop();
      }
    };
  }, [containerRef]);

  // Load avatar
  const loadAvatar = useCallback(
    async (avatarOptions: AvatarOptions) => {
      if (!head) {
        setError('TalkingHead not initialized');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        await head.showAvatar(avatarOptions, (ev) => {
          if (ev.lengthComputable) {
            const percent = Math.round((ev.loaded / ev.total) * 100);
            console.log(`Loading avatar: ${percent}%`);
          }
        });

        // Enhance gestures for 4-bone fingers (Aiman avatar)
        enhanceGesturesForAvatar(head);

        // Reduce scene lighting intensity for softer look (with delay to ensure nodeAvatar is ready)
        setTimeout(() => {
          reduceLightIntensity(head);
        }, 500);

        // Apply holographic effect if enabled
        if (holographicOptionsRef.current?.enabled) {
          applyHolographicMaterial(head, {
            enabled: true,
            color: holographicOptionsRef.current.color || '#70c1ff',
          });
        }

        setIsAvatarLoaded(true);
      } catch (err) {
        console.error('Error loading avatar:', err);
        setError(err instanceof Error ? err.message : 'Failed to load avatar');
      } finally {
        setIsLoading(false);
      }
    },
    [head]
  );

  // Set holographic effect
  const setHolographic = useCallback(
    (enabled: boolean, color?: string, excludeMeshNames?: string[], excludeMaterialNames?: string[]) => {
      if (!head || !isAvatarLoaded) return;

      if (enabled) {
        applyHolographicMaterial(head, {
          enabled: true,
          color: color || '#70c1ff',
          excludeMeshNames: excludeMeshNames || holographicOptionsRef.current?.excludeMeshNames,
          excludeMaterialNames: excludeMaterialNames || holographicOptionsRef.current?.excludeMaterialNames,
        });
      } else {
        disableHolographicEffect(head);
      }
    },
    [head, isAvatarLoaded]
  );

  return {
    head,
    isLoading,
    isAvatarLoaded,
    error,
    loadAvatar,
    setHolographic,
    adjustLighting: (options: {
      directionalIntensity?: number;
      ambientIntensity?: number;
      pointIntensity?: number;
      exposure?: number;
    }) => {
      if (head) {
        adjustSceneLighting(head, options);
      }
    },
  };
}

// Adjust scene lighting with custom parameters
function adjustSceneLighting(
  head: TalkingHeadInstance,
  options: {
    directionalIntensity?: number;
    ambientIntensity?: number;
    pointIntensity?: number;
    exposure?: number;
  } = {}
) {
  try {
    // Default values (very dim as before)
    const {
      directionalIntensity = 0.25,
      ambientIntensity = 0.35,
      pointIntensity = 0.25,
      exposure = 0.5,
    } = options;

    // Try multiple ways to access the scene
    let scene = null;
    
    if (head.nodeAvatar && head.nodeAvatar.parent) {
      scene = head.nodeAvatar.parent;
    } else if (head.armature && head.armature.parent) {
      scene = head.armature.parent;
    } else if (head.renderer && head.renderer.domElement) {
      console.log('🔍 Trying to find scene from renderer...');
      return; // Skip for now if nodeAvatar not ready
    }
    
    if (!scene) {
      console.warn('⚠️ Cannot adjust lighting: scene not found');
      return;
    }

    console.log('🔍 Scene found, adjusting lights...');
    
    // Store original intensities if not already stored
    if (!(head as any)._originalLightIntensities) {
      (head as any)._originalLightIntensities = new Map();
    }
    
    // Traverse scene to find and adjust lights
    scene.traverse((child: any) => {
      if (child.isLight) {
        // Store original intensity if not stored
        if (!(head as any)._originalLightIntensities.has(child.uuid)) {
          (head as any)._originalLightIntensities.set(child.uuid, child.intensity);
        }
        
        const originalIntensity = (head as any)._originalLightIntensities.get(child.uuid);
        
        // Apply intensity multiplier based on light type
        if (child.type === 'DirectionalLight') {
          child.intensity = originalIntensity * directionalIntensity;
        } else if (child.type === 'AmbientLight') {
          child.intensity = originalIntensity * ambientIntensity;
        } else if (child.type === 'PointLight' || child.type === 'SpotLight') {
          child.intensity = originalIntensity * pointIntensity;
        }
        
        console.log(`💡 ${child.type}: ${child.intensity.toFixed(2)}`);
      }
    });
    
    // Adjust renderer exposure
    if (head.renderer) {
      head.renderer.toneMappingExposure = exposure;
      console.log(`🎬 Renderer exposure: ${exposure}`);
    }
    
    console.log('🌙 Scene lighting adjusted');
  } catch (error) {
    console.error('❌ Error adjusting light intensity:', error);
  }
}

// Reduce scene light intensity for softer look (legacy function)
function reduceLightIntensity(head: TalkingHeadInstance) {
  adjustSceneLighting(head, {
    directionalIntensity: 0.25,
    ambientIntensity: 0.35,
    pointIntensity: 0.25,
    exposure: 0.5,
  });
}

// Enhance gestures for avatars with 4 finger bones
function enhanceGesturesForAvatar(head: TalkingHeadInstance) {
  if (!head.gestureTemplates) return;

  Object.keys(head.gestureTemplates).forEach((gestureName) => {
    const gesture = head.gestureTemplates[gestureName];
    const fingerBones = ['Thumb', 'Index', 'Middle', 'Ring', 'Pinky'];
    const hands = ['LeftHand', 'RightHand'];

    hands.forEach((hand) => {
      fingerBones.forEach((finger) => {
        const bone3 = `${hand}${finger}3.rotation`;
        const bone4 = `${hand}${finger}4.rotation`;

        if (gesture[bone3] && !gesture[bone4]) {
          // Copy bone 3 rotation to bone 4 (fingertip)
          gesture[bone4] = { ...gesture[bone3] };
        }
      });
    });
  });

  console.log('✓ Enhanced gestures for avatar with 4-bone fingers');
}

