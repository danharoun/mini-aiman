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
  
  // UI visibility state
  const [showUI, setShowUI] = useState(false);
  
  // Holographic state - START WITH HOLOGRAPHIC ENABLED
  const [isHolographic, setIsHolographic] = useState(true);
  const [holographicColor, setHolographicColor] = useState('#70c1ff');
  const [isToggling, setIsToggling] = useState(false);
  
  // Background color state
  const [bgColor, setBgColor] = useState('#000000');

  useDebugMode({
    enabled: process.env.NODE_END !== 'production',
  });

  async function handleSendMessage(message: string) {
    await send(message);
  }

  // Holographic handlers
  const handleHolographicToggle = async () => {
    if (isToggling) return;
    
    const controls = (window as any).talkingHeadHolographicControls;
    console.log('🎮 Holographic toggle clicked, controls:', controls);
    if (controls && controls.toggle) {
      controls.toggle();
    } else {
      console.warn('⚠️ Holographic controls not ready yet');
    }
  };

  const handleHolographicColorChange = (newColor: string) => {
    const controls = (window as any).talkingHeadHolographicControls;
    console.log('🎨 Color change requested:', newColor, 'controls:', controls);
    if (controls && controls.setColor) {
      controls.setColor(newColor);
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

  // Listen for holographic state changes from window.talkingHeadHolographicControls
  useEffect(() => {
    const checkControls = setInterval(() => {
      const controls = (window as any).talkingHeadHolographicControls;
      if (controls) {
        setIsHolographic(controls.isEnabled);
        setHolographicColor(controls.color);
        setIsToggling(controls.isToggling || false);
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

      {/* UI TOGGLE BUTTON - Always visible */}
      <motion.button
        onClick={() => setShowUI(!showUI)}
        className={cn(
          'fixed top-4 right-4 z-[200] rounded-full p-3 backdrop-blur-xl transition-colors',
          showUI ? 'bg-cyan-500/20 text-cyan-400' : 'bg-black/30 text-white/60 hover:text-white'
        )}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {showUI ? (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </motion.button>

      {/* Performance Indicator - Mobile only */}
      <PerformanceIndicator />

      {/* UI PANELS - Only visible when showUI is true */}
      <AnimatePresence>
        {showUI && (
          <>
            {/* Chat Messages */}
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

            {/* Bottom Control Bar */}
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ duration: 0.3 }}
              className="fixed right-0 bottom-0 left-0 z-[150] px-3 pb-safe-bottom pb-3 md:px-6 md:pb-6"
            >
              <div className="mx-auto w-full max-w-4xl backdrop-blur-xl bg-black/40 rounded-2xl p-3 md:p-4 border border-white/10 space-y-3">
                <AgentControlBar
                  capabilities={capabilities}
                  onChatOpenChange={setChatOpen}
                  onSendMessage={handleSendMessage}
                />
                
                {/* Holographic & Background Controls */}
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-white/10">
                  <button
                    onClick={handleHolographicToggle}
                    disabled={isToggling}
                    className={cn(
                      'rounded-full px-3 py-1.5 text-xs md:text-sm font-medium transition-colors',
                      isToggling && 'cursor-not-allowed opacity-50',
                      isHolographic
                        ? 'bg-cyan-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    )}
                  >
                    {isToggling ? '⏳' : isHolographic ? '✨' : '🔲'}
                  </button>
                  
                  {isHolographic && (
                    <input
                      type="color"
                      value={holographicColor}
                      onChange={(e) => handleHolographicColorChange(e.target.value)}
                      className="h-8 w-8 cursor-pointer rounded border border-gray-600 bg-gray-700"
                      title="Holographic Color"
                    />
                  )}
                  
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => handleBgColorChange(e.target.value)}
                    className="h-8 w-8 cursor-pointer rounded border border-gray-600 bg-gray-700"
                    title="Background Color"
                  />
                </div>
              </div>
            </motion.div>

            {/* Animation Controls Sidebar */}
            {animControlsOpen && (
              <motion.div
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                transition={{ duration: 0.3 }}
                className="fixed right-0 top-0 bottom-0 z-[150]"
              >
                <AvatarAnimationControls
                  head={headInstance}
                  isOpen={animControlsOpen}
                  onToggle={() => setAnimControlsOpen(!animControlsOpen)}
                />
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>

      {/* Debug panel - hidden in minimal UI */}
      {showUI && <TranscriptionDebug />}
    </section>
  );
};
