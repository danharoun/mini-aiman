'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useTalkingHead } from '@/hooks/useTalkingHead';
import { useTalkingHeadTranscription } from '@/hooks/useTalkingHeadTranscription';
import { applyHolographicMaterial, disableHolographicEffect, updateHolographicColor } from '@/lib/holographic-material';
import { getQualitySettings, type QualityLevel } from '@/lib/quality-settings';
import { cn } from '@/lib/utils';

interface TalkingHeadTileProps {
  className?: string;
  avatarUrl?: string;
  cameraView?: 'full' | 'mid' | 'upper' | 'head';
  onHeadReady?: (head: any) => void;
}

/**
 * A tile component that displays the TalkingHead 3D avatar
 * Integrates with LiveKit voice assistant for reactive animations and lip-sync
 */
export function TalkingHeadTile({
  className,
  avatarUrl = '/aiman.glb',
  cameraView = 'full',
  onHeadReady,
}: TalkingHeadTileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHolographic, setIsHolographic] = useState(false); // START IN NORMAL MODE (not holographic)
  const [holographicColor, setHolographicColor] = useState('#70c1ff');
  const [isToggling, setIsToggling] = useState(false);

  const { head, isLoading, isAvatarLoaded, error, loadAvatar, adjustLighting } = useTalkingHead(containerRef, {
    lipsyncModules: ['en'],
    cameraView: 'full', // Start with full view
  });

  // Integrate with LiveKit transcriptions for lip-sync
  useTalkingHeadTranscription({ head, enabled: isAvatarLoaded });

  // Holographic toggle handler with quality-based optimization
  const handleHolographicToggle = useCallback(async () => {
    if (!head || !isAvatarLoaded || isToggling) return;
    
    setIsToggling(true);
    console.log('🎨 Toggling holographic:', !isHolographic);
    
    try {
      if (!isHolographic) {
        // Get quality-based settings
        const qualitySettings = getQualitySettings();
        const { holographic } = qualitySettings;
        
        console.log('📱 Quality settings:', qualitySettings);
        
        // Enable holographic with quality-optimized settings
        applyHolographicMaterial(head, {
          color: holographicColor,
          enabled: true,
          excludeMeshNames: [],
          excludeMaterialNames: ['mask', 'eyes', 'teeth'],
          faceIntensity: holographic.faceIntensity,
          bodyIntensity: holographic.bodyIntensity,
          upperThreshold: 1.3,
          lowerThreshold: 0.3,
          glitchIntensity: holographic.enableGlitch ? holographic.glitchIntensity : 0,
          glitchFrequency: holographic.glitchFrequency,
          stripeCount: holographic.stripeCount,
        });
        setIsHolographic(true);
      } else {
        // Disable holographic
        disableHolographicEffect(head);
        setIsHolographic(false);
      }
    } catch (error) {
      console.error('❌ Error toggling holographic:', error);
    } finally {
      setTimeout(() => setIsToggling(false), 500);
    }
  }, [head, isAvatarLoaded, isHolographic, holographicColor, isToggling]);

  // Holographic color change handler
  const handleHolographicColorChange = useCallback((newColor: string) => {
    if (!head || !isAvatarLoaded || !isHolographic) return;
    
    console.log('🎨 Changing holographic color to:', newColor);
    setHolographicColor(newColor);
    updateHolographicColor(head, newColor);
  }, [head, isAvatarLoaded, isHolographic]);

  // Expose holographic and lighting controls globally
  React.useEffect(() => {
    if (head && isAvatarLoaded) {
      (window as any).talkingHeadControls = {
        holographic: {
          toggle: handleHolographicToggle,
          setColor: handleHolographicColorChange,
          isEnabled: isHolographic,
          color: holographicColor,
          isToggling,
        },
        lighting: {
          adjust: (options: {
            directionalIntensity?: number;
            ambientIntensity?: number;
            pointIntensity?: number;
            exposure?: number;
          }) => {
            if (adjustLighting) {
              adjustLighting(options);
            }
          },
        },
      };
      
      console.log('🌐 Holographic and lighting controls exposed globally');
    }
  }, [head, isAvatarLoaded, handleHolographicToggle, handleHolographicColorChange, isHolographic, holographicColor, isToggling, adjustLighting]);

  // Notify parent when head instance is ready
  React.useEffect(() => {
    if (head && isAvatarLoaded && onHeadReady) {
      onHeadReady(head);
    }
  }, [head, isAvatarLoaded, onHeadReady]);

  // Debug logging
  React.useEffect(() => {
    console.log('🎭 TalkingHeadTile state:', {
      hasHead: !!head,
      isLoading,
      isAvatarLoaded,
      error,
      cameraView,
    });
  }, [head, isLoading, isAvatarLoaded, error, cameraView]);

  // Update camera view when prop changes
  React.useEffect(() => {
    if (head && isAvatarLoaded) {
      console.log('📷 Setting camera view to:', cameraView);
      head.setView(cameraView);
    }
  }, [head, isAvatarLoaded, cameraView]);

  // Load avatar when head instance is ready
  React.useEffect(() => {
    if (!head || isAvatarLoaded) return;

    import('@/lib/talkinghead-config').then(({ getAvatarConfig, getTTSConfig }) => {
      const avatarConfig = getAvatarConfig();
      const ttsConfig = getTTSConfig();

      loadAvatar({
        url: avatarUrl,
        body: avatarConfig.body,
        avatarMood: avatarConfig.defaultMood,
        ttsLang: ttsConfig.language,
        ttsVoice: ttsConfig.voice,
        lipsyncLang: ttsConfig.lipsyncLang,
      });
    });
  }, [head, isAvatarLoaded, avatarUrl, loadAvatar]);

  // DON'T auto-apply holographic - start in NORMAL mode
  React.useEffect(() => {
    if (head && isAvatarLoaded) {
      console.log('✅ Avatar loaded in NORMAL mode (holographic disabled)');
      // User can manually enable holographic via the toggle button
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAvatarLoaded]);

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg bg-gradient-to-br from-gray-900 to-gray-800',
        className
      )}
    >
      {/* Avatar Container */}
      <div ref={containerRef} className="h-full w-full" />

      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="flex flex-col items-center space-y-2">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
            <p className="text-xs text-white">Loading...</p>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-900/80 backdrop-blur-sm">
          <div className="max-w-[200px] text-center">
            <p className="text-xs text-red-100">{error}</p>
          </div>
        </div>
      )}

      {/* Avatar Loaded Indicator (optional) */}
      {isAvatarLoaded && !error && (
        <div className="pointer-events-none absolute bottom-2 right-2">
          <div className="rounded-full bg-green-500 p-1">
            <div className="h-2 w-2 rounded-full bg-white" />
          </div>
        </div>
      )}
    </div>
  );
}

