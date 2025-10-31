'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  type AgentState,
  type ReceivedChatMessage,
  useRoomContext,
  useVoiceAssistant,
} from '@livekit/components-react';
import { toastAlert } from '@/components/alert-toast';
import { AgentControlBar } from '@/components/livekit/agent-control-bar/agent-control-bar';
import { ChatEntry } from '@/components/livekit/chat/chat-entry';
import { ChatMessageView } from '@/components/livekit/chat/chat-message-view';
import { MediaTiles } from '@/components/livekit/media-tiles';
import { TranscriptionDebug } from '@/components/livekit/transcription-debug';
import { AvatarAnimationControls } from '@/components/avatar-animation-controls';
import { PerformanceIndicator } from '@/components/performance-indicator';
import { QualitySelector } from '@/components/quality-selector';
import useChatAndTranscription from '@/hooks/useChatAndTranscription';
import { useDebugMode } from '@/hooks/useDebug';
import { useTalkingHead } from '@/hooks/useTalkingHead';
import type { AppConfig } from '@/lib/types';
import { cn } from '@/lib/utils';

function isAgentAvailable(agentState: AgentState) {
  return agentState == 'listening' || agentState == 'thinking' || agentState == 'speaking';
}

interface SessionViewProps {
  appConfig: AppConfig;
  disabled: boolean;
  sessionStarted: boolean;
}

