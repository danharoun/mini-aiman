'use client';

import { useEffect, useRef } from 'react';
import {
  useTranscriptions,
  useVoiceAssistant,
  useSpeakingParticipants,
} from '@livekit/components-react';
import type { TalkingHeadInstance } from './useTalkingHead';
import { useTalkingHeadStreaming } from './useTalkingHeadStreaming';

interface UseTalkingHeadTranscriptionOptions {
  head: TalkingHeadInstance | null;
  enabled?: boolean;
}

/**
 * Sync TalkingHead with LiveKit agent using streaming API (Appendix G)
 */
export function useTalkingHeadTranscription({
  head,
  enabled = true,
}: UseTalkingHeadTranscriptionOptions) {
  const transcriptions = useTranscriptions();
  const { state: agentState, agent } = useVoiceAssistant();
  const speakingParticipants = useSpeakingParticipants();

  // Debug logging
  useEffect(() => {
    console.log('🔊 Speaking participants:', speakingParticipants.map((p) => p.identity));
    console.log('🤖 Agent state:', agentState);
    console.log('👤 Agent identity:', agent?.identity);
    console.log('🎭 TalkingHead instance:', !!head);
  }, [speakingParticipants, agentState, agent, head]);

  // Sync mood with agent state
  useEffect(() => {
    if (!head || !enabled) return;

    switch (agentState) {
      case 'listening':
        head.setMood('neutral');
        head.lookAtCamera(2000);
        break;
      case 'thinking':
        head.setMood('neutral');
        break;
      case 'speaking':
        head.setMood('happy');
        head.makeEyeContact(3000);
        break;
    }
  }, [head, enabled, agentState]);

  // Use streaming API for real-time lipsync (Appendix G from TalkingHead README)
  const { streamingActive } = useTalkingHeadStreaming({ head, enabled });

  return {
    agentState,
    transcriptionCount: transcriptions.length,
    streamingActive,
  };
}

