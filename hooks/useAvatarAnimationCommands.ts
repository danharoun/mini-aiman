'use client';

import { useEffect } from 'react';
import { RoomEvent } from 'livekit-client';
import { useRoomContext } from '@livekit/components-react';
import type { TalkingHeadInstance } from './useTalkingHead';

type AnimationAction = 'ok' | 'high_five' | 'hands_back' | 'wave';

type AnimationPayload = {
  type?: string;
  animation?: AnimationAction;
  gesture?: string;
  duration?: number;
};

const DEFAULT_GESTURE_MAP: Record<AnimationAction, { gesture: string; duration: number }> = {
  ok: { gesture: 'ok', duration: 3 },
  high_five: { gesture: 'handup', duration: 3 },
  hands_back: { gesture: 'shrug', duration: 3 },
  wave: { gesture: 'index', duration: 3 },
};

const textDecoder = new TextDecoder();

export function useAvatarAnimationCommands(
  head: TalkingHeadInstance | null,
  enabled: boolean
) {
  const room = useRoomContext();

  useEffect(() => {
    if (!room || !head || !enabled) {
      return;
    }

    const handleDataReceived = (payload: Uint8Array) => {
      let parsed: AnimationPayload | null = null;

      try {
        parsed = JSON.parse(textDecoder.decode(payload));
      } catch (error) {
        console.warn('Avatar command: failed to parse payload', error);
        return;
      }

      if (!parsed || parsed.type !== 'avatar:animation') {
        return;
      }

      const animation = parsed.animation;
      if (!animation) {
        console.warn('Avatar command missing animation identifier:', parsed);
        return;
      }

      const gestureConfig = DEFAULT_GESTURE_MAP[animation];
      if (!gestureConfig) {
        console.warn('Avatar command uses unsupported animation:', animation);
        return;
      }

      const gestureName = parsed.gesture ?? gestureConfig.gesture;
      const duration = parsed.duration ?? gestureConfig.duration;

      head.playGesture(gestureName, duration);
    };

    room.on(RoomEvent.DataReceived, handleDataReceived);

    return () => {
      room.off(RoomEvent.DataReceived, handleDataReceived);
    };
  }, [room, head, enabled]);
}
