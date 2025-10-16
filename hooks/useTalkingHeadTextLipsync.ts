'use client';

import { useEffect, useRef } from 'react';
import {
  useTranscriptions,
  useVoiceAssistant,
} from '@livekit/components-react';
import type { TalkingHeadInstance } from './useTalkingHead';

/**
 * SIMPLEST APPROACH - Just like the HTML example!
 * Use speakText() with transcriptions - TalkingHead handles EVERYTHING
 * (TTS + audio playback + lipsync generation)
 */
export function useTalkingHeadTextLipsync(
  head: TalkingHeadInstance | null,
  enabled: boolean = true,
) {
  const transcriptions = useTranscriptions();
  const { state: agentState, agent } = useVoiceAssistant();
  const lastSegmentRef = useRef<string>('');
  const isSpeakingRef = useRef(false);

  // Trigger speakText on NEW segments (don't wait for final - they may not come!)
  useEffect(() => {
    console.log('🎤 useTalkingHeadTextLipsync:', {
      hasHead: !!head,
      enabled,
      hasAgent: !!agent,
      agentState,
      transcriptionCount: transcriptions.length,
    });

    if (!head || !enabled || !agent) {
      console.log('⏭️ Skipping - head/enabled/agent missing');
      return;
    }
    
    if (agentState !== 'speaking') {
      console.log('⏭️ Skipping - agent not speaking, state:', agentState);
      // Stop speaking when agent stops
      if (isSpeakingRef.current) {
        console.log('🛑 Stopping TalkingHead speech');
        head.stopSpeaking();
        isSpeakingRef.current = false;
      }
      return;
    }

    if (transcriptions.length === 0) {
      console.log('⏭️ No transcriptions yet');
      return;
    }

    const latest = transcriptions[transcriptions.length - 1];
    const text = latest.text;
    const segmentId = latest.streamInfo?.attributes?.['lk.segment_id'] || Date.now().toString();

    console.log('📝 Transcription:', { text: text?.substring(0, 50), segmentId, lastSegment: lastSegmentRef.current });

    // Call speakText on NEW segments (ignore isFinal since it may never be true)
    if (text && text.trim() && segmentId !== lastSegmentRef.current) {
      lastSegmentRef.current = segmentId;

      console.log('🗣️ CALLING speakText() with segment:', segmentId);
      console.log('📄 Text:', text);
      
      try {
        // Use speakText with avatarMute to get lipsync without duplicate audio
        head.speakText(text, { avatarMute: true });
        isSpeakingRef.current = true;
        console.log('✅ TalkingHead speakText() called with MUTE - lipsync active!');
      } catch (error) {
        console.error('❌ Error calling speakText:', error);
      }
    } else {
      console.log('⏭️ Not calling speakText -', {
        hasText: !!text?.trim(),
        isDuplicate: segmentId === lastSegmentRef.current
      });
    }
  }, [head, enabled, agent, agentState, transcriptions]);

  return {
    agentState,
    transcriptionCount: transcriptions.length,
  };
}