export const SessionView = ({
  appConfig,
  disabled,
  sessionStarted,
  ref,
}: React.ComponentProps<'div'> & SessionViewProps) => {
  const { state: agentState } = useVoiceAssistant();
  const [chatOpen, setChatOpen] = useState(false);
  const [animControlsOpen, setAnimControlsOpen] = useState(false);
  const { messages, send } = useChatAndTranscription();
  const room = useRoomContext();
  
  // Get TalkingHead instance from MediaTiles via context or ref
  // We'll need to pass this down from MediaTiles
  const [headInstance, setHeadInstance] = useState<any>(null);

  // Debug: Log when headInstance changes
  useEffect(() => {
    console.log('🎭 headInstance updated:', !!headInstance);
    if (headInstance) {
      console.log('✅ headInstance is ready, animation controls should be visible');
    }
  }, [headInstance]);
  
  // UI visibility state
  const [showUI, setShowUI] = useState(false);
  
  // Control bar visibility (hidden by default on mobile)
  const [showControls, setShowControls] = useState(false);
  
  // Holographic state - START IN NORMAL MODE (OFF)
  const [isHolographic, setIsHolographic] = useState(false);
  const [holographicColor, setHolographicColor] = useState('#70c1ff');
  const [isToggling, setIsToggling] = useState(false);
  
  // Background color state
  const [bgColor, setBgColor] = useState('#000000');
  
  // Lighting controls state
  const [lightingOpen, setLightingOpen] = useState(false);
  const [directionalLight, setDirectionalLight] = useState(0.25); // 0-1 range
  const [ambientLight, setAmbientLight] = useState(0.35); // 0-1 range
  const [pointLight, setPointLight] = useState(0.25); // 0-1 range
  const [exposure, setExposure] = useState(0.5); // 0-2 range

  useDebugMode({
    enabled: process.env.NODE_END !== 'production',
  });

  async function handleSendMessage(message: string) {
    await send(message);
  }

  // Holographic handlers
  const handleHolographicToggle = async () => {
    if (isToggling) return;
    
    const controls = (window as any).talkingHeadControls;
    console.log('🎮 Holographic toggle clicked, controls:', controls);
    if (controls && controls.holographic && controls.holographic.toggle) {
      controls.holographic.toggle();
    } else {
      console.warn('⚠️ Holographic controls not ready yet');
    }
  };

  const handleHolographicColorChange = (newColor: string) => {
    const controls = (window as any).talkingHeadControls;
    console.log('🎨 Color change requested:', newColor, 'controls:', controls);
    if (controls && controls.holographic && controls.holographic.setColor) {
      controls.holographic.setColor(newColor);
    } else {
      console.warn('⚠️ Holographic controls not ready yet');
    }
  };

  const handleBgColorChange = (newColor: string) => {
    console.log('🎨 Background color change:', newColor);
    setBgColor(newColor);
    
    // Update THREE.js scene background if available
    if (headInstance && headInstance.renderer) {
      const THREE = (window as any).THREE;
      if (THREE) {
        headInstance.renderer.setClearColor(new THREE.Color(newColor));
        console.log('✅ Background color updated in THREE.js scene');
      }
    }
  };

  // Handle lighting adjustments
  const handleLightingChange = (type: 'directional' | 'ambient' | 'point' | 'exposure', value: number) => {
    console.log(`💡 Adjusting ${type} light to: ${value}`);
    
    const controls = (window as any).talkingHeadControls;
    if (controls && controls.lighting && controls.lighting.adjust) {
      const options: any = {
        directionalIntensity: directionalLight,
        ambientIntensity: ambientLight,
        pointIntensity: pointLight,
        exposure: exposure,
      };
      
      // Update the specific value
      if (type === 'directional') {
        setDirectionalLight(value);
        options.directionalIntensity = value;
      } else if (type === 'ambient') {
        setAmbientLight(value);
        options.ambientIntensity = value;
      } else if (type === 'point') {
        setPointLight(value);
        options.pointIntensity = value;
      } else if (type === 'exposure') {
        setExposure(value);
        options.exposure = value;
      }
      
      controls.lighting.adjust(options);
    }
  };

  // Listen for holographic state changes from window.talkingHeadControls
  useEffect(() => {
    const checkControls = setInterval(() => {
      const controls = (window as any).talkingHeadControls;
      if (controls && controls.holographic) {
        setIsHolographic(controls.holographic.isEnabled);
        setHolographicColor(controls.holographic.color);
        setIsToggling(controls.holographic.isToggling || false);
      }
    }, 100);

    return () => clearInterval(checkControls);
  }, []);

  // Set initial background color when head instance is ready
  useEffect(() => {
    if (headInstance && headInstance.renderer) {
      const THREE = (window as any).THREE;
      if (THREE) {
        headInstance.renderer.setClearColor(new THREE.Color(bgColor));
        console.log('✅ Initial background color set:', bgColor);
      }
    }
  }, [headInstance, bgColor]);

  useEffect(() => {
    if (sessionStarted) {
      const timeout = setTimeout(() => {
        if (!isAgentAvailable(agentState)) {
          const reason =
            agentState === 'connecting'
              ? 'Agent did not join the room. '
              : 'Agent connected but did not complete initializing. ';

          toastAlert({
            title: 'Session ended',
            description: (
              <p className="w-full">
                {reason}
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://docs.livekit.io/agents/start/voice-ai/"
                  className="whitespace-nowrap underline"
                >
                  See quickstart guide
                </a>
                .
              </p>
            ),
          });
          room.disconnect();
        }
      }, 20_000);

      return () => clearTimeout(timeout);
    }
  }, [agentState, sessionStarted, room]);

  const { supportsChatInput, supportsVideoInput, supportsScreenShare } = appConfig;
  const capabilities = {
    supportsChatInput,
    supportsVideoInput,
    supportsScreenShare,
  };

  return (
    <section
      ref={ref}
      inert={disabled}
      className="fixed inset-0 overflow-hidden"
    >
      {/* FULLSCREEN AVATAR - Always visible */}
      <MediaTiles 
        chatOpen={chatOpen} 
        useTalkingHead={true}
        onHeadInstanceReady={setHeadInstance}
      />

      {/* Performance Indicator - Mobile only (top-right) */}
      <PerformanceIndicator />

      {/* Chat Messages - Always visible when open */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            className="fixed left-0 top-0 bottom-0 z-[150] w-full max-w-md"
          >
            <ChatMessageView className="h-full px-3 pt-20 pb-40 overflow-y-auto">
              <div className="space-y-3 whitespace-pre-wrap backdrop-blur-xl bg-black/30 rounded-2xl p-4 border border-white/10">
                <AnimatePresence>
                  {messages.map((message: ReceivedChatMessage) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 1, height: 'auto', translateY: 0.001 }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    >
                      <ChatEntry hideName key={message.id} entry={message} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </ChatMessageView>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button - Small (bottom-right) */}
      <button
        onClick={() => setShowControls(!showControls)}
        className="fixed bottom-4 right-4 z-[200] rounded-full p-2 backdrop-blur-xl bg-black/60 border border-white/20 shadow-lg transition-all hover:scale-110 active:scale-95"
      >
        <span className="text-base">{showControls ? '✕' : '☰'}</span>
      </button>

      {/* Compact Control Bar - Slides up when visible */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-4 bottom-20 z-[150]"
          >
            <div className="backdrop-blur-xl bg-black/80 rounded-2xl p-3 border border-white/10 shadow-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex flex-col gap-3">
                {/* Quality Selector */}
                <div className="pb-2 border-b border-white/10">
                  <QualitySelector />
                </div>
                
                {/* Agent Controls */}
                <AgentControlBar
                  capabilities={capabilities}
                  onChatOpenChange={setChatOpen}
                  onSendMessage={handleSendMessage}
                />
                
                {/* Holographic Toggle */}
                <button
                  onClick={handleHolographicToggle}
                  disabled={isToggling}
                  className={cn(
                    'rounded-full px-4 py-2 text-sm font-medium transition-all duration-200',
                    isToggling && 'cursor-not-allowed opacity-50',
                    isHolographic
                      ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/50'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  )}
                >
                  <span className="mr-2">{isToggling ? '⏳' : isHolographic ? '✨' : '🔲'}</span>
                  {isHolographic ? 'Holographic ON' : 'Holographic OFF'}
                </button>

                {/* Color Pickers */}
                <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-white/70 min-w-[80px]">Holographic:</label>
                    <input
                      type="color"
                      value={holographicColor}
                      onChange={(e) => handleHolographicColorChange(e.target.value)}
                      className="w-12 h-8 rounded cursor-pointer bg-transparent border border-white/20"
                      disabled={isToggling}
                    />
                    <span className="text-xs text-white/50 font-mono">{holographicColor}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-white/70 min-w-[80px]">Background:</label>
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => handleBgColorChange(e.target.value)}
                      className="w-12 h-8 rounded cursor-pointer bg-transparent border border-white/20"
                    />
                    <span className="text-xs text-white/50 font-mono">{bgColor}</span>
                  </div>
                </div>

                {/* Lighting Controls */}
                <div className="pt-2 border-t border-white/10">
                  <button
                    onClick={() => setLightingOpen(!lightingOpen)}
                    className="w-full rounded-lg px-3 py-2 text-sm font-medium bg-gray-700/50 text-white hover:bg-gray-600/50 transition-all"
                  >
                    <span className="mr-2">{lightingOpen ? '🔽' : '▶️'}</span>
                    💡 Lighting Controls
                  </button>
                  
                  {lightingOpen && (
                    <div className="mt-2 space-y-3 px-2">
                      {/* Exposure - FIRST (most important) */}
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                          <label className="text-xs text-white/70 font-semibold">Exposure (Overall Brightness):</label>
                          <span className="text-xs text-white/50 font-mono">{exposure.toFixed(2)}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="2"
                          step="0.1"
                          value={exposure}
                          onChange={(e) => handleLightingChange('exposure', parseFloat(e.target.value))}
                          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      {/* Directional Light */}
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                          <label className="text-xs text-white/70">Directional:</label>
                          <span className="text-xs text-white/50 font-mono">{(directionalLight * 100).toFixed(0)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={directionalLight}
                          onChange={(e) => handleLightingChange('directional', parseFloat(e.target.value))}
                          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      {/* Ambient Light */}
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                          <label className="text-xs text-white/70">Ambient:</label>
                          <span className="text-xs text-white/50 font-mono">{(ambientLight * 100).toFixed(0)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={ambientLight}
                          onChange={(e) => handleLightingChange('ambient', parseFloat(e.target.value))}
                          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      {/* Point Light */}
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                          <label className="text-xs text-white/70">Point:</label>
                          <span className="text-xs text-white/50 font-mono">{(pointLight * 100).toFixed(0)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={pointLight}
                          onChange={(e) => handleLightingChange('point', parseFloat(e.target.value))}
                          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Animation Controls */}
                {headInstance ? (
                  <div className="pt-2 border-t border-white/10">
                    <button
                      onClick={() => {
                        console.log('🎭 Animation controls toggle clicked, current state:', animControlsOpen);
                        setAnimControlsOpen(!animControlsOpen);
                      }}
                      className="w-full rounded-lg px-3 py-2 text-sm font-medium bg-gray-700/50 text-white hover:bg-gray-600/50 transition-all"
                    >
                      <span className="mr-2">{animControlsOpen ? '🔽' : '▶️'}</span>
                      Animation Controls
                    </button>
                    
                    {animControlsOpen && (
                      <div className="mt-2">
                        <AvatarAnimationControls 
                          head={headInstance} 
                          isOpen={animControlsOpen}
                          onToggle={() => setAnimControlsOpen(!animControlsOpen)}
                          embedded={true}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="pt-2 border-t border-white/10">
                    <div className="text-xs text-white/30 text-center py-2">
                      Animation controls loading...
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
