'use client';

import { Track, type Participant } from 'livekit-client';
import { useRoomContext } from '@livekit/components-react';
import { useEffect, useRef } from 'react';
import type { TalkingHeadInstance } from './useTalkingHead';

/**
 * Inspired by wawa-lipsync approach:
 * Connect directly to agent's audio track, mute it in LiveKit,
 * and let TalkingHead handle EVERYTHING (audio playback + lipsync)
 */
export function useTalkingHeadAudioLipsync(
  head: TalkingHeadInstance | null,
  agent: Participant | undefined,
  isAgentSpeaking: boolean,
) {
  const room = useRoomContext();
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const destinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const streamActiveRef = useRef(false);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!head || !agent || !room) {
      return;
    }

    const setupAudioLipsync = async () => {
      if (streamActiveRef.current) {
        console.log('⚠️ Audio lipsync already active');
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

        console.log('🎤 Setting up direct audio lipsync (wawa-lipsync style)');

        // CRITICAL: Mute the LiveKit track so RoomAudioRenderer doesn't play it
        if (trackPublication && !trackPublication.isMuted) {
          console.log('🔇 Muting LiveKit agent track (TalkingHead will play audio)');
          trackPublication.setEnabled(false);
        }

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

        // Create audio processing pipeline
        const sourceNode = audioContext.createMediaStreamSource(mediaStream);
        sourceNodeRef.current = sourceNode;

        // Create gain node for volume control
        const gainNode = audioContext.createGain();
        gainNode.gain.value = 1.0; // Normal volume
        gainNodeRef.current = gainNode;

        // Create destination to get clean audio stream
        const destination = audioContext.createMediaStreamDestination();
        destinationRef.current = destination;

        // Connect: source → gain → destination
        sourceNode.connect(gainNode);
        gainNode.connect(destination);

        console.log('🔊 Audio pipeline: source → gain → destination');

        // Create audio element from processed stream
        const audio = new Audio();
        audio.srcObject = destination.stream;
        audio.autoplay = true;
        audio.muted = false; // NOT muted - this plays the audio
        audioElementRef.current = audio;

        // Wait for audio to be ready and play
        audio.onloadedmetadata = async () => {
          try {
            await audio.play();
            console.log('✅ Audio playback started successfully');
          } catch (error) {
            console.error('❌ Failed to play audio:', error);
            // Try again after user interaction
            document.addEventListener('click', async () => {
              try {
                await audio.play();
                console.log('✅ Audio playback started after user interaction');
              } catch (e) {
                console.error('❌ Still failed to play audio:', e);
              }
            }, { once: true });
          }
        };
        
        // Also try to play immediately
        try {
          await audio.play();
          console.log('✅ Audio playback started immediately');
        } catch (error) {
          console.warn('⚠️ Waiting for audio metadata...', error);
        }

        // Initialize TalkingHead streaming mode for lipsync ONLY
        head.streamStart(
          {
            sampleRate: audioContext.sampleRate,
            gain: 0, // Still 0 to prevent TalkingHead from also playing audio
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

        // Feed audio to TalkingHead for lipsync analysis
        const analyzeAudio = async () => {
          if (!streamActiveRef.current) return;

          try {
            // Get audio data using AnalyserNode
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 512;
            sourceNode.connect(analyser);

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Float32Array(bufferLength);

            const processFrame = () => {
              if (!streamActiveRef.current) return;

              analyser.getFloatTimeDomainData(dataArray);
              
              // Create a COPY of the buffer to avoid detachment
              const copy = new Float32Array(dataArray);
              
              // Send audio data to TalkingHead
              head.streamAudio({ audio: copy.buffer });

              requestAnimationFrame(processFrame);
            };

            processFrame();
            console.log('🎙️ Audio analysis pipeline established');
          } catch (error) {
            console.error('❌ Error analyzing audio:', error);
          }
        };

        analyzeAudio();

      } catch (error) {
        console.error('❌ Error setting up audio lipsync:', error);
        streamActiveRef.current = false;
      }
    };

    const cleanupAudioLipsync = () => {
      if (!streamActiveRef.current) return;

      console.log('🧹 Cleaning up audio lipsync');
      streamActiveRef.current = false;

      // Stop audio element
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current.srcObject = null;
        audioElementRef.current = null;
      }

      // Disconnect audio nodes
      if (sourceNodeRef.current) {
        sourceNodeRef.current.disconnect();
        sourceNodeRef.current = null;
      }
      if (gainNodeRef.current) {
        gainNodeRef.current.disconnect();
        gainNodeRef.current = null;
      }
      if (destinationRef.current) {
        destinationRef.current = null;
      }

      // Stop TalkingHead streaming
      if (head) {
        try {
          head.streamStop();
        } catch (e) {
          console.warn('⚠️ Error stopping TalkingHead:', e);
        }
      }

      // Re-enable LiveKit track
      if (agent) {
        const trackPublication = agent.getTrackPublication(Track.Source.Microphone);
        if (trackPublication && trackPublication.isMuted) {
          console.log('🔊 Re-enabling LiveKit agent track');
          trackPublication.setEnabled(true);
        }
      }
    };

    if (isAgentSpeaking) {
      setupAudioLipsync();
    } else {
      cleanupAudioLipsync();
    }

    return cleanupAudioLipsync;
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

