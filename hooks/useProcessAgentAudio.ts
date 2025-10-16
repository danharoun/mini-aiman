'use client';

import { Track, type Participant } from 'livekit-client';
import { useRoomContext } from '@livekit/components-react';
import { useEffect, useRef } from 'react';
import type { TalkingHeadInstance } from './useTalkingHead';

/**
 * Hook to process agent audio and drive TalkingHead lipsync using streaming API
 * 
 * Based on TalkingHead documentation:
 * - streamStart(): Initialize streaming mode with AudioWorklet
 * - streamAudio({ audio }): Feed PCM audio chunks
 * - streamNotifyEnd(): Signal end of utterance
 * - streamStop(): Stop streaming
 * 
 * The TalkingHead library will automatically generate visemes from PCM audio data
 * Reference: https://github.com/met4citizen/TalkingHead#streaming-interface
 */
export function useProcessAgentAudio(
  head: TalkingHeadInstance | null,
  agent: Participant | undefined,
  isAgentSpeaking: boolean,
) {
  const room = useRoomContext();
  const audioContextRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamActiveRef = useRef(false);
  const audioChunkCountRef = useRef(0);

  useEffect(() => {
    if (!head || !agent || !room) {
      return;
    }

    const setupAudioStreaming = async () => {
      // Prevent duplicate setup
      if (streamActiveRef.current) {
        console.log('⚠️ Audio streaming already active, skipping setup');
        return;
      }

      try {
        // Get the agent's audio track
        const trackPublication = agent.getTrackPublication(Track.Source.Microphone);
        const audioTrack = trackPublication?.audioTrack;
        
        if (!audioTrack) {
          console.warn('⚠️ No audio track available from agent');
          return;
        }

        const mediaStream = audioTrack.mediaStream;
        if (!mediaStream) {
          console.warn('⚠️ No media stream available from audio track');
          return;
        }

        console.log('🎤 Setting up real-time audio streaming');

        // Create audio context
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!audioContextRef.current) {
          audioContextRef.current = new AudioContext();
        }
        const audioContext = audioContextRef.current;

        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }

        console.log('🎵 AudioContext ready, sample rate:', audioContext.sampleRate);

        // Load the audio worklet processor
        try {
          await audioContext.audioWorklet.addModule('/agent-audio-processor.js');
          console.log('✅ Audio worklet module loaded');
        } catch (e) {
          // Module might already be loaded
          console.log('ℹ️ Audio worklet module already loaded or error:', e);
        }

        // Create audio processing nodes
        const sourceNode = audioContext.createMediaStreamSource(mediaStream);
        sourceNodeRef.current = sourceNode;

        const workletNode = new AudioWorkletNode(audioContext, 'agent-audio-processor');
        workletNodeRef.current = workletNode;

        // Connect: source → worklet (no destination = no playback, just analysis)
        sourceNode.connect(workletNode);

        console.log('🎙️ Starting TalkingHead stream with config:', {
          sampleRate: audioContext.sampleRate,
          lipsyncLang: 'en',
        });

        // Initialize TalkingHead streaming mode
        // IMPORTANT: We're using streaming mode but with gain:0 to disable playback
        // TalkingHead will analyze audio for visemes but won't play it
        const streamConfig = {
          sampleRate: audioContext.sampleRate,
          gain: 0.0, // CRITICAL: Set gain to 0 to disable TalkingHead audio playback
          lipsyncLang: 'en',
          lipsyncType: 'visemes', // Use viseme-based lipsync
          waitForAudioChunks: false, // Process immediately for real-time
        };
        
        console.log('🎙️ TalkingHead stream config:', streamConfig);
        
        head.streamStart(
          streamConfig,
          () => console.log('✅ TalkingHead audio playback started (gain=0, so silent)'),
          () => {
            console.log('⏹️ TalkingHead audio playback ended');
            streamActiveRef.current = false;
          },
          (text: string) => console.log('📝 Subtitle:', text),
          (metrics: any) => console.log('📊 Metrics:', metrics)
        );

        streamActiveRef.current = true;
        audioChunkCountRef.current = 0;

        // Handle incoming audio data from worklet
        workletNode.port.onmessage = (event) => {
          if (streamActiveRef.current && event.data) {
            audioChunkCountRef.current++;
            
            // Log first few chunks for debugging
            if (audioChunkCountRef.current <= 3) {
              const samples = new Float32Array(event.data);
              const avgAmplitude = samples.reduce((sum, val) => sum + Math.abs(val), 0) / samples.length;
              console.log(`🎵 Audio chunk #${audioChunkCountRef.current}`, {
                byteLength: event.data.byteLength,
                sampleCount: samples.length,
                avgAmplitude: avgAmplitude.toFixed(6),
                isValid: avgAmplitude > 0
              });
            }
            
            // Send PCM audio data to TalkingHead
            // The library will automatically generate visemes for lipsync
            try {
              head.streamAudio({ audio: event.data });
            } catch (error) {
              console.error('❌ Error calling streamAudio:', error);
            }
          }
        };

        console.log('🎙️ Audio streaming pipeline fully established');
        
        // Log after 2 seconds to confirm audio is flowing
        setTimeout(() => {
          if (streamActiveRef.current) {
            console.log(`📊 Audio chunks received so far: ${audioChunkCountRef.current}`);
            if (audioChunkCountRef.current === 0) {
              console.warn('⚠️ No audio chunks received! Check if agent is actually speaking.');
            }
          }
        }, 2000);

      } catch (error) {
        console.error('❌ Error setting up audio streaming:', error);
        streamActiveRef.current = false;
        // Clean up partial setup
        if (sourceNodeRef.current) {
          sourceNodeRef.current.disconnect();
          sourceNodeRef.current = null;
        }
        if (workletNodeRef.current) {
          workletNodeRef.current.disconnect();
          workletNodeRef.current = null;
        }
      }
    };

    const cleanupAudioStreaming = () => {
      if (!streamActiveRef.current) {
        return;
      }

      console.log('🧹 Cleaning up audio streaming');

      streamActiveRef.current = false;

      if (sourceNodeRef.current) {
        sourceNodeRef.current.disconnect();
        sourceNodeRef.current = null;
      }

      if (workletNodeRef.current) {
        workletNodeRef.current.port.onmessage = null;
        workletNodeRef.current.disconnect();
        workletNodeRef.current = null;
      }

      if (head) {
        try {
          head.streamNotifyEnd();
          head.streamStop();
          console.log('✅ TalkingHead streaming stopped');
        } catch (e) {
          console.warn('⚠️ Error stopping TalkingHead stream:', e);
        }
      }
    };

    if (isAgentSpeaking) {
      setupAudioStreaming();
    } else {
      cleanupAudioStreaming();
    }

    return cleanupAudioStreaming;
  }, [head, agent, room, isAgentSpeaking]);

  // Cleanup audio context on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, []);
}

