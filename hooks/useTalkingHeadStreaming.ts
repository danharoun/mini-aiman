import { useEffect, useRef } from 'react';
import { useTranscriptions, useVoiceAssistant } from '@livekit/components-react';
import type { TalkingHeadInstance } from './useTalkingHead';

interface UseTalkingHeadStreamingOptions {
  head: TalkingHeadInstance | null;
  enabled?: boolean;
}

/**
 * Stream LiveKit audio to TalkingHead for real-time lipsync using streaming API
 * This uses TalkingHead's streamStart/streamAudio methods (Appendix G)
 */
export function useTalkingHeadStreaming({
  head,
  enabled = true,
}: UseTalkingHeadStreamingOptions) {
  const transcriptions = useTranscriptions();
  const { state: agentState, agent } = useVoiceAssistant();
  const streamingActiveRef = useRef(false);
  const lastSegmentRef = useRef<string>('');
  const lastWordCountRef = useRef(0); // Track how many words we've already sent
  const cumulativeTimeRef = useRef(0); // Track cumulative time for continuous lipsync

  // Initialize streaming session when agent connects
  useEffect(() => {
    if (!head || !enabled || !agent) return;

    console.log('🎬 Initializing TalkingHead streaming session');
    
    try {
      head.streamStart(
        {
          lipsyncLang: 'en', // Use English lipsync
          lipsyncType: 'words', // We'll provide word timings
          waitForAudioChunks: false, // Play lipsync immediately
          gain: 0, // Mute TalkingHead audio (LiveKit plays it)
        },
        () => console.log('🔊 TalkingHead audio started'),
        () => console.log('🔇 TalkingHead audio ended'),
        (text) => console.log('💬 Subtitle:', text),
        (metrics) => console.log('📊 Metrics:', metrics)
      );
      streamingActiveRef.current = true;
      console.log('✅ TalkingHead streaming initialized');
    } catch (error) {
      console.error('❌ Error initializing streaming:', error);
    }

    return () => {
      if (streamingActiveRef.current && head) {
        console.log('🛑 Stopping TalkingHead streaming session');
        head.streamStop();
        streamingActiveRef.current = false;
        lastWordCountRef.current = 0;
        cumulativeTimeRef.current = 0;
      }
    };
  }, [head, enabled, agent]);

  // Send word timings for lipsync when agent is speaking (ONLY NEW WORDS)
  useEffect(() => {
    if (!head || !enabled || !agent || !streamingActiveRef.current) return;
    if (agentState !== 'speaking') return;
    if (transcriptions.length === 0) return;

    const latest = transcriptions[transcriptions.length - 1];
    const text = latest.text;
    const segmentId = latest.streamInfo?.attributes?.['lk.segment_id'] || Date.now().toString();

    if (!text || !text.trim()) {
      return;
    }

    // If this is a NEW segment, reset (but don't interrupt aggressively)
    if (segmentId !== lastSegmentRef.current) {
      if (lastSegmentRef.current !== '') {
        console.log('🔄 New segment detected, transitioning smoothly');
        // Instead of interrupting, we'll call streamNotifyEnd() to signal end of previous utterance
        // This allows TalkingHead to finish current word smoothly before starting new segment
        try {
          head.streamNotifyEnd();
        } catch (error) {
          console.error('❌ Error notifying end:', error);
        }
      }
      lastSegmentRef.current = segmentId;
      lastWordCountRef.current = 0;
      cumulativeTimeRef.current = 0;
    }

    // Split text into words
    const allWords = text.trim().split(/\s+/);
    const previousWordCount = lastWordCountRef.current;

    // Only process NEW words
    if (allWords.length <= previousWordCount) {
      return; // No new words yet
    }

    const newWords = allWords.slice(previousWordCount);
    console.log('➕ New words:', newWords.join(' '), `(${previousWordCount} → ${allWords.length})`);

    try {
      // Create timings for NEW words only
      // Assume average speaking rate of ~3 words per second
      const msPerWord = 333;
      const wtimes: number[] = [];
      const wdurations: number[] = [];
      
      for (let i = 0; i < newWords.length; i++) {
        wtimes.push(cumulativeTimeRef.current);
        wdurations.push(msPerWord);
        cumulativeTimeRef.current += msPerWord;
      }

      // Stream ONLY the new words to TalkingHead
      head.streamAudio({
        audio: new ArrayBuffer(0), // No audio data (LiveKit handles audio)
        words: newWords,
        wtimes,
        wdurations,
      });

      lastWordCountRef.current = allWords.length;
      console.log('✅ Streamed', newWords.length, 'new words for lipsync (total:', allWords.length, ')');
    } catch (error) {
      console.error('❌ Error streaming:', error);
    }
  }, [head, enabled, agent, agentState, transcriptions]);

  // Stop/interrupt when agent stops speaking
  useEffect(() => {
    if (!head || !streamingActiveRef.current) return;
    
    if (agentState !== 'speaking' && lastSegmentRef.current) {
      console.log('🛑 Agent stopped speaking, interrupting lipsync');
      try {
        head.streamInterrupt();
        lastSegmentRef.current = '';
        lastWordCountRef.current = 0;
        cumulativeTimeRef.current = 0;
      } catch (error) {
        console.error('❌ Error interrupting:', error);
      }
    }
  }, [head, agentState]);

  return {
    streamingActive: streamingActiveRef.current,
  };
}

