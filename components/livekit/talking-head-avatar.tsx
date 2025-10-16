'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useTalkingHead, type AvatarOptions } from '@/hooks/useTalkingHead';
import { cn } from '@/lib/utils';

interface TalkingHeadAvatarProps {
  avatarUrl?: string;
  className?: string;
  onAvatarLoaded?: () => void;
  onError?: (error: string) => void;
  enableControls?: boolean;
  holographic?: {
    enabled?: boolean;
    color?: string;
    excludeMeshNames?: string[];
    excludeMaterialNames?: string[];
  };
  onHolographicChange?: (enabled: boolean, color: string) => void;
  disableSidebarHolographicControls?: boolean;
}

export function TalkingHeadAvatar({
  avatarUrl = '/aiman.glb',
  className,
  onAvatarLoaded,
  onError,
  enableControls = false,
  holographic,
  onHolographicChange,
  disableSidebarHolographicControls = false,
}: TalkingHeadAvatarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { head, isLoading, isAvatarLoaded, error, loadAvatar, setHolographic } = useTalkingHead(
    containerRef,
    {
      lipsyncModules: ['en'],
      cameraView: 'full',
      holographic,
    }
  );

  const [currentView, setCurrentView] = useState<'full' | 'mid' | 'upper' | 'head'>('full');
  const [currentMood, setCurrentMood] = useState<
    'neutral' | 'happy' | 'sad' | 'angry' | 'fear' | 'love'
  >('neutral');
  const [isHolographic, setIsHolographic] = useState(holographic?.enabled || false);
  const [holographicColor, setHolographicColor] = useState(holographic?.color || '#70c1ff');
  const [isTogglingHolographic, setIsTogglingHolographic] = useState(false);

  // Load avatar when head instance is ready
  useEffect(() => {
    if (!head || isAvatarLoaded) return;

    const avatarOptions: AvatarOptions = {
      url: avatarUrl,
      body: 'M',
      avatarMood: 'neutral',
      ttsLang: 'en-GB',
      ttsVoice: 'en-GB-Standard-C',
      lipsyncLang: 'en',
    };

    loadAvatar(avatarOptions);
  }, [head, isAvatarLoaded, avatarUrl, loadAvatar]);

  // Handle avatar loaded callback
  useEffect(() => {
    if (isAvatarLoaded && onAvatarLoaded) {
      onAvatarLoaded();
    }
  }, [isAvatarLoaded, onAvatarLoaded]);

  // Handle error callback
  useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  // Expose head instance for parent components
  useEffect(() => {
    if (head && isAvatarLoaded) {
      // Store head instance on window for easy access (optional)
      (window as any).talkingHead = head;
    }
  }, [head, isAvatarLoaded]);

  const handleViewChange = (view: 'full' | 'mid' | 'upper' | 'head') => {
    if (head) {
      head.setView(view);
      setCurrentView(view);
    }
  };

  const handleMoodChange = (mood: 'neutral' | 'happy' | 'sad' | 'angry' | 'fear' | 'love') => {
    if (head) {
      head.setMood(mood);
      setCurrentMood(mood);
    }
  };

  const handleGesture = (gesture: string) => {
    if (head) {
      head.playGesture(gesture, 3);
    }
  };

  const handleHolographicToggle = () => {
    // Prevent rapid toggling
    if (isTogglingHolographic) return;
    
    setIsTogglingHolographic(true);
    const newState = !isHolographic;
    setIsHolographic(newState);
    
    // Notify parent component
    if (onHolographicChange) {
      onHolographicChange(newState, holographicColor);
    }
    
    // Add small delay to allow material compilation
    setTimeout(() => {
      setHolographic(
        newState, 
        holographicColor,
        holographic?.excludeMeshNames,
        holographic?.excludeMaterialNames
      );
      
      // Re-enable toggling after a short delay
      setTimeout(() => {
        setIsTogglingHolographic(false);
      }, 300);
    }, 50);
  };

  const handleHolographicColorChange = (newColor: string) => {
    setHolographicColor(newColor);
    
    // Notify parent component
    if (onHolographicChange) {
      onHolographicChange(isHolographic, newColor);
    }
    
    if (isHolographic) {
      setHolographic(
        true, 
        newColor,
        holographic?.excludeMeshNames,
        holographic?.excludeMaterialNames
      );
    }
  };
  
  // Expose controls to parent
  useEffect(() => {
    if (head && isAvatarLoaded) {
      (window as any).talkingHeadHolographicControls = {
        toggle: handleHolographicToggle,
        setColor: handleHolographicColorChange,
        isEnabled: isHolographic,
        color: holographicColor,
        isToggling: isTogglingHolographic,
      };
    }
  }, [head, isAvatarLoaded, isHolographic, holographicColor, isTogglingHolographic]);

  return (
    <div className={cn('relative h-full w-full', className)}>
      {/* Avatar Container */}
      <div
        ref={containerRef}
        className={cn(
          'h-full w-full bg-gradient-to-br from-gray-900 to-gray-800',
          isLoading && 'opacity-50'
        )}
      />

      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
            <p className="text-lg text-white">
              {isAvatarLoaded ? 'Initializing...' : 'Loading Avatar...'}
            </p>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70">
          <div className="max-w-md rounded-lg bg-red-900/90 p-6 text-center">
            <p className="mb-2 text-xl font-bold text-white">Error</p>
            <p className="text-red-100">{error}</p>
          </div>
        </div>
      )}

      {/* Control Panel (Optional) */}
      {enableControls && isAvatarLoaded && !error && (
        <div className="absolute bottom-4 left-4 right-4 max-h-[60vh] overflow-y-auto rounded-lg bg-black/70 p-4 backdrop-blur-sm">
          {/* View Controls */}
          <div className="mb-3">
            <p className="mb-2 text-xs font-semibold text-white/70">Camera View</p>
            <div className="grid grid-cols-4 gap-2">
              {(['full', 'mid', 'upper', 'head'] as const).map((view) => (
                <button
                  key={view}
                  onClick={() => handleViewChange(view)}
                  className={cn(
                    'rounded px-3 py-1.5 text-xs font-medium transition-colors',
                    currentView === view
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  )}
                >
                  {view.charAt(0).toUpperCase() + view.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Mood Controls */}
          <div className="mb-3">
            <p className="mb-2 text-xs font-semibold text-white/70">Mood</p>
            <div className="grid grid-cols-3 gap-2">
              {(['neutral', 'happy', 'sad', 'angry', 'fear', 'love'] as const).map((mood) => (
                <button
                  key={mood}
                  onClick={() => handleMoodChange(mood)}
                  className={cn(
                    'rounded px-3 py-1.5 text-xs font-medium transition-colors',
                    currentMood === mood
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  )}
                >
                  {mood.charAt(0).toUpperCase() + mood.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Gesture Controls */}
          <div className="mb-3">
            <p className="mb-2 text-xs font-semibold text-white/70">Gestures</p>
            <div className="grid grid-cols-3 gap-2">
              {['handup', 'thumbup', 'ok', 'index', 'shrug', 'thumbdown'].map((gesture) => (
                <button
                  key={gesture}
                  onClick={() => handleGesture(gesture)}
                  className="rounded bg-gray-700 px-3 py-1.5 text-xs font-medium text-gray-300 transition-colors hover:bg-gray-600"
                >
                  {gesture.charAt(0).toUpperCase() + gesture.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Holographic Controls - Hidden if disabled */}
          {!disableSidebarHolographicControls && (
            <div>
              <p className="mb-2 text-xs font-semibold text-white/70">Holographic Effect</p>
              <div className="space-y-2">
                <button
                  onClick={handleHolographicToggle}
                  disabled={isTogglingHolographic}
                  className={cn(
                    'w-full rounded px-3 py-2 text-xs font-medium transition-colors',
                    isTogglingHolographic && 'cursor-not-allowed opacity-50',
                    isHolographic
                      ? 'bg-cyan-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  )}
                >
                  {isTogglingHolographic 
                    ? '⏳ Processing...' 
                    : isHolographic 
                      ? '✨ Holographic ON' 
                      : 'Holographic OFF'
                  }
                </button>
                {isHolographic && (
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-white/70">Color:</label>
                    <input
                      type="color"
                      value={holographicColor}
                      onChange={(e) => handleHolographicColorChange(e.target.value)}
                      className="h-8 w-full cursor-pointer rounded border border-gray-600 bg-gray-700"
                    />
                    <span className="text-xs text-white/70">{holographicColor}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

