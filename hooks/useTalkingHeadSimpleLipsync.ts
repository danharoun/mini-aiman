'use client';

import { Track, type Participant } from 'livekit-client';
import { useRoomContext } from '@livekit/components-react';
import { useEffect, useRef } from 'react';
import type { TalkingHeadInstance } from './useTalkingHead';

/**
 * SIMPLE APPROACH:
 * - Let LiveKit (RoomAudioRenderer) play the audio normally
 * - Just analyze the audio for lipsync
 * - DON'T mute anything, DON'T create duplicate audio
 */
export function useTalkingHeadSimpleLipsync(
  head: TalkingHeadInstance | null,
  agent: Participant | undefined,
  isAgentSpeaking: boolean,
) {
  const room = useRoomContext();
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamActiveRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!head || !agent || !room) {
      return;
    }

    const setupLipsync = async () => {
      if (streamActiveRef.current) {
        console.log('⚠️ Lipsync already active');
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

        console.log('🎤 Setting up simple lipsync (LiveKit plays audio, we just analyze)');

        // Create audio context for analysis ONLY
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!audioContextRef.current) {
          audioContextRef.current = new AudioContext();
        }
        const audioContext = audioContextRef.current;

        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }

        console.log('🎵 AudioContext ready, sample rate:', audioContext.sampleRate);

        // Create source from agent's audio
        const sourceNode = audioContext.createMediaStreamSource(mediaStream);
        sourceNodeRef.current = sourceNode;

        console.log('🔊 Using ScriptProcessorNode for proper PCM audio extraction');

        // Use ScriptProcessorNode to get RAW PCM audio data
        const bufferSize = 4096;
        const processor = audioContext.createScriptProcessor(bufferSize, 1, 1);

        // Create a GAIN NODE set to 0 as dummy destination for the processor
        // (processor needs to be connected to work, but we don't want to hear THIS stream)
        const dummyGain = audioContext.createGain();
        dummyGain.gain.value = 0; // Silent - prevents hearing the analyzed stream

        // Connect: source → processor → dummyGain → destination
        sourceNode.connect(processor);
        processor.connect(dummyGain);
        dummyGain.connect(audioContext.destination);

        console.log('🔊 Audio pipeline: source → processor → gain(0) (analysis only)');

        // Initialize TalkingHead streaming mode
        // TalkingHead will PLAY the audio (gain=1.0) AND do lipsync
        head.streamStart(
          {
            sampleRate: audioContext.sampleRate,
            gain: 1.0, // NORMAL VOLUME - TalkingHead plays the audio
            lipsyncLang: 'en',
            lipsyncType: 'visemes',
            waitForAudioChunks: false,
          },
          () => console.log('✅ TalkingHead lipsync started'),
          () => {
            console.log('⏹️ TalkingHead lipsync ended');
            streamActiveRef.current = false;
          },
        );

        streamActiveRef.current = true;
        let frameCount = 0;

        // Process audio frames - this gives us PROPER PCM data
        processor.onaudioprocess = (event) => {
          if (!streamActiveRef.current) return;

          // Get input PCM audio data (Float32Array)
          const inputData = event.inputBuffer.getChannelData(0);
          
          // Log first few frames
          if (frameCount < 3) {
            const avgAmplitude = inputData.reduce((sum, val) => sum + Math.abs(val), 0) / inputData.length;
            console.log(`🎵 PCM frame #${frameCount + 1}, samples: ${inputData.length}, amplitude: ${avgAmplitude.toFixed(6)}`);
            frameCount++;
          }
          
          // Create a copy to avoid detachment
          const copy = new Float32Array(inputData);
          
          // Send PROPER PCM audio to TalkingHead
          try {
            head.streamAudio({ audio: copy.buffer });
          } catch (error) {
            if (frameCount < 5) {
              console.error('❌ Error sending audio to TalkingHead:', error);
            }
          }
        };

        console.log('🎙️ PCM audio processing active (LiveKit plays audio)');

      } catch (error) {
        console.error('❌ Error setting up lipsync:', error);
        streamActiveRef.current = false;
      }
    };

    const cleanupLipsync = () => {
      if (!streamActiveRef.current) return;

      console.log('🧹 Cleaning up lipsync');
      streamActiveRef.current = false;

      // Cancel animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      // Disconnect audio nodes
      if (sourceNodeRef.current) {
        sourceNodeRef.current.disconnect();
        sourceNodeRef.current = null;
      }
      if (analyserRef.current) {
        analyserRef.current.disconnect();
        analyserRef.current = null;
      }

      // Stop TalkingHead streaming
      if (head) {
        try {
          head.streamStop();
        } catch (e) {
          console.warn('⚠️ Error stopping TalkingHead:', e);
        }
      }
    };

    if (isAgentSpeaking) {
      setupLipsync();
    } else {
      cleanupLipsync();
    }

    return cleanupLipsync;
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

