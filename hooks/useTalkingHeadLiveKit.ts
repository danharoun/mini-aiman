'use client';

import { useEffect, useRef, useState } from 'react';
import { useRoomContext, useVoiceAssistant } from '@livekit/components-react';
import type { TalkingHeadInstance } from './useTalkingHead';

interface UseTalkingHeadLiveKitOptions {
  head: TalkingHeadInstance | null;
  enabled?: boolean;
  lipsyncLang?: string;
}

/**
 * Hook to integrate TalkingHead avatar with LiveKit audio streaming
 * Handles real-time lip-sync from agent audio
 */
export function useTalkingHeadLiveKit({
  head,
  enabled = true,
  lipsyncLang = 'en',
}: UseTalkingHeadLiveKitOptions) {
  const room = useRoomContext();
  const { state: agentState, agent } = useVoiceAssistant();
  const [isStreaming, setIsStreaming] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamActiveRef = useRef(false);

  // Initialize audio streaming when agent starts speaking
  useEffect(() => {
    if (!head || !enabled || !agent) return;

    const handleAgentSpeaking = () => {
      if (agentState === 'speaking' && !streamActiveRef.current) {
        startAudioStreaming();
      } else if (agentState !== 'speaking' && streamActiveRef.current) {
        stopAudioStreaming();
      }
    };

    const startAudioStreaming = async () => {
      try {
        streamActiveRef.current = true;
        setIsStreaming(true);

        // Initialize streaming session
        head.streamStart(
          {
            sampleRate: 48000,
            lipsyncLang,
            lipsyncType: 'words', // Use word-based lip-sync
            waitForAudioChunks: true,
            mood: 'neutral',
          },
          () => {
            console.log('TalkingHead: Audio playback started');
          },
          () => {
            console.log('TalkingHead: Audio playback ended');
            stopAudioStreaming();
          }
        );

        // Get agent audio track
        const audioTrack = agent.audioTrack;
        if (!audioTrack) {
          console.warn('No audio track available from agent');
          return;
        }

        // Create audio context for processing
        if (!audioContextRef.current) {
          audioContextRef.current = new AudioContext({ sampleRate: 48000 });
        }

        const audioContext = audioContextRef.current;
        const mediaStream = new MediaStream([audioTrack.mediaStreamTrack]);
        const source = audioContext.createMediaStreamSource(mediaStream);

        // Create script processor for real-time audio chunks
        const bufferSize = 4096;
        const processor = audioContext.createScriptProcessor(bufferSize, 1, 1);

        processor.onaudioprocess = (event) => {
          if (!streamActiveRef.current) return;

          const inputData = event.inputBuffer.getChannelData(0);
          
          // Convert Float32Array to 16-bit PCM
          const pcmData = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            const s = Math.max(-1, Math.min(1, inputData[i]));
            pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
          }

          // Send audio chunk to TalkingHead
          head.streamAudio({
            audio: pcmData.buffer,
          });
        };

        source.connect(processor);
        processor.connect(audioContext.destination);

        // Store processor for cleanup
        (processor as any)._cleanup = () => {
          processor.disconnect();
          source.disconnect();
        };

      } catch (error) {
        console.error('Error starting TalkingHead audio streaming:', error);
        stopAudioStreaming();
      }
    };

    const stopAudioStreaming = () => {
      if (!streamActiveRef.current) return;

      streamActiveRef.current = false;
      setIsStreaming(false);

      try {
        head.streamNotifyEnd();
      } catch (error) {
        console.error('Error stopping TalkingHead streaming:', error);
      }
    };

    handleAgentSpeaking();
  }, [head, enabled, agent, agentState, lipsyncLang]);

  // Sync avatar mood with agent state
  useEffect(() => {
    if (!head || !enabled) return;

    switch (agentState) {
      case 'listening':
        head.setMood('neutral');
        head.lookAtCamera(2000);
        break;
      case 'thinking':
        head.setMood('neutral');
        head.playGesture('thinking', 2);
        break;
      case 'speaking':
        head.setMood('happy');
        head.lookAtCamera(3000);
        break;
    }
  }, [head, enabled, agentState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      if (streamActiveRef.current && head) {
        head.streamStop();
      }
    };
  }, [head]);

  return {
    isStreaming,
    agentState,
  };
}

/**
 * Simple integration that uses TTS for lip-sync
 * (Alternative to audio streaming)
 */
export function useTalkingHeadSimple({
  head,
  enabled = true,
}: {
  head: TalkingHeadInstance | null;
  enabled?: boolean;
}) {
  const { state: agentState } = useVoiceAssistant();

  // Sync avatar mood and gestures with agent state
  useEffect(() => {
    if (!head || !enabled) return;

    switch (agentState) {
      case 'listening':
        head.setMood('neutral');
        head.lookAtCamera(2000);
        break;
      case 'thinking':
        head.setMood('neutral');
        head.playGesture('thinking', 2);
        break;
      case 'speaking':
        head.setMood('happy');
        head.makeEyeContact(3000);
        head.playGesture('handup', 3);
        break;
      case 'idle':
        head.setMood('neutral');
        head.lookAhead(2000);
        break;
    }
  }, [head, enabled, agentState]);

  return {
    agentState,
  };
}










