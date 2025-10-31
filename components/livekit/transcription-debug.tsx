'use client';

import { useTranscriptions, useVoiceAssistant } from '@livekit/components-react';

/**
 * Debug component to show transcription data in the UI
 * Place this in your app to see what's happening with transcriptions
 */
export function TranscriptionDebug() {
  const transcriptions = useTranscriptions();
  const { state: agentState } = useVoiceAssistant();

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md rounded-lg bg-black/90 p-4 text-white shadow-lg">
      <h3 className="mb-2 text-sm font-bold">🐛 Transcription Debug</h3>
      
      <div className="space-y-2 text-xs">
        <div>
          <span className="font-semibold">Agent State:</span> {agentState}
        </div>
        
        <div>
          <span className="font-semibold">Transcription Count:</span> {transcriptions.length}
        </div>
        
        {transcriptions.length > 0 && (
          <div>
            <span className="font-semibold">Latest:</span>
            <div className="mt-1 rounded bg-gray-800 p-2">
              <div><strong>Identity:</strong> {transcriptions[transcriptions.length - 1].identity}</div>
              <div><strong>Text:</strong> {transcriptions[transcriptions.length - 1].message?.substring(0, 100)}</div>
              <div><strong>Final:</strong> {transcriptions[transcriptions.length - 1].info?.attributes?.['lk.transcription_final']}</div>
              <div><strong>Segment:</strong> {transcriptions[transcriptions.length - 1].info?.attributes?.['lk.segment_id']}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}












