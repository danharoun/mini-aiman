'use client';

import React, { useRef, useState } from 'react';
import { useTalkingHead } from '@/hooks/useTalkingHead';
import { Container } from '../Container';
import { cn } from '@/lib/utils';

export default function TalkingHeadDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { head, isLoading, isAvatarLoaded, error, setHolographic } = useTalkingHead(containerRef, {
    ttsEndpoint: 'https://eu-texttospeech.googleapis.com/v1beta1/text:synthesize',
    ttsApikey: 'AIzaSyAMl09lXdBrh0nTHBaenhdngxt1sA9aO-M',
    lipsyncModules: ['en'],
    cameraView: 'full',
    holographic: {
      enabled: false,
      color: '#70c1ff',
    },
  });

  const [currentView, setCurrentView] = useState<'full' | 'mid' | 'upper' | 'head'>('full');
  const [currentMood, setCurrentMood] = useState<
    'neutral' | 'happy' | 'sad' | 'angry' | 'fear' | 'love'
  >('neutral');
  const [speechText, setSpeechText] = useState(
    'Hello! I am testing lip synchronization with the Aiman avatar.'
  );
  const [animationUrl, setAnimationUrl] = useState('');
  const [status, setStatus] = useState<{ message: string; type: 'info' | 'success' | 'error' }>({
    message: 'Initializing...',
    type: 'info',
  });
  const [isHolographic, setIsHolographic] = useState(false);
  const [holographicColor, setHolographicColor] = useState('#70c1ff');

  // Load avatar when ready
  React.useEffect(() => {
    if (!head || isAvatarLoaded) return;

    const loadAvatarAsync = async () => {
      try {
        await head.showAvatar({
          url: '/aiman.glb',
          body: 'M',
          avatarMood: 'neutral',
          ttsLang: 'en-GB',
          ttsVoice: 'en-GB-Standard-C',
          lipsyncLang: 'en',
        });
        setStatus({ message: '✓ Avatar loaded! Try the controls to test animations.', type: 'success' });
      } catch (err) {
        setStatus({ message: `❌ Error: ${err}`, type: 'error' });
      }
    };

    loadAvatarAsync();
  }, [head, isAvatarLoaded]);

  const handleViewChange = (view: 'full' | 'mid' | 'upper' | 'head') => {
    if (!head) return;
    head.setView(view);
    setCurrentView(view);
    setStatus({ message: `Camera view: ${view}`, type: 'success' });
  };

  const handleMoodChange = (mood: 'neutral' | 'happy' | 'sad' | 'angry' | 'fear' | 'love') => {
    if (!head) return;
    head.setMood(mood);
    setCurrentMood(mood);
    setStatus({ message: `Mood: ${mood}`, type: 'success' });
  };

  const handlePlayPose = (pose: string) => {
    if (!head) return;
    head.playPose(pose, null, 5);
    setStatus({ message: `Playing pose: ${pose} (5 seconds)`, type: 'success' });
  };

  const handleStopPose = () => {
    if (!head) return;
    head.stopPose();
    setStatus({ message: 'Pose stopped', type: 'success' });
  };

  const handlePlayGesture = (gesture: string) => {
    if (!head) return;
    head.playGesture(gesture, 3);
    setStatus({ message: `Playing gesture: ${gesture} (3 seconds)`, type: 'success' });
  };

  const handleStopGesture = () => {
    if (!head) return;
    head.stopGesture();
    setStatus({ message: 'Gesture stopped', type: 'success' });
  };

  const handleLookAtCamera = () => {
    if (!head) return;
    head.lookAtCamera(3000);
    setStatus({ message: 'Looking at camera (3 seconds)', type: 'success' });
  };

  const handleLookAhead = () => {
    if (!head) return;
    head.lookAhead(3000);
    setStatus({ message: 'Looking ahead (3 seconds)', type: 'success' });
  };

  const handleMakeEyeContact = () => {
    if (!head) return;
    head.makeEyeContact(5000);
    setStatus({ message: 'Making eye contact (5 seconds)', type: 'success' });
  };

  const handleSpeakText = () => {
    if (!head || !speechText) return;
    head.speakText(speechText);
    setStatus({ message: 'Speaking...', type: 'success' });
  };

  const handlePlayAnimation = async () => {
    if (!head || !animationUrl) return;
    try {
      setStatus({ message: `Loading animation: ${animationUrl}...`, type: 'info' });
      await head.playAnimation(
        animationUrl,
        (progress) => {
          if (progress.lengthComputable) {
            const percent = Math.round((progress.loaded / progress.total) * 100);
            setStatus({ message: `Loading animation: ${percent}%`, type: 'info' });
          }
        },
        10, // Duration: 10 seconds
        0, // Animation index
        0.01 // Scale factor (Mixamo uses 100, RPM uses 1)
      );
      setStatus({ message: `Playing animation: ${animationUrl}`, type: 'success' });
    } catch (err) {
      setStatus({ message: `❌ Error loading animation: ${err}`, type: 'error' });
    }
  };

  const handleStopAnimation = () => {
    if (!head) return;
    head.stopAnimation();
    setStatus({ message: 'Animation stopped', type: 'success' });
  };

  const handleHolographicToggle = () => {
    const newState = !isHolographic;
    setIsHolographic(newState);
    setHolographic(newState, holographicColor);
    setStatus({
      message: newState ? '✨ Holographic effect enabled' : 'Holographic effect disabled',
      type: 'success',
    });
  };

  const handleHolographicColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setHolographicColor(newColor);
    if (isHolographic) {
      setHolographic(true, newColor);
    }
  };

  const handleComboDemo = async () => {
    if (!head) return;
    setStatus({ message: 'Starting combo demo...', type: 'success' });

    head.setView('full');
    await sleep(500);

    head.setMood('happy');
    await sleep(500);

    head.playGesture('thumbup', 3);
    head.speakText('Hello! This is a combination demo.');
    await sleep(4000);

    head.setView('head');
    head.speakText('Now you can see my face better for lip sync.');
    await sleep(4000);

    head.setView('full');
    head.playPose('side', null, 3);
    head.speakText('I can also change my pose.');
    await sleep(4000);

    head.setMood('neutral');
    setStatus({ message: 'Demo complete!', type: 'success' });
  };

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const ControlButton = ({
    children,
    onClick,
    active = false,
  }: {
    children: React.ReactNode;
    onClick: () => void;
    active?: boolean;
  }) => (
    <button
      onClick={onClick}
      disabled={!isAvatarLoaded}
      className={cn(
        'rounded px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        active
          ? 'bg-blue-600 text-white hover:bg-blue-700'
          : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
      )}
    >
      {children}
    </button>
  );

  return (
    <div className="grid h-screen grid-cols-[350px_1fr]">
      {/* Controls Panel */}
      <div className="overflow-y-auto border-r border-gray-700 bg-gray-900 p-6">
        <h2 className="mb-4 border-b border-blue-500 pb-2 text-xl font-bold text-blue-400">
          🎮 Animation Playground
        </h2>

        {/* Status */}
        <div
          className={cn(
            'mb-6 rounded border-l-4 p-3 text-sm',
            status.type === 'error' && 'border-red-500 bg-red-950/50 text-red-200',
            status.type === 'success' && 'border-green-500 bg-green-950/50 text-green-200',
            status.type === 'info' && 'border-blue-500 bg-blue-950/50 text-blue-200'
          )}
        >
          {status.message}
        </div>

        {/* Camera View */}
        <div className="mb-6">
          <h3 className="mb-3 text-sm font-semibold text-blue-300">📷 Camera View</h3>
          <div className="grid grid-cols-2 gap-2">
            {(['full', 'mid', 'upper', 'head'] as const).map((view) => (
              <ControlButton
                key={view}
                onClick={() => handleViewChange(view)}
                active={currentView === view}
              >
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </ControlButton>
            ))}
          </div>
        </div>

        {/* Mood */}
        <div className="mb-6">
          <h3 className="mb-3 text-sm font-semibold text-blue-300">😊 Mood</h3>
          <div className="grid grid-cols-2 gap-2">
            {(['neutral', 'happy', 'sad', 'angry', 'fear', 'love'] as const).map((mood) => (
              <ControlButton
                key={mood}
                onClick={() => handleMoodChange(mood)}
                active={currentMood === mood}
              >
                {mood.charAt(0).toUpperCase() + mood.slice(1)}
              </ControlButton>
            ))}
          </div>
        </div>

        {/* Body Pose */}
        <div className="mb-6">
          <h3 className="mb-3 text-sm font-semibold text-blue-300">🧍 Body Pose</h3>
          <div className="grid grid-cols-2 gap-2">
            {['straight', 'side', 'hip', 'wide'].map((pose) => (
              <ControlButton key={pose} onClick={() => handlePlayPose(pose)}>
                {pose.charAt(0).toUpperCase() + pose.slice(1)}
              </ControlButton>
            ))}
          </div>
          <ControlButton onClick={handleStopPose}>Stop Pose</ControlButton>
        </div>

        {/* Gestures */}
        <div className="mb-6">
          <h3 className="mb-3 text-sm font-semibold text-blue-300">👋 Hand Gestures</h3>
          <div className="grid grid-cols-2 gap-2">
            {['handup', 'index', 'ok', 'thumbup', 'thumbdown', 'shrug'].map((gesture) => (
              <ControlButton key={gesture} onClick={() => handlePlayGesture(gesture)}>
                {gesture.charAt(0).toUpperCase() + gesture.slice(1)}
              </ControlButton>
            ))}
          </div>
          <ControlButton onClick={handleStopGesture}>Stop Gesture</ControlButton>
        </div>

        {/* Look Direction */}
        <div className="mb-6">
          <h3 className="mb-3 text-sm font-semibold text-blue-300">👁️ Look Direction</h3>
          <div className="grid grid-cols-2 gap-2">
            <ControlButton onClick={handleLookAtCamera}>At Camera</ControlButton>
            <ControlButton onClick={handleLookAhead}>Ahead</ControlButton>
            <ControlButton onClick={handleMakeEyeContact}>Eye Contact</ControlButton>
          </div>
        </div>

        {/* Speech */}
        <div className="mb-6">
          <h3 className="mb-3 text-sm font-semibold text-blue-300">🗣️ Text-to-Speech</h3>
          <p className="mb-2 text-xs italic text-gray-400">Type text and click Speak to test lip sync</p>
          <textarea
            value={speechText}
            onChange={(e) => setSpeechText(e.target.value)}
            className="mb-2 w-full rounded bg-gray-800 p-2 text-sm text-white"
            rows={3}
            placeholder="Enter text to speak..."
          />
          <ControlButton onClick={handleSpeakText}>Speak</ControlButton>
        </div>

        {/* External Animation */}
        <div className="mb-6">
          <h3 className="mb-3 text-sm font-semibold text-blue-300">🎬 External Animation</h3>
          <p className="mb-2 text-xs italic text-gray-400">Load FBX animation files</p>
          <input
            type="text"
            value={animationUrl}
            onChange={(e) => setAnimationUrl(e.target.value)}
            className="mb-2 w-full rounded bg-gray-800 p-2 text-sm text-white"
            placeholder="Animation URL (e.g., /animations/walking.fbx)"
          />
          <div className="grid grid-cols-2 gap-2">
            <ControlButton onClick={handlePlayAnimation}>Play Animation</ControlButton>
            <ControlButton onClick={handleStopAnimation}>Stop Animation</ControlButton>
          </div>
        </div>

        {/* Holographic Effect */}
        <div className="mb-6">
          <h3 className="mb-3 text-sm font-semibold text-blue-300">✨ Holographic Effect</h3>
          <ControlButton onClick={handleHolographicToggle} active={isHolographic}>
            {isHolographic ? 'Holographic ON' : 'Holographic OFF'}
          </ControlButton>
          {isHolographic && (
            <div className="mt-3 rounded bg-gray-800 p-3">
              <label className="mb-2 block text-xs text-gray-400">Color:</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={holographicColor}
                  onChange={handleHolographicColorChange}
                  className="h-10 w-full cursor-pointer rounded border border-gray-600 bg-gray-700"
                />
                <span className="text-xs text-gray-400">{holographicColor}</span>
              </div>
            </div>
          )}
        </div>

        {/* Combo Demo */}
        <div className="mb-6">
          <h3 className="mb-3 text-sm font-semibold text-blue-300">🎭 Combo Demo</h3>
          <ControlButton onClick={handleComboDemo}>Play Demo Sequence</ControlButton>
        </div>
      </div>

      {/* Avatar Display */}
      <div className="relative bg-gradient-to-br from-gray-900 to-gray-800">
        <div ref={containerRef} className="h-full w-full" />

        {/* Loading Indicator */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-center">
              <div className="mb-4 h-16 w-16 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
              <p className="text-xl text-white">{isAvatarLoaded ? 'Initializing...' : 'Loading Avatar...'}</p>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70">
            <div className="max-w-md rounded-lg bg-red-900/90 p-6 text-center">
              <p className="mb-2 text-2xl font-bold text-white">Error</p>
              <p className="text-red-100">{error}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

