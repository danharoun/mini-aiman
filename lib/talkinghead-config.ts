/**
 * TalkingHead Avatar Configuration
 * Customize these settings for your application
 */

export const TALKINGHEAD_CONFIG = {
  // Avatar settings
  avatar: {
    url: '/aiman.glb',
    body: 'M' as 'M' | 'F',
    defaultMood: 'neutral' as 'neutral' | 'happy' | 'sad' | 'angry' | 'fear' | 'love',
  },

  // Text-to-Speech settings
  tts: {
    // Google Cloud TTS endpoint
    endpoint: 'https://eu-texttospeech.googleapis.com/v1beta1/text:synthesize',
    
    // Get your own API key from: https://cloud.google.com/text-to-speech
    // This is a demo key with limited usage
    apiKey: 'AIzaSyAMl09lXdBrh0nTHBaenhdngxt1sA9aO-M',
    
    // Voice settings
    language: 'en-GB',
    voice: 'en-GB-Standard-C',
    
    // Lip-sync language modules
    lipsyncModules: ['en'],
    lipsyncLang: 'en',
  },

  // Camera settings
  camera: {
    defaultView: 'full' as 'full' | 'mid' | 'upper' | 'head',
    
    // View for chat/conversation mode
    chatView: 'head' as 'full' | 'mid' | 'upper' | 'head',
    
    // View for full-screen display
    showcaseView: 'full' as 'full' | 'mid' | 'upper' | 'head',
  },

  // Animation settings
  animation: {
    // Default gesture duration in seconds
    gestureDuration: 3,
    
    // Default pose duration in seconds
    poseDuration: 5,
    
    // Default look duration in milliseconds
    lookDuration: 3000,
    
    // Eye contact duration in milliseconds
    eyeContactDuration: 5000,
  },

  // LiveKit integration settings
  livekit: {
    // Enable audio streaming for lip-sync
    enableAudioStreaming: false, // Set to true for advanced lip-sync
    
    // Use simple state-based reactions instead
    useSimpleReactions: true,
    
    // Reactions to agent states
    reactions: {
      listening: {
        mood: 'neutral' as const,
        action: 'lookAtCamera' as const,
      },
      thinking: {
        mood: 'neutral' as const,
        gesture: 'thinking' as const,
      },
      speaking: {
        mood: 'happy' as const,
        action: 'makeEyeContact' as const,
        gesture: 'handup' as const,
      },
      idle: {
        mood: 'neutral' as const,
        action: 'lookAhead' as const,
      },
    },
  },

  // Performance settings
  performance: {
    // Enable hardware acceleration (recommended)
    hardwareAcceleration: true,
    
    // Reduce quality for better performance
    lowPowerMode: false,
  },
};

/**
 * Get avatar configuration with optional overrides
 */
export function getAvatarConfig(overrides?: Partial<typeof TALKINGHEAD_CONFIG.avatar>) {
  return {
    ...TALKINGHEAD_CONFIG.avatar,
    ...overrides,
  };
}

/**
 * Get TTS configuration with optional overrides
 */
export function getTTSConfig(overrides?: Partial<typeof TALKINGHEAD_CONFIG.tts>) {
  return {
    ...TALKINGHEAD_CONFIG.tts,
    ...overrides,
  };
}

/**
 * Get camera configuration with optional overrides
 */
export function getCameraConfig(overrides?: Partial<typeof TALKINGHEAD_CONFIG.camera>) {
  return {
    ...TALKINGHEAD_CONFIG.camera,
    ...overrides,
  };
}

/**
 * Get animation configuration with optional overrides
 */
export function getAnimationConfig(overrides?: Partial<typeof TALKINGHEAD_CONFIG.animation>) {
  return {
    ...TALKINGHEAD_CONFIG.animation,
    ...overrides,
  };
}






